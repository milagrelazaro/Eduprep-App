import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, Card, Button, TextInput, Chip, IconButton, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, deleteDoc, doc, getDoc, getDocs, query, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { examService, userService } from '../services/firebaseService';
import { notificationService } from '../services/notificationService';
import { auditService } from '../services/auditService';
import { EXAM_SUBJECTS, EXAM_INSTITUTIONS } from '../constants/examOptions';
import { colors, borderRadius, spacing, shadows } from '../theme/colors';

interface Question {
  id: string;
  text: string;
  imageUri?: string;
  imageUrl?: string;
  options: string[];
  correctOption: number;
  explanation: string;
  topic: string;
}

// Bloco de texto/divisor inserido entre questões (ex: texto-base, "Parte I", instruções)
interface TextBlock {
  id: string;
  type: 'text';
  text: string;
}

// Lista ordenada do exame: questões e blocos de texto intercalados
// docId = já gravado na DB (Firestore doc id); dirty = gravado mas editado depois
type ExamListItem = ((Question & { type: 'question' }) | TextBlock) & { docId?: string; dirty?: boolean };

// Timeout para escritas no Firestore — sem isto um addDoc pode ficar pendente
// para sempre quando a rede falha, deixando o ecrã a "processar" sem parar
const withTimeout = <T,>(promise: Promise<T>, ms = 20000): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout: rede lenta ou offline')), ms);
    promise.then(
      v => { clearTimeout(timer); resolve(v); },
      e => { clearTimeout(timer); reject(e); }
    );
  });

