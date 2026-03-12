import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text, Card, IconButton, Button, Chip, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

const INSTITUTIONS = ['UEM', 'UP', 'UCM', 'ISCTEM', 'Unilúrio', 'Universidade Zambeze'];
const SUBJECTS = ['Matemática', 'Física', 'Química', 'Biologia', 'Português', 'História', 'Geografia', 'Inglês'];
const TOPICS = {
  'Matemática': ['Álgebra', 'Geometria', 'Trigonometria', 'Cálculo', 'Estatística'],
  'Física': ['Mecânica', 'Termodinâmica', 'Eletromagnetismo', 'Óptica', 'Ondas'],
  'Química': ['Química Orgânica', 'Química Inorgânica', 'Físico-Química', 'Estequiometria'],
  'Biologia': ['Citologia', 'Genética', 'Ecologia', 'Evolução', 'Anatomia'],
  'Português': ['Gramática', 'Literatura', 'Interpretação de Texto', 'Redação'],
};

// Questions will be loaded from selected exam

export default function EnhancedSimulatorScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [mode, setMode] = useState<'setup' | 'exam' | 'result'>('setup');
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  
  // Setup state
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isTimed, setIsTimed] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    const saved = await AsyncStorage.getItem('eduprep_exams');
    if (saved) {
      const exams = JSON.parse(saved);
      const approved = exams.filter((e: any) => e.status === 'approved');
      setAvailableExams(approved);
    }
  };
  
  // Exam state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [timerActive, setTimerActive] = useState(false);

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

  const startExam = () => {
    if (!selectedSubject) {
      Alert.alert('Erro', 'Por favor, selecione uma disciplina.');
      return;
    }

    // Find matching exam
    let matchingExam = availableExams.find((exam: any) => {
      const matchesInstitution = !selectedInstitution || exam.institution === selectedInstitution;
      const matchesSubject = exam.subject === selectedSubject;
      return matchesInstitution && matchesSubject;
    });

    if (!matchingExam) {
      Alert.alert('Aviso', 'Nenhum exame encontrado para esta combinação. Usando exame genérico.');
      matchingExam = availableExams.find((e: any) => e.subject === selectedSubject) || availableExams[0];
    }

    if (!matchingExam || !matchingExam.questions || matchingExam.questions.length === 0) {
      Alert.alert('Erro', 'Nenhum exame disponível. Por favor, crie exames primeiro.');
      return;
    }

    setCurrentExam(matchingExam);
    
    // Filter questions by topic if selected
    let questions = matchingExam.questions;
    if (selectedTopic) {
      questions = questions.filter((q: any) => q.topic === selectedTopic);
    }
    
    if (questions.length === 0) {
      Alert.alert('Erro', 'Nenhuma questão encontrada para este tema.');
      return;
    }

    setExamQuestions(questions);
    setMode('exam');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowFeedback(false);
    
    if (isTimed) {
      setTimeLeft(questions.length * 120); // 2 min per question
      setTimerActive(true);
    }
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

  const finishExam = async () => {
    setTimerActive(false);
    
    const correctCount = examQuestions.filter(q => answers[q.id] === q.correctOption).length;
    const score = Math.round((correctCount / examQuestions.length) * 20);
    
    const result = {
      id: Date.now().toString(),
      examId: currentExam?.id || 'exam-' + Date.now(),
      examName: `${selectedSubject} - ${selectedInstitution || 'Geral'}`,
      studentId: user?.id || 'guest',
      score,
      totalQuestions: examQuestions.length,
      correctAnswers: correctCount,
      date: new Date().toISOString(),
      duration: isTimed ? (examQuestions.length * 120 - timeLeft) : 0,
      analysis: score >= 14 ? 'Excelente desempenho!' : score >= 10 ? 'Bom desempenho, continue praticando.' : 'Precisa melhorar. Revise os conteúdos.',
      answers: examQuestions.map(q => ({
        questionId: q.id,
        selectedOption: answers[q.id] ?? -1,
        correct: answers[q.id] === q.correctOption,
      })),
    };

    const saved = await AsyncStorage.getItem('eduprep_exam_results');
    const results = saved ? JSON.parse(saved) : [];
    await AsyncStorage.setItem('eduprep_exam_results', JSON.stringify([result, ...results]));

    setMode('result');
  };

  const openYouTube = (url: string) => {
    Linking.openURL(url);
  };

  const resetSimulator = () => {
    setMode('setup');
    setSelectedInstitution('');
    setSelectedSubject('');
    setSelectedTopic('');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(3600);
    setTimerActive(false);
    setExamQuestions([]);
    setCurrentExam(null);
  };

  // SETUP MODE
  if (mode === 'setup') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <Text variant="headlineSmall" style={styles.title}>Simulador de Exames</Text>
            <View style={{ width: 48 }} />
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>🎓 Universidade</Text>
              <View style={styles.chipContainer}>
                {INSTITUTIONS.map(inst => (
                  <Chip
                    key={inst}
                    selected={selectedInstitution === inst}
                    onPress={() => setSelectedInstitution(inst)}
                    style={styles.chip}
                  >
                    {inst}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>📚 Disciplina</Text>
              <View style={styles.chipContainer}>
                {SUBJECTS.map(subj => (
                  <Chip
                    key={subj}
                    selected={selectedSubject === subj}
                    onPress={() => {
                      setSelectedSubject(subj);
                      setSelectedTopic('');
                    }}
                    style={styles.chip}
                  >
                    {subj}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {selectedSubject && TOPICS[selectedSubject as keyof typeof TOPICS] && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>🎯 Tema (Opcional)</Text>
                <View style={styles.chipContainer}>
                  <Chip
                    selected={selectedTopic === ''}
                    onPress={() => setSelectedTopic('')}
                    style={styles.chip}
                  >
                    Todos os Temas
                  </Chip>
                  {TOPICS[selectedSubject as keyof typeof TOPICS].map(topic => (
                    <Chip
                      key={topic}
                      selected={selectedTopic === topic}
                      onPress={() => setSelectedTopic(topic)}
                      style={styles.chip}
                    >
                      {topic}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>⏱️ Modo de Exame</Text>
              <View style={styles.modeContainer}>
                <TouchableOpacity
                  style={[styles.modeCard, isTimed && styles.modeCardActive]}
                  onPress={() => setIsTimed(true)}
                >
                  <IconButton icon="clock-outline" iconColor={isTimed ? '#4f46e5' : '#9ca3af'} />
                  <Text style={[styles.modeText, isTimed && styles.modeTextActive]}>Com Cronômetro</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeCard, !isTimed && styles.modeCardActive]}
                  onPress={() => setIsTimed(false)}
                >
                  <IconButton icon="infinity" iconColor={!isTimed ? '#4f46e5' : '#9ca3af'} />
                  <Text style={[styles.modeText, !isTimed && styles.modeTextActive]}>Sem Limite</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={startExam}
            disabled={!selectedSubject}
            style={styles.startButton}
            contentStyle={{ paddingVertical: 8 }}
          >
            Iniciar Simulado
          </Button>
        </ScrollView>
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
            <IconButton icon="close" onPress={() => {
              Alert.alert('Sair do Simulado', 'Deseja realmente sair? Seu progresso será perdido.', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', onPress: resetSimulator, style: 'destructive' },
              ]);
            }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.examTitle}>{selectedSubject}</Text>
              <Text style={styles.examSubtitle}>
                Questão {currentQuestionIndex + 1} de {examQuestions.length}
              </Text>
            </View>
            {isTimed && (
              <View style={styles.timer}>
                <IconButton icon="clock-outline" iconColor="#f97316" size={16} style={{ margin: 0 }} />
                <Text style={styles.timerText}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            )}
          </View>
          <ProgressBar progress={progress} color="#4f46e5" style={{ height: 4 }} />
        </View>

        <ScrollView contentContainerStyle={styles.examContent}>
          <Card style={styles.questionCard}>
            <Card.Content>
              <Text style={styles.questionText}>{currentQuestion.text}</Text>
              {currentQuestion.topic && (
                <Chip style={styles.topicChip} textStyle={{ fontSize: 11 }}>
                  {currentQuestion.topic}
                </Chip>
              )}
            </Card.Content>
          </Card>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
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
                      {showResult && icon ? (
                        <IconButton
                          icon={icon}
                          iconColor={isCorrectOption ? '#10b981' : '#ef4444'}
                          size={20}
                          style={{ margin: 0 }}
                        />
                      ) : (
                        <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
                      )}
                    </View>
                    <Text style={[styles.optionText, showResult && isCorrectOption && { fontWeight: '600' }]}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {showFeedback && (
            <Card style={[styles.feedbackCard, { backgroundColor: isCorrect ? '#ecfdf5' : '#fef2f2' }]}>
              <Card.Content>
                <Text style={[styles.feedbackTitle, { color: isCorrect ? '#10b981' : '#ef4444' }]}>
                  {isCorrect ? currentQuestion.correctFeedback : currentQuestion.incorrectFeedback}
                </Text>
                <Text style={styles.explanation}>{currentQuestion.explanation}</Text>
                <Button
                  mode="outlined"
                  onPress={() => openYouTube(currentQuestion.learnMoreUrl || '')}
                  icon="youtube"
                  style={styles.youtubeButton}
                  labelStyle={{ color: '#ef4444' }}
                >
                  {isCorrect ? 'Saiba Mais no YouTube' : 'Ver Explicação no YouTube'}
                </Button>
              </Card.Content>
            </Card>
          )}

          <View style={styles.actionButtons}>
            {!showFeedback ? (
              <Button
                mode="contained"
                onPress={confirmAnswer}
                disabled={selectedAnswer === null}
                style={styles.confirmButton}
                contentStyle={{ paddingVertical: 8 }}
              >
                Confirmar Resposta
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={nextQuestion}
                style={styles.nextButton}
                contentStyle={{ paddingVertical: 8 }}
              >
                {currentQuestionIndex < examQuestions.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}
              </Button>
            )}
          </View>
        </ScrollView>
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
          <View style={[styles.scoreCircle, { backgroundColor: score >= 14 ? '#ecfdf5' : score >= 10 ? '#fef3c7' : '#fef2f2' }]}>
            <Text style={[styles.scoreValue, { color: score >= 14 ? '#10b981' : score >= 10 ? '#f59e0b' : '#ef4444' }]}>
              {score}
            </Text>
            <Text style={styles.scoreMax}>/20</Text>
          </View>
          <Text variant="headlineSmall" style={styles.resultTitle}>
            {score >= 14 ? '🎉 Excelente!' : score >= 10 ? '👍 Bom Trabalho!' : '📚 Continue Estudando!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            Você acertou {correctCount} de {examQuestions.length} questões ({percentage.toFixed(0)}%)
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>📊 Análise de Desempenho</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{correctCount}</Text>
                <Text style={styles.statLabel}>Acertos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>{examQuestions.length - correctCount}</Text>
                <Text style={styles.statLabel}>Erros</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{percentage.toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Aproveitamento</Text>
              </View>
            </View>
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
                : 'Você precisa estudar mais. Recomendamos buscar ajuda de um tutor especializado.'}
            </Text>
            {score < 14 && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Marketplace' as never)}
                icon="account-group"
                style={{ marginTop: 12, backgroundColor: '#4f46e5' }}
              >
                Encontrar Tutor Especializado
              </Button>
            )}
          </Card.Content>
        </Card>

        <View style={styles.resultActions}>
          <Button
            mode="outlined"
            onPress={resetSimulator}
            style={styles.resultButton}
          >
            Novo Simulado
          </Button>
          <Button
            mode="contained"
            onPress={startExam}
            style={styles.resultButton}
          >
            Tentar Novamente
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f3f4f6',
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  modeCardActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeTextActive: {
    color: '#4f46e5',
  },
  startButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
  },
  examHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  examHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  examSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f97316',
  },
  examContent: {
    padding: 16,
  },
  questionCard: {
    marginBottom: 20,
    borderRadius: 12,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 26,
    marginBottom: 12,
  },
  topicChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  optionCircleSelected: {
    borderColor: '#4f46e5',
    backgroundColor: '#4f46e5',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  feedbackCard: {
    marginBottom: 20,
    borderRadius: 12,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  explanation: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  youtubeButton: {
    borderColor: '#ef4444',
  },
  actionButtons: {
    marginBottom: 20,
  },
  confirmButton: {
    borderRadius: 12,
    backgroundColor: '#4f46e5',
  },
  nextButton: {
    borderRadius: 12,
    backgroundColor: '#10b981',
  },
  resultContent: {
    padding: 16,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
  },
  resultTitle: {
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resultButton: {
    flex: 1,
    borderRadius: 12,
  },
});
