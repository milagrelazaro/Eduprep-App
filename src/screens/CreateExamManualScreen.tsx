import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, Card, Button, TextInput, Chip, IconButton, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
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

export default function CreateExamManualScreen() {
  const navigation = useNavigation();
  
  // Dados do exame
  const [institution, setInstitution] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [duration, setDuration] = useState('90');
  const [status, setStatus] = useState<'pending' | 'approved'>('approved');
  
  // Questões
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  
  // Questão atual sendo editada
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    text: '',
    imageUri: undefined,
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: '',
    topic: '',
  });
  
  const [saving, setSaving] = useState(false);

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
    });
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
      };
      setQuestions(updatedQuestions);
    } else {
      setQuestions([
        ...questions,
        { ...currentQuestion, id: `q-${Date.now()}` },
      ]);
    }

    // Resetar formulário
    setCurrentQuestion({
      id: '',
      text: '',
      imageUri: undefined,
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: '',
      topic: '',
    });
    setEditingQuestionIndex(null);
    setShowQuestionModal(false);
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);
    setEditingQuestionIndex(index);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (index: number) => {
    Alert.alert(
      'Excluir Questão',
      'Tem certeza que deseja excluir esta questão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
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

    if (questions.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma questão');
      return;
    }

    try {
      setSaving(true);

      // Criar documento do exame
      const examRef = await addDoc(collection(db, 'exams'), {
        institution: institution.trim(),
        subject: subject.trim(),
        year: parseInt(year),
        duration: parseInt(duration),
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`Exame criado: ${examRef.id}`);

      // Adicionar questões
      for (const question of questions) {
        let imageUrl = undefined;

        // Upload da imagem se existir
        if (question.imageUri) {
          try {
            imageUrl = await uploadImage(question.imageUri, examRef.id, question.id);
            console.log(`Imagem carregada: ${imageUrl}`);
          } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error);
          }
        }

        // Filtrar opções vazias
        const validOptions = question.options.filter(opt => opt.trim());

        await addDoc(collection(db, 'exams', examRef.id, 'questions'), {
          text: question.text.trim(),
          imageUrl,
          options: validOptions,
          correctOption: question.correctOption,
          explanation: question.explanation.trim() || '',
          topic: question.topic.trim() || subject.trim(),
          correctFeedback: 'Resposta correta!',
          incorrectFeedback: 'Resposta incorreta.',
          learnMoreUrl: '',
          createdAt: serverTimestamp(),
        });
      }

      Alert.alert(
        'Sucesso!',
        `Exame criado com ${questions.length} questões!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar exame:', error);
      Alert.alert('Erro', 'Não foi possível salvar o exame. Tente novamente.');
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
          <Text style={styles.headerTitle}>Cadastro Manual de Exame</Text>
          <Text style={styles.headerSubtitle}>
            {questions.length} questão{questions.length !== 1 ? 'ões' : ''} adicionada{questions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dados do Exame */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📋 Dados do Exame</Text>
            
            <TextInput
              mode="outlined"
              label="Instituição *"
              value={institution}
              onChangeText={setInstitution}
              placeholder="UEM, UP, UCM, ISCTEM..."
              style={styles.input}
            />
            
            <TextInput
              mode="outlined"
              label="Disciplina *"
              value={subject}
              onChangeText={setSubject}
              placeholder="Matemática, Física, Química..."
              style={styles.input}
            />
            
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

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={styles.statusChips}>
                <Chip
                  selected={status === 'approved'}
                  onPress={() => setStatus('approved')}
                  style={styles.statusChip}
                >
                  Aprovado
                </Chip>
                <Chip
                  selected={status === 'pending'}
                  onPress={() => setStatus('pending')}
                  style={styles.statusChip}
                >
                  Pendente
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Lista de Questões */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.questionsHeader}>
              <Text style={styles.sectionTitle}>❓ Questões</Text>
              <Button
                mode="contained"
                onPress={() => {
                  setCurrentQuestion({
                    id: '',
                    text: '',
                    imageUri: undefined,
                    options: ['', '', '', ''],
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
                Adicionar
              </Button>
            </View>

            {questions.length === 0 && (
              <View style={styles.emptyQuestions}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>Nenhuma questão adicionada</Text>
                <Text style={styles.emptySubtext}>Clique em "Adicionar" para criar a primeira questão</Text>
              </View>
            )}

            {questions.map((question, index) => (
              <Card key={question.id} style={styles.questionItem}>
                <Card.Content>
                  <View style={styles.questionItemHeader}>
                    <Text style={styles.questionNumber}>Questão {index + 1}</Text>
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
                    {question.text}
                  </Text>
                  
                  {question.imageUri && (
                    <View style={styles.questionImageBadge}>
                      <Text style={styles.questionImageBadgeText}>🖼️ Com imagem</Text>
                    </View>
                  )}
                  
                  <View style={styles.questionMeta}>
                    <Chip style={styles.metaChip} textStyle={styles.metaChipText}>
                      {question.options.filter(o => o.trim()).length} opções
                    </Chip>
                    <Chip style={styles.metaChip} textStyle={styles.metaChipText}>
                      Correta: {String.fromCharCode(65 + question.correctOption)}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </Card.Content>
        </Card>

        {/* Botão Salvar */}
        <Button
          mode="contained"
          onPress={handleSaveExam}
          loading={saving}
          disabled={saving || questions.length === 0}
          style={styles.saveButton}
          contentStyle={{ paddingVertical: 8 }}
        >
          {saving ? 'Salvando...' : 'Salvar Exame'}
        </Button>
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
                multiline
                numberOfLines={4}
                style={styles.input}
                placeholder="Digite o enunciado da questão..."
              />

              {/* Upload de Imagem */}
              <View style={styles.imageSection}>
                <Text style={styles.imageSectionTitle}>Imagem (opcional)</Text>
                <Text style={styles.imageSectionSubtitle}>
                  Ideal para fórmulas matemáticas e expressões complexas
                </Text>

                {currentQuestion.imageUri ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: currentQuestion.imageUri }}
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
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text style={styles.uploadText}>Adicionar Imagem</Text>
                  </TouchableOpacity>
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
                multiline
                numberOfLines={3}
                style={styles.input}
                placeholder="Explique por que esta é a resposta correta..."
              />

              <TextInput
                mode="outlined"
                label="Tópico (opcional)"
                value={currentQuestion.topic}
                onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, topic: text })}
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
  statusContainer: {
    marginTop: spacing.sm,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statusChips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusChip: {
    backgroundColor: colors.grayLight,
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
