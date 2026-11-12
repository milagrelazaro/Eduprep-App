import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Image } from 'react-native';
import { Text, Card, Button, Chip, ProgressBar, Modal, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { examService, examResultService } from '../services/firebaseService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { canAccessFullExam } from '../utils/premiumCheck';
import { filterExamsByAccess } from '../data/accessPackages';
import { EXAM_INSTITUTIONS, EXAM_SUBJECTS } from '../constants/examOptions';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';

// Institutions, subjects and topics will be dynamically loaded from Firebase exams
const FALLBACK_INSTITUTIONS = ['UEM', 'UP', 'UCM', 'ISCTEM', 'Unilúrio', 'Universidade Zambeze'];
const FALLBACK_SUBJECTS = ['Matemática', 'Física', 'Química', 'Biologia', 'Português', 'História', 'Geografia', 'Inglês'];

export default function EnhancedSimulatorScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [mode, setMode] = useState<'setup' | 'exam' | 'result'>('setup');
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Setup state
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isTimed, setIsTimed] = useState(true);
  const [availableInstitutions, setAvailableInstitutions] = useState<string[]>(FALLBACK_INSTITUTIONS);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>(FALLBACK_SUBJECTS);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      
      // Buscar TODOS os exames do Firestore (inclui pending e approved)
      const examsQuery = query(
        collection(db, 'exams')
      );
      const examsSnapshot = await getDocs(examsQuery);
      
      if (examsSnapshot.empty) {
        console.log('Nenhum exame encontrado');
        setAvailableExams([]);
        setLoading(false);
        return;
      }
      
      const examsWithQuestions = await Promise.all(
        examsSnapshot.docs.map(async (examDoc) => {
          try {
            const examData = { id: examDoc.id, ...examDoc.data() };
            
            // Buscar itens da subcoleção (questões + blocos de texto)
            const questionsSnapshot = await getDocs(
              collection(db, 'exams', examDoc.id, 'questions')
            );
            
            const items = questionsSnapshot.docs.map(qDoc => ({
              id: qDoc.id,
              ...qDoc.data()
            }));
            
            // Ordenar pela posição definida pelo autor (order), com fallback para createdAt
            items.sort((a: any, b: any) =>
              ((a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)) ||
              ((a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0))
            );
            
            // Blocos de texto viram contexto das questões seguintes (texto-base / divisores)
            let currentContext = '';
            const questions = items.filter((item: any) => {
              if (item.type === 'text') {
                currentContext = item.text || '';
                return false;
              }
              item.contextText = currentContext;
              return true;
            });
            
            return { ...examData, questions };
          } catch (err) {
            console.error(`Erro ao carregar exame ${examDoc.id}:`, err);
            return null;
          }
        })
      );
      
      // Filtrar apenas exames com questões e válidos (rascunhos de cadastro incompleto não aparecem)
      let examsWithValidQuestions = examsWithQuestions.filter(
        (exam: any) => exam && exam.questions && exam.questions.length > 0 && exam.status !== 'draft'
      );

      // Extrair instituições, disciplinas e tópicos dinamicamente dos exames
      const institutionsSet = new Set<string>();
      const subjectsSet = new Set<string>();
      const topicsSet = new Set<string>();
      examsWithValidQuestions.forEach((exam: any) => {
        if (exam.institution) institutionsSet.add(exam.institution);
        if (exam.subject) subjectsSet.add(exam.subject);
        if (exam.questions) {
          exam.questions.forEach((q: any) => {
            if (q.topic) topicsSet.add(q.topic);
          });
        }
      });

      const dynamicInstitutions = Array.from(institutionsSet).sort();
      const dynamicSubjects = Array.from(subjectsSet).sort();
      const dynamicTopics = Array.from(topicsSet).sort();

      if (dynamicInstitutions.length > 0) setAvailableInstitutions(dynamicInstitutions);
      if (dynamicSubjects.length > 0) setAvailableSubjects(dynamicSubjects);
      setAvailableTopics(dynamicTopics);

      // Filtrar por pacote de acesso do utilizador
      const filteredByAccess = filterExamsByAccess(examsWithValidQuestions, user || {});
      console.log(`${filteredByAccess.length} exames disponíveis após filtro de acesso (${examsWithValidQuestions.length} total)`);
      setAvailableExams(filteredByAccess);
      
      // Salvar no AsyncStorage para cache
      await AsyncStorage.setItem('eduprep_exams', JSON.stringify(filteredByAccess));
    } catch (error) {
      console.error('Error loading exams:', error);
      
      // Fallback para AsyncStorage se houver erro
      try {
        const saved = await AsyncStorage.getItem('eduprep_exams');
        if (saved) {
          const exams = JSON.parse(saved);
          setAvailableExams(exams);
        }
      } catch (cacheError) {
        console.error('Error loading from cache:', cacheError);
        setAvailableExams([]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Exam state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [timerActive, setTimerActive] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Configuração de simulado
  const [showExamConfigModal, setShowExamConfigModal] = useState(false);
  const [pendingExam, setPendingExam] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(0); // 0 = todas
  const [customDuration, setCustomDuration] = useState(0); // 0 = usar duração do exame
  const [practiceTopic, setPracticeTopic] = useState('');

  // Select box genérico (tópico, faculdade, disciplina) — Alert/chips evitam scroll gigante
  const [listPicker, setListPicker] = useState<{
    title: string;
    options: { label: string; value: string }[];
    selected: string;
    onSelect: (value: string) => void;
  } | null>(null);

  const QUESTION_COUNT_OPTIONS = [0, 10, 20, 30, 40];
  const DURATION_OPTIONS = [0, 30, 60, 90, 120];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startExamById = (exam: any, config?: { questionCount?: number; duration?: number }) => {
    if (!exam || !exam.questions || exam.questions.length === 0) {
      Alert.alert('Erro', 'Este exame não tem questões disponíveis.');
      return;
    }

    setCurrentExam(exam);
    setSelectedSubject(exam.subject || '');
    setSelectedInstitution(exam.institution || '');
    
    // Aplicar configuração do simulado (nº de questões e duração)
    let questions = exam.questions;
    if (config?.questionCount && config.questionCount > 0 && config.questionCount < questions.length) {
      questions = questions.slice(0, config.questionCount);
    }
    const duration = config?.duration || exam.duration || 90;

    setExamQuestions(questions);
    setMode('exam');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowFeedback(false);
    
    if (isTimed && duration) {
      setTimeLeft(duration * 60);
      setTimerActive(true);
    }
    console.log(`Simulador iniciado: ${exam.institution} - ${exam.subject} (${exam.year}), ${questions.length} questões, duração: ${duration}min`);
  };

  // Teste por Matéria: pratica apenas um tópico específico (ex: Funções Matemáticas)
  const startTopicPractice = (topic: string, count: number) => {
    const allQuestions = availableExams.flatMap((exam: any) =>
      (exam.questions || []).map((q: any) => ({ ...q, examRef: `${exam.subject} - ${exam.institution} (${exam.year})` }))
    );

    const topicQuestions = allQuestions.filter(
      (q: any) => q.topic && q.topic.toLowerCase().trim() === topic.toLowerCase().trim()
    );

    if (topicQuestions.length === 0) {
      Alert.alert('Sem questões', `Não há questões cadastradas para o tópico "${topic}".`);
      return;
    }

    // Embaralhar e limitar ao número escolhido
    const shuffled = [...topicQuestions].sort(() => Math.random() - 0.5);
    const selected = count > 0 ? shuffled.slice(0, count) : shuffled;

    setCurrentExam(null);
    setSelectedSubject(topic);
    setSelectedInstitution('Prática por Matéria');
    setExamQuestions(selected);
    setMode('exam');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowFeedback(false);

    if (isTimed) {
      const duration = customDuration || 30;
      setTimeLeft(duration * 60);
      setTimerActive(true);
    }
    console.log(`Teste por matéria iniciado: ${topic}, ${selected.length} questões`);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(optionIndex);
  };

  const confirmAnswer = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = examQuestions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer }));
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      finishExam();
    }
  };

  const resetSimulator = () => {
    setMode('setup');
    setSelectedInstitution('');
    setSelectedSubject('');
    setSelectedTopic('');
    setFilterSubject('');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(3600);
    setTimerActive(false);
    setExamQuestions([]);
    setCurrentExam(null);
  };

  const finishExam = async () => {
    setTimerActive(false);
    
    const correctCount = examQuestions.filter((q: any) => answers[q.id] === q.correctOption).length;
    const score = Math.round((correctCount / examQuestions.length) * 20);
    const totalTime = (currentExam?.duration || 90) * 60;
    const timeSpent = isTimed ? (totalTime - timeLeft) : 0;
    
    const result = {
      id: Date.now().toString(),
      examId: currentExam?.id || 'exam-' + Date.now(),
      examName: `${selectedSubject} - ${selectedInstitution || 'Geral'}`,
      studentId: user?.id || 'guest',
      score,
      totalQuestions: examQuestions.length,
      correctAnswers: correctCount,
      date: new Date().toISOString(),
      duration: timeSpent,
      analysis: score >= 14 ? 'Excelente desempenho!' : score >= 10 ? 'Bom desempenho, continue praticando.' : 'Precisa melhorar. Revise os conteúdos.',
      answers: examQuestions.map((q: any) => ({
        questionId: q.id,
        selectedOption: answers[q.id] ?? -1,
        correct: answers[q.id] === q.correctOption,
      })),
    };

    try {
      console.log('=== INICIANDO SALVAMENTO NO FIRESTORE ===');
      console.log('User ID:', user?.id || 'guest');
      console.log('Exam ID:', currentExam?.id || 'exam-' + Date.now());
      console.log('Score:', score);
      
      // Salvar no Firestore (sempre salvar, mesmo sem user ou examId)
      const savedResult = await examResultService.saveExamResult({
        userId: user?.id || 'guest',
        userName: user?.name || 'Usuário Anônimo',
        userUniversity: user?.intendedCourse || selectedInstitution || 'N/A',
        examId: currentExam?.id || 'exam-' + Date.now(),
        examName: `${selectedSubject} - ${selectedInstitution || 'Geral'}`,
        subject: selectedSubject,
        score,
        totalQuestions: examQuestions.length,
        correctAnswers: correctCount,
        duration: timeSpent,
        date: new Date().toISOString(),
        analysis: score >= 14 ? 'Excelente!' : score >= 10 ? 'Bom!' : 'Precisa melhorar',
        answers: examQuestions.map((q: any) => ({
          questionId: q.id,
          selectedOption: answers[q.id] ?? -1,
          isCorrect: answers[q.id] === q.correctOption,
        })),
      });
      
      console.log('Resultado salvo com sucesso no Firestore:', savedResult);
      console.log('=== FIM DO SALVAMENTO ===');
    } catch (error) {
      console.error('Error saving result to Firestore:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }

    // Salvar no AsyncStorage para cache
    const saved = await AsyncStorage.getItem('eduprep_exam_results');
    const results = saved ? JSON.parse(saved) : [];
    await AsyncStorage.setItem('eduprep_exam_results', JSON.stringify([result, ...results]));

    setMode('result');
  };

  const openYouTube = (url: string) => {
    Linking.openURL(url);
  };

  // SETUP MODE - Lista de exames reais
  if (mode === 'setup') {
    const normalize = (s: string) =>
      s?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Mostrar todos os exames; aplicar filtros manuais
    let filteredExams = availableExams;

    if (filterInstitution) {
      filteredExams = filteredExams.filter((e: any) =>
        e.institution && normalize(e.institution) === normalize(filterInstitution)
      );
    }
    if (filterSubject) {
      filteredExams = filteredExams.filter((e: any) =>
        e.subject && normalize(e.subject) === normalize(filterSubject)
      );
    }
    if (filterYear) {
      filteredExams = filteredExams.filter((e: any) =>
        String(e.year) === String(filterYear)
      );
    }

    const institutionsForFilter = Array.from(new Set(availableExams.map((e: any) => e.institution).filter(Boolean))).sort();
    const subjectsForFilter = Array.from(new Set(availableExams.map((e: any) => e.subject).filter(Boolean))).sort();
    const yearsForFilter = Array.from(new Set(availableExams.map((e: any) => e.year).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
    // Listas completas: constantes + o que existir nos exames
    const allInstitutions = Array.from(new Set([...EXAM_INSTITUTIONS, ...institutionsForFilter])).sort();
    const allSubjects = Array.from(new Set([...EXAM_SUBJECTS, ...subjectsForFilter])).sort();

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Simulador de Exames</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {filteredExams.length} exame{filteredExams.length !== 1 ? 's' : ''} disponíve{filteredExams.length !== 1 ? 'is' : 'l'}
              </Text>
            </View>
          </View>

          {/* Filtros manuais */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, flex: 1 }}>🎓 Filtros</Text>
                {(filterInstitution || filterSubject || filterYear) && (
                  <TouchableOpacity onPress={() => { setFilterInstitution(''); setFilterSubject(''); setFilterYear(''); }}>
                    <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Limpar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Faculdade — select box com a lista completa */}
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Faculdade:</Text>
                <TouchableOpacity
                  style={styles.topicSelector}
                  onPress={() => setListPicker({
                    title: '🎓 Escolhe a faculdade',
                    options: [{ label: 'Todas', value: '' }, ...allInstitutions.map(i => ({ label: i, value: i }))],
                    selected: filterInstitution,
                    onSelect: setFilterInstitution,
                  })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={filterInstitution ? styles.topicSelectorText : styles.topicSelectorPlaceholder}
                    numberOfLines={1}
                  >
                    {filterInstitution || 'Todas'}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Disciplina — select box com a lista completa */}
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Disciplina:</Text>
                <TouchableOpacity
                  style={styles.topicSelector}
                  onPress={() => setListPicker({
                    title: '📖 Escolhe a disciplina',
                    options: [{ label: 'Todas', value: '' }, ...allSubjects.map(s => ({ label: s, value: s }))],
                    selected: filterSubject,
                    onSelect: setFilterSubject,
                  })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={filterSubject ? styles.topicSelectorText : styles.topicSelectorPlaceholder}
                    numberOfLines={1}
                  >
                    {filterSubject || 'Todas'}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>▼</Text>
                </TouchableOpacity>
              </View>

              {yearsForFilter.length > 1 && (
                <View style={styles.filterContainer}>
                  <Text style={styles.filterLabel}>Ano:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Chip
                      selected={filterYear === ''}
                      onPress={() => setFilterYear('')}
                      style={styles.filterChip}
                    >
                      Todos
                    </Chip>
                    {yearsForFilter.map((year: any) => (
                      <Chip
                        key={String(year)}
                        selected={filterYear === String(year)}
                        onPress={() => setFilterYear(filterYear === String(year) ? '' : String(year))}
                        style={styles.filterChip}
                      >
                        {year}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Modo de exame */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.modeContainer}>
                <TouchableOpacity
                  style={[styles.modeCard, isTimed && styles.modeCardActive]}
                  onPress={() => setIsTimed(true)}
                >
                  <Text style={{ fontSize: 22 }}>⏱️</Text>
                  <Text style={[styles.modeText, isTimed && styles.modeTextActive]}>Com Cronômetro</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeCard, !isTimed && styles.modeCardActive]}
                  onPress={() => setIsTimed(false)}
                >
                  <Text style={{ fontSize: 22 }}>∞</Text>
                  <Text style={[styles.modeText, !isTimed && styles.modeTextActive]}>Sem Limite</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>

          {/* Teste por Matéria */}
          {availableTopics.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>📚 Teste por Matéria</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12, lineHeight: 18 }}>
                  Escolhe um tópico e pratica apenas esse conteúdo (ex: Funções Matemáticas).
                </Text>
                {/* Select box — abre modal com a lista de tópicos (evita scroll gigante no celular) */}
                <TouchableOpacity
                  style={styles.topicSelector}
                  onPress={() => setListPicker({
                    title: '📚 Escolhe o tópico',
                    options: availableTopics.map(t => ({ label: t, value: t })),
                    selected: practiceTopic,
                    onSelect: setPracticeTopic,
                  })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={practiceTopic ? styles.topicSelectorText : styles.topicSelectorPlaceholder}
                    numberOfLines={1}
                  >
                    {practiceTopic || 'Seleciona um tópico…'}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>▼</Text>
                </TouchableOpacity>
                <Button
                  mode="contained"
                  onPress={() => {
                    if (!practiceTopic) {
                      Alert.alert('Escolhe um tópico', 'Seleciona um tópico para praticar.');
                      return;
                    }
                    startTopicPractice(practiceTopic, 0);
                  }}
                  disabled={!practiceTopic}
                  style={styles.startButton}
                  icon="play"
                >
                  Iniciar Teste ({practiceTopic || 'seleciona um tópico'})
                </Button>
              </Card.Content>
            </Card>
          )}

          {/* Lista de Exames */}
          {loading && (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary }}>Carregando exames...</Text>
            </View>
          )}

          {!loading && filteredExams.length === 0 && (
            <Card style={styles.card}>
              <Card.Content style={{ alignItems: 'center', padding: 32 }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>📋</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }}>
                  Nenhum exame encontrado
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
                  Ajusta os filtros ou aguarda novos exames.
                </Text>
              </Card.Content>
            </Card>
          )}

          {!loading && filteredExams.map((exam: any) => (
            <TouchableOpacity
              key={exam.id}
              onPress={() => {
                setPendingExam(exam);
                setQuestionCount(0);
                setCustomDuration(0);
                setShowExamConfigModal(true);
              }}
              activeOpacity={0.7}
            >
              <Card style={styles.examListItem}>
                <Card.Content style={styles.examListItemContent}>
                  <View style={styles.examListItemIconBox}>
                    <Text style={{ fontSize: 22 }}>📝</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.examListItemTitle}>{exam.subject}</Text>
                    <Text style={styles.examListItemSubtitle}>{exam.institution} • {exam.year}</Text>
                    <View style={styles.examListItemMeta}>
                      <View style={styles.examMetaBadge}>
                        <Text style={styles.examMetaText}>📋 {exam.questions?.length || 0} questões</Text>
                      </View>
                      <View style={styles.examMetaBadge}>
                        <Text style={styles.examMetaText}>⏱️ {exam.duration || 90} min</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.examListArrow}>›</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Modal de Configuração do Simulado */}
        <Portal>
          <Modal
            visible={showExamConfigModal}
            onDismiss={() => setShowExamConfigModal(false)}
            contentContainerStyle={styles.configModalContainer}
          >
            <Card>
              <Card.Content>
                <Text style={styles.configModalTitle}>⚙️ Configurar Simulado</Text>
                {pendingExam && (
                  <Text style={styles.configModalSubtitle}>
                    {pendingExam.subject} - {pendingExam.institution} ({pendingExam.year})
                  </Text>
                )}

                <Text style={styles.configLabel}>Número de Questões</Text>
                <View style={styles.chipContainer}>
                  {QUESTION_COUNT_OPTIONS.map((count) => (
                    <Chip
                      key={count}
                      selected={questionCount === count}
                      onPress={() => setQuestionCount(count)}
                      style={[styles.chip, questionCount === count && styles.chipSelected]}
                      textStyle={questionCount === count ? styles.chipTextSelected : styles.chipText}
                    >
                      {count === 0 ? 'Todas' : count}
                    </Chip>
                  ))}
                </View>

                <Text style={styles.configLabel}>Duração</Text>
                <View style={styles.chipContainer}>
                  {DURATION_OPTIONS.map((dur) => (
                    <Chip
                      key={dur}
                      selected={customDuration === dur}
                      onPress={() => setCustomDuration(dur)}
                      style={[styles.chip, customDuration === dur && styles.chipSelected]}
                      textStyle={customDuration === dur ? styles.chipTextSelected : styles.chipText}
                    >
                      {dur === 0 ? 'Padrão' : `${dur} min`}
                    </Chip>
                  ))}
                </View>

                <View style={styles.configModalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowExamConfigModal(false)}
                    style={styles.configModalButton}
                  >
                    Cancelar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setShowExamConfigModal(false);
                      if (pendingExam) {
                        startExamById(pendingExam, {
                          questionCount,
                          duration: customDuration || pendingExam.duration || 90,
                        });
                      }
                    }}
                    style={styles.configModalButton}
                  >
                    Iniciar
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>

          {/* Seletor genérico de lista (tópico, faculdade, disciplina) */}
          <Modal
            visible={!!listPicker}
            onDismiss={() => setListPicker(null)}
            contentContainerStyle={styles.configModalContainer}
          >
            <Card>
              <Card.Content>
                <Text style={styles.configModalTitle}>{listPicker?.title}</Text>
                <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={true}>
                  {listPicker?.options.map((opt) => (
                    <TouchableOpacity
                      key={opt.value || '__all__'}
                      style={[styles.topicOption, listPicker.selected === opt.value && styles.topicOptionSelected]}
                      onPress={() => {
                        listPicker.onSelect(opt.value);
                        setListPicker(null);
                      }}
                    >
                      <Text style={[styles.topicOptionText, listPicker.selected === opt.value && styles.topicOptionTextSelected]}>
                        {opt.label}
                      </Text>
                      {listPicker.selected === opt.value && (
                        <Text style={{ color: colors.primary, fontWeight: '700' }}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Button
                  mode="outlined"
                  onPress={() => setListPicker(null)}
                  style={{ marginTop: spacing.sm }}
                >
                  Fechar
                </Button>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
      </SafeAreaView>
    );
  }

  // EXAM MODE
  if (mode === 'exam') {
    const currentQuestion = examQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctOption;
    const progress = (currentQuestionIndex + 1) / examQuestions.length;

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.examHeader}>
          <View style={styles.examHeaderTop}>
            <TouchableOpacity onPress={() => setShowExitModal(true)} style={{ padding: 8 }}>
              <Text style={{ fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
            <View style={{flex: 1}}>
              <Text style={styles.examTitle}>{selectedSubject}</Text>
              <Text style={styles.examSubtitle}>
                Questão {currentQuestionIndex + 1} de {examQuestions.length}
              </Text>
            </View>
            {isTimed && (
              <View style={styles.timer}>
                <Text style={{ fontSize: 16, marginRight: 4 }}>⏱️</Text>
                <Text style={styles.timerText}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            )}
          </View>
          <ProgressBar progress={progress} color="#4f46e5" style={{height: 4}}/>
        </View>
        <ScrollView contentContainerStyle={styles.examContent}>
          {/* Texto-base / divisor aplicável a esta questão */}
          {currentQuestion.contextText ? (
            <Card style={styles.contextCard}>
              <Card.Content>
                <Text style={styles.contextLabel}>📄 Texto</Text>
                <Text style={styles.contextText}>{currentQuestion.contextText}</Text>
              </Card.Content>
            </Card>
          ) : null}
          <Card style={styles.questionCard}>
            <Card.Content>
              <Text style={styles.questionText}>{currentQuestion.text}</Text>
              {currentQuestion.imageUrl && (
                <View style={styles.questionImageContainer}>
                  <Image
                    source={{ uri: currentQuestion.imageUrl }}
                    style={styles.questionImage}
                    resizeMode="contain"
                  />
                </View>
              )}
              {currentQuestion.topic && (
                <Chip style={styles.topicChip} textStyle={{fontSize: 11}}>
                  {currentQuestion.topic}
                </Chip>
              )}
            </Card.Content>
          </Card>
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === currentQuestion.correctOption;
              const showResult = showFeedback;

              let backgroundColor = '#fff';
              let borderColor = '#e5e7eb';
              let icon = null;

              if (showResult) {
                if (isCorrectOption) {
                  backgroundColor = '#ecfdf5';
                  borderColor = '#10b981';
                  icon = 'check-circle';
                } else if (isSelected && !isCorrect) {
                  backgroundColor = '#fef2f2';
                  borderColor = '#ef4444';
                  icon = 'close-circle';
                }
              } else if (isSelected) {
                backgroundColor = '#eef2ff';
                borderColor = '#4f46e5';
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionCard, { backgroundColor, borderColor }]}
                  onPress={() => handleSelectAnswer(index)}
                  disabled={showFeedback}
                >
                  <View style={styles.optionContent}>
                    <View style={[styles.optionCircle, isSelected && !showResult && styles.optionCircleSelected]}>
                      {showResult && icon ? (<Text style={{ fontSize: 16 }}>{isCorrectOption ? '✓' : '✗'}</Text>) : (<Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>)}
                    </View>
                    <Text style={[styles.optionText, showResult && isCorrectOption && {fontWeight: '600'}]}>{option}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {showFeedback && (<Card style={[styles.feedbackCard, {backgroundColor: isCorrect ? '#ecfdf5' : '#fef2f2'}]}><Card.Content><Text style={[styles.feedbackTitle, {color: isCorrect ? '#10b981' : '#ef4444'}]}>{isCorrect ? currentQuestion.correctFeedback : currentQuestion.incorrectFeedback}</Text><Text style={styles.explanation}>{currentQuestion.explanation}</Text><Button mode="outlined" onPress={() => openYouTube(currentQuestion.learnMoreUrl || '')} icon="youtube" style={styles.youtubeButton} labelStyle={{color: '#ef4444'}}>{isCorrect ? 'Saiba Mais no YouTube' : 'Ver Explicação no YouTube'}</Button></Card.Content></Card>)}
          <View style={styles.actionButtons}>{!showFeedback ? (<Button mode="contained" onPress={confirmAnswer} disabled={selectedAnswer === null} style={styles.confirmButton} contentStyle={{ paddingVertical: 8 }}>Confirmar Resposta</Button>) : (<Button mode="contained" onPress={nextQuestion} style={styles.nextButton} contentStyle={{ paddingVertical: 8 }}>{currentQuestionIndex < examQuestions.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}</Button>)}</View>
        </ScrollView>

        {/* Modal de Confirmação de Saída */}
        <Portal>
          <Modal
            visible={showExitModal}
            onDismiss={() => setShowExitModal(false)}
            contentContainerStyle={styles.exitModalContainer}
          >
            <Card>
              <Card.Content>
                <Text style={styles.exitModalTitle}>Sair do Simulado</Text>
                <Text style={styles.exitModalText}>
                  Deseja realmente sair? Seu progresso será perdido.
                </Text>
                <View style={styles.exitModalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowExitModal(false)}
                    style={styles.exitModalButton}
                  >
                    Cancelar
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor="#ef4444"
                    onPress={() => {
                      setShowExitModal(false);
                      resetSimulator();
                    }}
                    style={styles.exitModalButton}
                  >
                    Sair
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
      </SafeAreaView>
    );
  }

  // RESULT MODE
  const correctCount = examQuestions.filter(q => answers[q.id] === q.correctOption).length;
  const score = Math.round((correctCount / examQuestions.length) * 20);
  const percentage = (correctCount / examQuestions.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.resultContent}>
        <View style={styles.resultHeader}>
          <View style={[styles.scoreCircle, {backgroundColor: score >= 14 ? '#ecfdf5' : score >= 10 ? '#fef3c7' : '#fef2f2'}]}>
            <Text style={[styles.scoreValue, {color: score >= 14 ? '#10b981' : score >= 10 ? '#f59e0b' : '#ef4444'}]}>
              {score}
            </Text>
            <Text style={styles.scoreMax}>/20</Text>
          </View>
          <Text variant="headlineSmall" style={styles.resultTitle}>
            {score >= 14 ? '🎉 Excelente!' : score >= 10 ? '👍 Bom Trabalho!' : '📚 Continue Estudando!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            Você acertou {correctCount} de {examQuestions.length} questões ({(percentage || 0).toFixed(0)}%)
          </Text>
        </View>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>📊 Análise de Desempenho</Text>
            <View style={styles.statsGrid}><View style={styles.statItem}><Text style={styles.statValue}>{correctCount}</Text><Text style={styles.statLabel}>Acertos</Text></View><View style={styles.statItem}><Text style={[styles.statValue, {color: '#ef4444'}]}>{examQuestions.length - correctCount}</Text><Text style={styles.statLabel}>Erros</Text></View><View style={styles.statItem}><Text style={styles.statValue}>{(percentage || 0).toFixed(0)}%</Text><Text style={styles.statLabel}>Aproveitamento</Text></View></View>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>💡 Recomendações</Text>
            <Text style={styles.recommendationText}>
              {score >= 14
                ? 'Parabéns! Você está muito bem preparado. Continue praticando para manter o nível.'
                : score >= 10
                ? 'Bom desempenho! Revise os tópicos onde errou para melhorar ainda mais.'
                : 'Você precisa estudar mais. Revise os conteúdos e pratique mais simulados.'}
            </Text>
          </Card.Content>
        </Card>

        {/* Revisão de Respostas */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>📝 Revisão de Respostas</Text>
            {examQuestions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctOption;
              return (
                <View key={question.id} style={[styles.reviewItem, {borderLeftColor: isCorrect ? '#10b981' : '#ef4444'}]}><View style={styles.reviewHeader}><Text style={styles.reviewQuestionNumber}>Questão {index + 1}</Text><View style={[styles.reviewBadge, {backgroundColor: isCorrect ? '#ecfdf5' : '#fef2f2'}]}><Text style={[styles.reviewBadgeText, {color: isCorrect ? '#10b981' : '#ef4444'}]}>{isCorrect ? '✓ Correta' : '✗ Incorreta'}</Text></View></View><Text style={styles.reviewQuestionText}>{question.text}</Text>
                  <View style={styles.reviewAnswers}>{question.options.map((option: string, optIndex: number) => (<View key={optIndex} style={[styles.reviewOption, optIndex === question.correctOption && styles.correctOptionStyle, userAnswer === optIndex && optIndex !== question.correctOption && styles.incorrectOptionStyle]}><Text style={[styles.reviewOptionText, optIndex === question.correctOption && styles.correctOptionText, userAnswer === optIndex && optIndex !== question.correctOption && styles.incorrectOptionText]}>{option}</Text>{optIndex === question.correctOption && (<Text style={styles.correctIndicator}>✓</Text>)}{userAnswer === optIndex && optIndex !== question.correctOption && (<Text style={styles.incorrectIndicator}>✗</Text>)}</View>))}</View>{question.explanation && (<View style={styles.explanationBox}><Text style={styles.explanationLabel}>Explicação:</Text><Text style={styles.explanationText}>{question.explanation}</Text></View>)}
                </View>
              );
            })}
          </Card.Content>
        </Card>

        <View style={styles.resultActions}><Button mode="outlined" onPress={resetSimulator} style={styles.resultButton}>Novo Simulado</Button><Button mode="contained" onPress={() => currentExam && startExamById(currentExam)} style={styles.resultButton}>Tentar Novamente</Button></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  
  // Header estilo Yango
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  cardContent: {
    padding: spacing.lg,
  },
  
  // Progress Card
  progressCard: {
    marginBottom: spacing.lg,
  },
  progressCardContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  progressItems: {
    gap: spacing.md,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Cards
  card: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  
  // Selection Cards
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.grayLight,
  },

  // Filter
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.sm,
    backgroundColor: colors.grayLight,
  },

  // Exam List Items
  examListItem: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  examListItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  examListItemIconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examListItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  examListItemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  examListItemMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  examMetaBadge: {
    backgroundColor: colors.grayLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  examMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  examListArrow: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.textTertiary,
  },
  
  // Mode Selection
  modeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  modeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.primary,
  },
  
  // Start Button
  startButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  
  // Exam Mode
  examHeader: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    padding: spacing.md,
  },
  examHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  examSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
  },
  
  // Question Card
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  contextCard: {
    backgroundColor: '#fffbeb',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#fde68a',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  contextText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 22,
  },
  examContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  questionImageContainer: {
    marginVertical: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.grayLight,
  },
  questionImage: {
    width: '100%',
    height: 200,
  },
  topicChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
  },
  
  // Options
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  optionCard: {
    borderRadius: borderRadius.md,
    borderWidth: 2,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  
  // Exit Modal
  exitModalContainer: {
    padding: spacing.lg,
  },
  exitModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  exitModalText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  exitModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  exitModalButton: {
    flex: 1,
  },

  // Select box de tópico (Teste por Matéria)
  topicSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  topicSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  topicSelectorPlaceholder: {
    fontSize: 14,
    color: colors.textTertiary,
    flex: 1,
    marginRight: 8,
  },
  topicOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
    backgroundColor: colors.grayLight,
  },
  topicOptionSelected: {
    backgroundColor: colors.primary + '18',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  topicOptionText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  topicOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Config Modal (Simulado)
  configModalContainer: {
    padding: spacing.lg,
  },
  configModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  configModalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  configLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  configModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  configModalButton: {
    flex: 1,
  },

  // Chips selecionados
  chipSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },

  // Feedback
  feedbackCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  explanation: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  youtubeButton: {
    borderColor: colors.error,
  },
  
  // Action Buttons
  actionButtons: {
    marginBottom: spacing.lg,
  },
  confirmButton: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  nextButton: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.success,
  },
  
  // Result
  resultContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.success,
  },
  scoreMax: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  resultTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.success,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  resultActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  resultButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  
  // Review
  reviewItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.grayLight,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewQuestionNumber: {
    fontWeight: '700',
    color: colors.textPrimary,
    fontSize: 14,
  },
  reviewBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  reviewBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reviewQuestionText: {
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  reviewAnswers: {
    gap: spacing.sm,
  },
  reviewOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.grayLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correctOptionStyle: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.success,
  },
  incorrectOptionStyle: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
  },
  reviewOptionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  correctOptionText: {
    fontWeight: '600',
    color: colors.success,
  },
  incorrectOptionText: {
    color: colors.error,
  },
  correctIndicator: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '700',
  },
  incorrectIndicator: {
    color: colors.error,
    fontSize: 18,
    fontWeight: '700',
  },
  explanationBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.md,
  },
  explanationLabel: {
    fontWeight: '700',
    color: colors.warning,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  explanationText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
});