export default function CreateExamManualScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuthStore();
  const isPromoter = user?.role === UserRole.PROMOTER;
  
  // Dados do exame
  const [institution, setInstitution] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [duration, setDuration] = useState('90');
  const [source, setSource] = useState('');
  const [usageRights, setUsageRights] = useState('Público');

  const USAGE_RIGHTS_OPTIONS = ['Público', 'Autorizado', 'Uso interno'];
  
  // Itens do exame (questões + blocos de texto, na ordem em que aparecem)
  const [questions, setQuestions] = useState<ExamListItem[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Bloco de texto/divisor
  const [showTextModal, setShowTextModal] = useState(false);
  const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);
  const [currentText, setCurrentText] = useState('');

  // Inserção de símbolos matemáticos: campo alvo e posição do cursor
  const [activeField, setActiveField] = useState<string | null>(null);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const fieldSelections = useRef<{ [key: string]: { start: number; end: number } }>({});

  const SYMBOL_GROUPS: { label: string; symbols: string[] }[] = [
    { label: 'Agrupamento', symbols: ['( )', '[ ]', '{ }', '|x|', '⟨ ⟩'] },
    { label: 'Operadores', symbols: ['+', '−', '×', '÷', '±', '∓', '·', '∗', '/', '='] },
    { label: 'Comparação', symbols: ['≠', '≈', '≡', '<', '>', '≤', '≥', '≪', '≫', '∝'] },
    { label: 'Potências e Raízes', symbols: ['²', '³', 'ⁿ', '⁻¹', 'ˣ', 'ʸ', '√', '∛', '∜', '^'] },
    { label: 'Frações e Percentagem', symbols: ['½', '⅓', '¼', '¾', '⁄', '%', '‰'] },
    { label: 'Funções e Cálculo', symbols: ['∑', '∏', '∫', '∂', '∞', 'lim', '→', '←', '↔', '⇒', '⇔', '°', '′', '″'] },
    { label: 'Conjuntos e Lógica', symbols: ['∈', '∉', '⊂', '⊆', '∪', '∩', '∅', '∧', '∨', '¬', '∀', '∃', '∴', 'ℝ', 'ℕ', 'ℤ', 'ℚ'] },
    { label: 'Geometria', symbols: ['∠', '⊥', '∥', '≅', '~', '△', '▱', '°'] },
    { label: 'Letras Gregas', symbols: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'ρ', 'σ', 'φ', 'ω', 'Δ', 'Σ', 'Π', 'Ω'] },
  ];

  // Ícone ∑ dentro de cada campo — abre o seletor de símbolos
  const symbolIcon = (fieldKey: string) => (
    <TextInput.Icon
      icon="function-variant"
      onPress={() => {
        setActiveField(fieldKey);
        setShowSymbolPicker(true);
      }}
    />
  );

  // Insere símbolo na posição do cursor do campo alvo (ou no fim)
  const insertSymbol = (symbol: string) => {
    if (!activeField) {
      setShowSymbolPicker(false);
      return;
    }
    const sel = fieldSelections.current[activeField];
    const insert = (value: string) =>
      sel ? value.slice(0, sel.start) + symbol + value.slice(sel.end) : value + symbol;

    if (activeField === 'question') {
      setCurrentQuestion(q => ({ ...q, text: insert(q.text) }));
    } else if (activeField === 'explanation') {
      setCurrentQuestion(q => ({ ...q, explanation: insert(q.explanation) }));
    } else if (activeField === 'topic') {
      setCurrentQuestion(q => ({ ...q, topic: insert(q.topic) }));
    } else if (activeField === 'textblock') {
      setCurrentText(prev => insert(prev));
    } else if (activeField.startsWith('opt-')) {
      const idx = parseInt(activeField.slice(4));
      const opts = [...currentQuestion.options];
      opts[idx] = insert(opts[idx]);
      setCurrentQuestion({ ...currentQuestion, options: opts });
    }
    setShowSymbolPicker(false);
  };

  const onFieldSelect = (key: string, selection: { start: number; end: number }) => {
    fieldSelections.current[key] = selection;
  };
  
  // Questão atual sendo editada
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    text: '',
    imageUri: undefined,
    options: ['', '', '', '', ''],
    correctOption: 0,
    explanation: '',
    topic: '',
  });
  
  const [saving, setSaving] = useState(false);

  // Retomar cadastro: examId passado pela navegação (exame em rascunho)
  const routeExamId = (route.params as any)?.examId as string | undefined;
  const [examDocId, setExamDocId] = useState<string | null>(routeExamId || null);
  const [loadingExam, setLoadingExam] = useState(!!routeExamId);
  const [deletedDocIds, setDeletedDocIds] = useState<string[]>([]);
  const [saveProgress, setSaveProgress] = useState({ saved: 0, total: 0 });
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  // Carregar exame existente + itens já gravados quando se retoma o cadastro
  useEffect(() => {
    if (!routeExamId) return;
    (async () => {
      try {
        const examSnap = await getDoc(doc(db, 'exams', routeExamId));
        if (!examSnap.exists()) return;
        const d = examSnap.data() as any;
        setInstitution(d.institution || '');
        setSubject(d.subject || '');
        setYear(d.year ? String(d.year) : '');
        setDuration(d.duration ? String(d.duration) : '90');
        setSource(d.source || '');
        setUsageRights(d.usageRights || 'Público');
        const itemsSnap = await getDocs(
          query(collection(db, 'exams', routeExamId, 'questions'), orderBy('order'))
        );
        const items: ExamListItem[] = itemsSnap.docs.map(qDoc => {
          const data = qDoc.data() as any;
          if (data.type === 'text') {
            return { id: `txt-${qDoc.id}`, type: 'text', text: data.text || '', docId: qDoc.id };
          }
          return {
            id: `q-${qDoc.id}`,
            type: 'question',
            text: data.text || '',
            imageUrl: data.imageUrl,
            imageUri: undefined,
            options: [...(data.options || []), '', '', '', '', ''].slice(0, 5),
            correctOption: data.correctOption || 0,
            explanation: data.explanation || '',
            topic: data.topic || '',
            docId: qDoc.id,
          };
        });
        setQuestions(items);
        console.log(`Retomando cadastro: ${items.length} itens do exame ${routeExamId}`);
      } catch (e) {
        console.error('Erro ao carregar exame para retomar:', e);
      } finally {
        setLoadingExam(false);
      }
    })();
  }, [routeExamId]);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria de fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets[0]) {
        setCurrentQuestion({
          ...currentQuestion,
          imageUri: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const handleRemoveImage = () => {
    setCurrentQuestion({
      ...currentQuestion,
      imageUri: undefined,
      imageUrl: undefined,
    });
  };

  const extractGoogleDriveImageUrl = (url: string): string | null => {
    if (!url || !url.trim()) return null;

    // Patterns para links do Google Drive
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /open\?id=([a-zA-Z0-9_-]+)/,
      /([a-zA-Z0-9_-]{25,})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }

    return null;
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSaveQuestion = () => {
    // Validações
    if (!currentQuestion.text.trim()) {
      Alert.alert('Erro', 'Digite o texto da questão');
      return;
    }

    const filledOptions = currentQuestion.options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      Alert.alert('Erro', 'Adicione pelo menos 2 opções de resposta');
      return;
    }

    if (!currentQuestion.options[currentQuestion.correctOption]?.trim()) {
      Alert.alert('Erro', 'A opção correta não pode estar vazia');
      return;
    }

    // Adicionar ou atualizar questão
    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = {
        ...currentQuestion,
        id: currentQuestion.id || `q-${Date.now()}`,
        type: 'question',
        docId: updatedQuestions[editingQuestionIndex].docId,
        dirty: !!updatedQuestions[editingQuestionIndex].docId,
      };
      setQuestions(updatedQuestions);
    } else {
      setQuestions([
        ...questions,
        { ...currentQuestion, id: `q-${Date.now()}`, type: 'question' },
      ]);
    }

    // Resetar formulário
    setCurrentQuestion({
      id: '',
      text: '',
      imageUri: undefined,
      imageUrl: undefined,
      options: ['', '', '', '', ''],
      correctOption: 0,
      explanation: '',
      topic: '',
    });
    setEditingQuestionIndex(null);
    setShowQuestionModal(false);
  };

  const handleEditQuestion = (index: number) => {
    const item = questions[index];
    if (item.type === 'text') {
      setCurrentText(item.text);
      setEditingTextIndex(index);
      setShowTextModal(true);
      return;
    }
    setCurrentQuestion(item);
    setEditingQuestionIndex(index);
    setShowQuestionModal(true);
  };

  const handleSaveTextBlock = () => {
    if (!currentText.trim()) {
      Alert.alert('Erro', 'Digite o texto a inserir');
      return;
    }

    if (editingTextIndex !== null) {
      const updated = [...questions];
      updated[editingTextIndex] = {
        id: updated[editingTextIndex].id,
        type: 'text',
        text: currentText.trim(),
        docId: updated[editingTextIndex].docId,
        dirty: !!updated[editingTextIndex].docId,
      };
      setQuestions(updated);
    } else {
      setQuestions([
        ...questions,
        { id: `txt-${Date.now()}`, type: 'text', text: currentText.trim() },
      ]);
    }

    setCurrentText('');
    setEditingTextIndex(null);
    setShowTextModal(false);
  };

  const handleDeleteQuestion = (index: number) => {
    const item = questions[index];
    Alert.alert(
      item.type === 'text' ? 'Excluir Texto' : 'Excluir Questão',
      item.type === 'text'
        ? 'Tem certeza que deseja excluir este bloco de texto?'
        : 'Tem certeza que deseja excluir esta questão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const removed = questions[index];
            // Item já gravado na DB → remover documento na próxima gravação
            if (removed.docId) setDeletedDocIds(prev => [...prev, removed.docId!]);
            const updatedQuestions = questions.filter((_, i) => i !== index);
            setQuestions(updatedQuestions);
          },
        },
      ]
    );
  };

  const uploadImage = async (uri: string, examId: string, questionId: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `exams/${examId}/questions/${questionId}.jpg`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  };

  const handleSaveExam = async () => {
    // Validações
    if (!institution.trim() || !subject.trim() || !year.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios do exame');
      return;
    }

    // Pelo menos uma questão real (blocos de texto não contam)
    const questionCount = questions.filter(i => i.type !== 'text').length;
    if (questionCount === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma questão');
      return;
    }

    try {
      setSaving(true);
      setSaveWarning(null);

      const yearNumber = parseInt(year);
      const verificationStatus = !isPromoter && source.trim() ? 'verified' : 'unverified';
      const examData = {
        institution: institution.trim(),
        subject: subject.trim(),
        year: yearNumber,
        duration: parseInt(duration),
        source: source.trim(),
        usageRights: usageRights,
        verificationStatus: verificationStatus,
        updatedAt: serverTimestamp(),
      };

      // 1) Criar o exame PRIMEIRO como rascunho — as questões são gravadas uma a uma
      //    diretamente na DB. Se falhar a meio (rede, sair do ecrã), dá para retomar.
      let examId = examDocId;
      if (!examId) {
        const exists = await examService.checkExamExists(institution.trim(), subject.trim(), yearNumber);
        if (exists) {
          setSaving(false);
          Alert.alert(
            'Exame Duplicado',
            `Já existe um exame de ${subject.trim()} - ${institution.trim()} (${year}). Os exames não podem sobrepor-se. Verifique o ano, a instituição ou a disciplina.`
          );
          return;
        }
        const examRef = await addDoc(collection(db, 'exams'), {
          ...examData,
          status: 'draft',
          questionsCount: 0,
          uploadedBy: user?.id || '',
          uploadedByName: user?.name || '',
          uploadedByRole: user?.role || '',
          createdAt: serverTimestamp(),
        });
        examId = examRef.id;
        setExamDocId(examId);
        console.log(`Exame criado (rascunho): ${examId}`);
      } else {
        await updateDoc(doc(db, 'exams', examId), examData);
      }

      // Remover da DB itens apagados que já estavam gravados
      for (const removedId of deletedDocIds) {
        try { await deleteDoc(doc(db, 'exams', examId, 'questions', removedId)); } catch { /* ignora */ }
      }
      setDeletedDocIds([]);

      // Montar o payload de uma questão (imagem, opções filtradas, índice correto)
      const buildQuestionPayload = async (question: ExamListItem, itemIndex: number) => {
        const q = question as Question & { type: 'question' };
        let imageUrl = q.imageUrl;
        if (!imageUrl && q.imageUri) {
          try {
            imageUrl = await withTimeout(uploadImage(q.imageUri, examId!, q.id), 30000);
          } catch (imgError) {
            console.error('Erro ao fazer upload da imagem:', imgError);
          }
        }
        const validOptionIndexes = q.options
          .map((opt, i) => (opt.trim() ? i : -1))
          .filter(i => i >= 0);
        const validOptions = validOptionIndexes.map(i => q.options[i].trim());
        const correctIndex = validOptionIndexes.indexOf(q.correctOption);
        return {
          type: 'question',
          order: itemIndex,
          text: q.text.trim(),
          ...(imageUrl ? { imageUrl } : {}),
          options: validOptions,
          correctOption: correctIndex >= 0 ? correctIndex : 0,
          explanation: q.explanation.trim() || '',
          topic: q.topic.trim() || subject.trim(),
          correctFeedback: 'Resposta correta!',
          incorrectFeedback: 'Resposta incorreta.',
          learnMoreUrl: '',
          isOfficial: verificationStatus === 'verified',
        };
      };

      // 2) Gravar cada item diretamente na DB, com timeout e até 3 tentativas por item
      const markSaved = (index: number, docId: string) => {
        setQuestions(prev => prev.map((it, i) => i === index ? { ...it, docId, dirty: false } : it));
      };

      const saveItem = async (item: ExamListItem, itemIndex: number): Promise<string> => {
        const payload: any = item.type === 'text'
          ? { type: 'text', text: item.text, order: itemIndex }
          : await buildQuestionPayload(item, itemIndex);
        if (item.docId) {
          await withTimeout(updateDoc(doc(db, 'exams', examId!, 'questions', item.docId), { ...payload, updatedAt: serverTimestamp() }));
          return item.docId;
        }
        const ref = await withTimeout(addDoc(collection(db, 'exams', examId!, 'questions'), { ...payload, createdAt: serverTimestamp() }));
        return ref.id;
      };

      const failedIndices: number[] = [];
      let savedSoFar = questions.filter(q => q.docId && !q.dirty).length;
      setSaveProgress({ saved: savedSoFar, total: questions.length });

      for (let itemIndex = 0; itemIndex < questions.length; itemIndex++) {
        const item = questions[itemIndex];
        if (item.docId && !item.dirty) continue; // já gravado e sem alterações

        let docId: string | null = null;
        for (let attempt = 0; attempt < 3 && !docId; attempt++) {
          try {
            docId = await saveItem(item, itemIndex);
          } catch (itemError: any) {
            console.error(`Erro ao gravar item ${itemIndex} (tentativa ${attempt + 1}/3):`, itemError?.code, itemError?.message);
            await new Promise(r => setTimeout(r, 1000));
          }
        }
        if (docId) {
          markSaved(itemIndex, docId);
          savedSoFar++;
        } else {
          failedIndices.push(itemIndex);
        }
        setSaveProgress({ saved: savedSoFar, total: questions.length });
      }

      // 3) Atualizar o exame: completo → pendente de aprovação; incompleto → rascunho
      const failedQuestions = failedIndices.filter(i => questions[i].type !== 'text').length;
      const savedQuestions = questionCount - failedQuestions;
      const complete = failedIndices.length === 0;
      // Todos os exames criados ficam pendentes — o administrador aprova depois
      const finalStatus = complete ? 'pending' : 'draft';

      try {
        await updateDoc(doc(db, 'exams', examId), {
          status: finalStatus,
          questionsCount: savedQuestions,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error('Erro ao atualizar estado do exame:', e);
      }

      if (!complete) {
        console.warn(`Gravação incompleta: ${failedIndices.length} itens falharam`, failedIndices);
        setSaveWarning(
          `${failedQuestions} de ${questionCount} questões não foram gravadas. O exame ficou guardado como rascunho com ${savedQuestions} questões — toca em "Tentar Novamente" ou retoma mais tarde na Gestão de Exames.`
        );
        return; // fica no ecrã; os itens gravados mantêm o ✓
      }

      // Registo de auditoria da criação do exame
      auditService.log({
        actorId: user?.id || '',
        actorName: user?.name || '',
        actorRole: user?.role || '',
        action: 'exam_created_pending',
        entity: 'exam',
        entityId: examId,
        description: `Cadastrou o exame "${subject.trim()} - ${institution.trim()} (${yearNumber})" com ${questionCount} questões (pendente de aprovação)`,
      });

      // Notificar administradores quando o exame fica pendente de aprovação
      try {
        const admins = await userService.getUsersByRole(UserRole.ADMIN);
        const adminIds = admins.map((a: any) => a.id).filter(Boolean);
        if (adminIds.length > 0) {
          await notificationService.sendBulkNotification(adminIds, {
            type: 'exam_pending',
            title: '📝 Novo exame pendente de aprovação',
            message: `${user?.name || 'Um utilizador'} cadastrou o exame "${subject.trim()} - ${institution.trim()} (${yearNumber})" com ${questionCount} questões. Revise e aprove no painel de gestão de exames.`,
            data: { examId: examId, subject: subject.trim(), institution: institution.trim(), year: yearNumber },
          });
        }
      } catch (notifyError) {
        console.error('Erro ao notificar administradores:', notifyError);
      }

      // No web, Alert.alert não dispara callbacks — voltar à lista diretamente
      Alert.alert(
        'Exame Enviado!',
        `Exame criado com ${questionCount} questões e enviado para aprovação do administrador.`
      );
      navigation.goBack();
    } catch (error: any) {
      console.error('Erro ao salvar exame:', error?.code, error?.message, error);
      Alert.alert(
        'Erro ao salvar exame',
        `Detalhe: ${error?.message || 'Erro desconhecido'}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{examDocId ? 'Continuar Cadastro de Exame' : 'Cadastro Manual de Exame'}</Text>
          <Text style={styles.headerSubtitle}>
            {questions.filter(i => i.type !== 'text').length} questão{questions.filter(i => i.type !== 'text').length !== 1 ? 'ões' : ''} adicionada{questions.filter(i => i.type !== 'text').length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dados do Exame */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📋 Dados do Exame</Text>
            
            <Text style={styles.fieldLabel}>Instituição *</Text>
            <View style={styles.chipsContainer}>
              {EXAM_INSTITUTIONS.map((inst) => (
                <Chip
                  key={inst}
                  selected={institution === inst}
                  onPress={() => setInstitution(inst)}
                  style={[styles.chip, institution === inst && styles.chipSelected]}
                  textStyle={institution === inst ? styles.chipTextSelected : styles.chipText}
                >
                  {inst}
                </Chip>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Disciplina *</Text>
            <View style={styles.chipsContainer}>
              {EXAM_SUBJECTS.map((subj) => (
                <Chip
                  key={subj}
                  selected={subject === subj}
                  onPress={() => setSubject(subj)}
                  style={[styles.chip, subject === subj && styles.chipSelected]}
                  textStyle={subject === subj ? styles.chipTextSelected : styles.chipText}
                >
                  {subj}
                </Chip>
              ))}
            </View>
            
            <View style={styles.row}>
              <TextInput
                mode="outlined"
                label="Ano *"
                value={year}
                onChangeText={setYear}
                keyboardType="number-pad"
                placeholder="2024"
                style={[styles.input, styles.halfInput]}
              />
              
              <TextInput
                mode="outlined"
                label="Duração (min)"
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
                placeholder="90"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <Text style={styles.fieldLabel}>Fonte do Exame</Text>
            <TextInput
              mode="outlined"
              label="Fonte (ex: Exame oficial UP 2024)"
              value={source}
              onChangeText={setSource}
              placeholder="Indique a origem do exame..."
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Direitos de Utilização</Text>
            <View style={styles.chipsContainer}>
              {USAGE_RIGHTS_OPTIONS.map((right) => (
                <Chip
                  key={right}
                  selected={usageRights === right}
                  onPress={() => setUsageRights(right)}
                  style={[styles.chip, usageRights === right && styles.chipSelected]}
                  textStyle={usageRights === right ? styles.chipTextSelected : styles.chipText}
                >
                  {right}
                </Chip>
              ))}
            </View>
            <Text style={styles.fieldHint}>
              ℹ️ As questões só serão classificadas como <Text style={{ fontWeight: '700' }}>oficiais</Text> quando a fonte estiver confirmada pelo administrador.
            </Text>

            {isPromoter && (
              <View style={styles.pendingNotice}>
                <Text style={styles.pendingNoticeText}>
                  ⏳ O exame será enviado como <Text style={{ fontWeight: '700' }}>Pendente</Text> e só ficará disponível após aprovação do administrador.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Lista de Questões */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.questionsHeader}>
              <Text style={styles.sectionTitle}>❓ Conteúdo</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setCurrentText('');
                    setEditingTextIndex(null);
                    setShowTextModal(true);
                  }}
                  icon="text-box-outline"
                  compact
                  style={styles.addTextButton}
                  textColor={colors.primary}
                >
                  Texto
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setCurrentQuestion({
                      id: '',
                      text: '',
                      imageUri: undefined,
                      imageUrl: undefined,
                      options: ['', '', '', '', ''],
                      correctOption: 0,
                      explanation: '',
                      topic: '',
                    });
                    setEditingQuestionIndex(null);
                    setShowQuestionModal(true);
                  }}
                  icon="plus"
                  compact
                  style={styles.addQuestionButton}
                >
                  Questão
                </Button>
              </View>
            </View>

            <Text style={styles.itemsHint}>
              💡 Use "Texto" para inserir texto-base ou divisores (ex: "Parte I") — aplica-se às questões seguintes.
            </Text>

            {questions.length === 0 && (
              <View style={styles.emptyQuestions}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>Nenhuma questão adicionada</Text>
                <Text style={styles.emptySubtext}>Clique em "Questão" para criar a primeira, ou "Texto" para inserir um texto-base ou divisor</Text>
              </View>
            )}

            {questions.map((item, index) => {
              // Bloco de texto/divisor
              if (item.type === 'text') {
                return (
                  <Card key={item.id} style={styles.textBlockItem}>
                    <Card.Content style={styles.textBlockContent}>
                      <View style={styles.questionItemHeader}>
                        <Text style={styles.textBlockLabel}>📄 Texto / Divisor{item.docId ? '  ✓' : ''}</Text>
                        <View style={styles.questionActions}>
                          <IconButton
                            icon="pencil"
                            size={18}
                            onPress={() => handleEditQuestion(index)}
                          />
                          <IconButton
                            icon="delete"
                            size={18}
                            iconColor="#ef4444"
                            onPress={() => handleDeleteQuestion(index)}
                          />
                        </View>
                      </View>
                      <Text style={styles.textBlockPreview} numberOfLines={3}>
                        {item.text}
                      </Text>
                    </Card.Content>
                  </Card>
                );
              }

              const questionNumber = questions.slice(0, index + 1).filter(i => i.type !== 'text').length;
              return (
                <Card key={item.id} style={styles.questionItem}>
                  <Card.Content>
                    <View style={styles.questionItemHeader}>
                      <Text style={styles.questionNumber}>
                        Questão {questionNumber}
                        {item.docId ? '  ✓' : ''}
                      </Text>
                      <View style={styles.questionActions}>
                        <IconButton
                          icon="pencil"
                          size={18}
                          onPress={() => handleEditQuestion(index)}
                        />
                        <IconButton
                          icon="delete"
                          size={18}
                          iconColor="#ef4444"
                          onPress={() => handleDeleteQuestion(index)}
                        />
                      </View>
                    </View>
                    
                    <Text style={styles.questionText} numberOfLines={2}>
                      {item.text}
                    </Text>
                    
                    {(item.imageUri || item.imageUrl) && (
                      <View style={styles.questionImageBadge}>
                        <Text style={styles.questionImageBadgeText}>🖼️ Com imagem</Text>
                      </View>
                    )}
                    
                    <View style={styles.questionMeta}>
                      <Chip style={styles.metaChip} textStyle={styles.metaChipText}>
                        {item.options.filter((o: string) => o.trim()).length} opções
                      </Chip>
                      <Chip style={styles.metaChip} textStyle={styles.metaChipText}>
                        Correta: {String.fromCharCode(65 + item.correctOption)}
                      </Chip>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </Card.Content>
        </Card>

        {loadingExam && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>A carregar rascunho…</Text>
          </View>
        )}

        {examDocId && (
          <Text style={styles.savedHint}>
            ✓ Rascunho na base de dados — itens marcados com ✓ já estão gravados. Podes sair e retomar depois na Gestão de Exames.
          </Text>
        )}

        {/* Botão Salvar */}
        <Button
          mode="contained"
          onPress={handleSaveExam}
          loading={saving}
          disabled={saving || loadingExam || questions.filter(i => i.type !== 'text').length === 0}
          style={styles.saveButton}
          contentStyle={{ paddingVertical: 8 }}
        >
          {saving
            ? `Gravando ${saveProgress.saved}/${saveProgress.total}...`
            : saveWarning
              ? 'Tentar Novamente'
              : examDocId
                ? 'Concluir Cadastro'
                : 'Salvar Exame'}
        </Button>

        {saveWarning && (
          <Text style={styles.saveWarningText}>⚠️ {saveWarning}</Text>
        )}
      </ScrollView>

      {/* Modal de Adicionar/Editar Questão */}
      <Modal
        visible={showQuestionModal}
        onDismiss={() => {
          setShowQuestionModal(false);
          setEditingQuestionIndex(null);
        }}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card>
            <Card.Content>
              <Text style={styles.modalTitle}>
                {editingQuestionIndex !== null ? 'Editar Questão' : 'Nova Questão'}
              </Text>

              <TextInput
                mode="outlined"
                label="Texto da Questão *"
                value={currentQuestion.text}
                onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, text })}
                onFocus={() => setActiveField('question')}
                onSelectionChange={(e) => onFieldSelect('question', e.nativeEvent.selection)}
                multiline
                numberOfLines={4}
                autoCorrect={false}
                autoCapitalize="sentences"
                right={symbolIcon('question')}
                style={styles.input}
                placeholder="Digite o enunciado da questão (toque em ∑ p/ símbolos)"
              />

              {/* Upload de Imagem */}
              <View style={styles.imageSection}>
                <Text style={styles.imageSectionTitle}>Imagem (opcional)</Text>
                <Text style={styles.imageSectionSubtitle}>
                  Ideal para fórmulas matemáticas e expressões complexas
                </Text>

                <TextInput
                  mode="outlined"
                  label="Link do Google Drive"
                  value={currentQuestion.imageUrl || ''}
                  onChangeText={(text) => {
                    const driveUrl = extractGoogleDriveImageUrl(text) || text;
                    setCurrentQuestion({
                      ...currentQuestion,
                      imageUrl: text.trim() ? driveUrl : undefined,
                      imageUri: text.trim() ? driveUrl : undefined,
                    });
                  }}
                  placeholder="https://drive.google.com/file/d/..."
                  style={styles.input}
                />

                <Text style={styles.driveHint}>
                  📎 Cole o link de compartilhamento do Google Drive. A imagem deve estar pública.
                </Text>

                <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Ou selecione da galeria</Text>
                </TouchableOpacity>

                {(currentQuestion.imageUri || currentQuestion.imageUrl) && (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: currentQuestion.imageUri || currentQuestion.imageUrl }}
                      style={styles.imagePreview}
                      resizeMode="contain"
                    />
                    <IconButton
                      icon="close-circle"
                      size={24}
                      iconColor="#ef4444"
                      style={styles.removeImageButton}
                      onPress={handleRemoveImage}
                    />
                  </View>
                )}
              </View>

              {/* Opções de Resposta */}
              <Text style={styles.optionsTitle}>Opções de Resposta *</Text>
              {currentQuestion.options.map((option, index) => (
                <View key={index} style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.optionRadio,
                      currentQuestion.correctOption === index && styles.optionRadioSelected,
                    ]}
                    onPress={() => setCurrentQuestion({ ...currentQuestion, correctOption: index })}
                  >
                    <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
                  </TouchableOpacity>
                  <TextInput
                    mode="outlined"
                    value={option}
                    onChangeText={(text) => handleUpdateOption(index, text)}
                    onFocus={() => setActiveField(`opt-${index}`)}
                    onSelectionChange={(e) => onFieldSelect(`opt-${index}`, e.nativeEvent.selection)}
                    multiline
                    autoCorrect={false}
                    right={symbolIcon(`opt-${index}`)}
                    placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                    style={styles.optionInput}
                  />
                </View>
              ))}
              <Text style={styles.correctHint}>
                ✓ Toque na letra para marcar a resposta correta
              </Text>

              <TextInput
                mode="outlined"
                label="Explicação (opcional)"
                value={currentQuestion.explanation}
                onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, explanation: text })}
                onFocus={() => setActiveField('explanation')}
                onSelectionChange={(e) => onFieldSelect('explanation', e.nativeEvent.selection)}
                multiline
                numberOfLines={3}
                autoCorrect={false}
                right={symbolIcon('explanation')}
                style={styles.input}
                placeholder="Explique por que esta é a resposta correta..."
              />

              <TextInput
                mode="outlined"
                label="Tópico (opcional)"
                value={currentQuestion.topic}
                onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, topic: text })}
                onFocus={() => setActiveField('topic')}
                onSelectionChange={(e) => onFieldSelect('topic', e.nativeEvent.selection)}
                autoCorrect={false}
                right={symbolIcon('topic')}
                style={styles.input}
                placeholder="Ex: Geometria, Álgebra, Trigonometria..."
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowQuestionModal(false);
                    setEditingQuestionIndex(null);
                  }}
                  style={styles.modalActionButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveQuestion}
                  style={styles.modalActionButton}
                >
                  {editingQuestionIndex !== null ? 'Atualizar' : 'Adicionar'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </Modal>

      {/* Modal de Bloco de Texto / Divisor */}
      <Modal
        visible={showTextModal}
        onDismiss={() => {
          setShowTextModal(false);
          setEditingTextIndex(null);
          setCurrentText('');
        }}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card>
            <Card.Content>
              <Text style={styles.modalTitle}>
                {editingTextIndex !== null ? 'Editar Texto' : 'Inserir Texto'}
              </Text>
              <Text style={styles.modalSubtitle}>
                O texto aparece nesta posição e serve de guia para as questões seguintes — ex: texto-base, instruções ou divisores como "Parte I".
              </Text>

              <TextInput
                label="Texto"
                value={currentText}
                onChangeText={setCurrentText}
                onFocus={() => setActiveField('textblock')}
                onSelectionChange={(e) => onFieldSelect('textblock', e.nativeEvent.selection)}
                mode="outlined"
                multiline
                numberOfLines={6}
                autoCorrect={false}
                right={symbolIcon('textblock')}
                placeholder='Ex: "Leia o texto e responda às questões 1 a 5..." ou "PARTE I — GRAMÁTICA"'
                style={styles.input}
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowTextModal(false);
                    setEditingTextIndex(null);
                    setCurrentText('');
                  }}
                  style={styles.modalActionButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveTextBlock}
                  style={styles.modalActionButton}
                >
                  {editingTextIndex !== null ? 'Atualizar' : 'Inserir'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </Modal>

      {/* Seletor de Símbolos Matemáticos */}
      <Modal
        visible={showSymbolPicker}
        onDismiss={() => setShowSymbolPicker(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Content>
            <Text style={styles.modalTitle}>Símbolos Matemáticos</Text>
            <Text style={styles.modalSubtitle}>
              Toque num símbolo para inserir no campo selecionado, na posição do cursor.
            </Text>
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {SYMBOL_GROUPS.map((group) => (
                <View key={group.label} style={styles.symbolGroup}>
                  <Text style={styles.symbolGroupLabel}>{group.label}</Text>
                  <View style={styles.symbolGrid}>
                    {group.symbols.map((sym) => (
                      <TouchableOpacity
                        key={sym}
                        style={styles.symbolButton}
                        onPress={() => insertSymbol(sym)}
                      >
                        <Text style={styles.symbolButtonText}>{sym}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
            <Button
              mode="outlined"
              onPress={() => setShowSymbolPicker(false)}
              style={{ marginTop: spacing.sm }}
            >
              Fechar
            </Button>
          </Card.Content>
        </Card>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    color: colors.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  fieldHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    backgroundColor: colors.grayLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
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
  pendingNotice: {
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  pendingNoticeText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addQuestionButton: {
    backgroundColor: colors.primary,
  },
  addTextButton: {
    borderColor: colors.primary,
  },
  itemsHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  textBlockItem: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderStyle: 'dashed',
  },
  textBlockContent: {
    paddingVertical: spacing.sm,
  },
  textBlockLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textBlockPreview: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  symbolGroup: {
    marginBottom: spacing.md,
  },
  symbolGroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  symbolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symbolButton: {
    minWidth: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.grayLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  symbolButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  emptyQuestions: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  questionItem: {
    marginBottom: spacing.md,
    backgroundColor: colors.grayLight,
  },
  questionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  questionNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  questionActions: {
    flexDirection: 'row',
    marginRight: -12,
  },
  questionText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  questionImageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  questionImageBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaChip: {
    height: 24,
    backgroundColor: colors.white,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  savedHint: {
    fontSize: 12,
    color: '#059669',
    marginBottom: spacing.sm,
    lineHeight: 17,
  },
  saveWarningText: {
    fontSize: 13,
    color: '#b45309',
    backgroundColor: '#fef3c7',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  modalContainer: {
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  imageSection: {
    marginBottom: spacing.lg,
  },
  imageSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  imageSectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  driveHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.secondary,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.grayLight,
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.white,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  optionRadio: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  optionRadioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionInput: {
    flex: 1,
    backgroundColor: colors.white,
  },
  correctHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalActionButton: {
    flex: 1,
  },
});
