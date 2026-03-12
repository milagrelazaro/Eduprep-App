import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { Exam, Question } from '../types';

const INSTITUTIONS = ['UEM', 'UP', 'UCM', 'ISCTEM', 'Unilúrio', 'Universidade Zambeze'];
const SUBJECTS = ['Matemática', 'Física', 'Química', 'Biologia', 'Português', 'História', 'Geografia', 'Inglês'];
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export default function CreateExamScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [institution, setInstitution] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('120');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: '',
    correctFeedback: '',
    incorrectFeedback: '',
    learnMoreUrl: '',
    topic: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    if (!currentQuestion.text || currentQuestion.options?.some(o => !o.trim())) {
      Alert.alert('Erro', 'Preencha a pergunta e todas as opções.');
      return;
    }

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: currentQuestion.text,
      options: currentQuestion.options as string[],
      correctOption: currentQuestion.correctOption || 0,
      explanation: currentQuestion.explanation,
      correctFeedback: currentQuestion.correctFeedback,
      incorrectFeedback: currentQuestion.incorrectFeedback,
      learnMoreUrl: currentQuestion.learnMoreUrl,
      topic: currentQuestion.topic,
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: '',
      correctFeedback: '',
      incorrectFeedback: '',
      learnMoreUrl: '',
      topic: '',
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!institution || !subject || questions.length === 0) {
      Alert.alert('Erro', 'Preencha todos os campos e adicione pelo menos uma questão.');
      return;
    }

    setIsSubmitting(true);

    try {
      const exam: Exam = {
        id: `exam-${Date.now()}`,
        institution,
        subject,
        duration: parseInt(duration),
        year: parseInt(year),
        difficulty,
        questions,
        topics: Array.from(new Set(questions.map(q => q.topic).filter(Boolean))) as string[],
        uploadedBy: user?.id,
        status: user?.role === 'admin' ? 'approved' : 'pending',
        aiGenerated: false,
      };

      const saved = await AsyncStorage.getItem('eduprep_exams');
      const exams = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem('eduprep_exams', JSON.stringify([exam, ...exams]));

      Alert.alert(
        '✅ Exame Criado',
        user?.role === 'admin' 
          ? 'Exame criado e aprovado com sucesso!'
          : 'Exame criado! Aguarde aprovação do administrador.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o exame. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <Text variant="headlineSmall" style={styles.title}>Criar Exame</Text>
          <View style={{ width: 48 }} />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>📋 Informações Básicas</Text>
            
            <Text style={styles.label}>Instituição</Text>
            <View style={styles.chipContainer}>
              {INSTITUTIONS.map(inst => (
                <Chip
                  key={inst}
                  selected={institution === inst}
                  onPress={() => setInstitution(inst)}
                  style={styles.chip}
                >
                  {inst}
                </Chip>
              ))}
            </View>

            <Text style={styles.label}>Disciplina</Text>
            <View style={styles.chipContainer}>
              {SUBJECTS.map(subj => (
                <Chip
                  key={subj}
                  selected={subject === subj}
                  onPress={() => setSubject(subj)}
                  style={styles.chip}
                >
                  {subj}
                </Chip>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Duração (min)</Text>
                <TextInput
                  mode="outlined"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Ano</Text>
                <TextInput
                  mode="outlined"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.label}>Dificuldade</Text>
            <View style={styles.chipContainer}>
              <Chip
                selected={difficulty === 'easy'}
                onPress={() => setDifficulty('easy')}
                style={styles.chip}
              >
                Fácil
              </Chip>
              <Chip
                selected={difficulty === 'medium'}
                onPress={() => setDifficulty('medium')}
                style={styles.chip}
              >
                Médio
              </Chip>
              <Chip
                selected={difficulty === 'hard'}
                onPress={() => setDifficulty('hard')}
                style={styles.chip}
              >
                Difícil
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              ❓ Questões ({questions.length})
            </Text>

            {questions.map((q, index) => (
              <View key={index} style={styles.questionItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.questionNumber}>Questão {index + 1}</Text>
                  <Text style={styles.questionText} numberOfLines={2}>{q.text}</Text>
                  {q.topic && <Text style={styles.topicText}>Tema: {q.topic}</Text>}
                </View>
                <IconButton
                  icon="delete"
                  iconColor="#ef4444"
                  onPress={() => removeQuestion(index)}
                />
              </View>
            ))}

            <View style={styles.divider} />

            <Text variant="titleSmall" style={styles.addQuestionTitle}>
              Adicionar Nova Questão
            </Text>

            <TextInput
              mode="outlined"
              label="Pergunta"
              value={currentQuestion.text}
              onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, text })}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <TextInput
              mode="outlined"
              label="Tema (opcional)"
              value={currentQuestion.topic}
              onChangeText={(topic) => setCurrentQuestion({ ...currentQuestion, topic })}
              style={styles.input}
            />

            {currentQuestion.options?.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <TextInput
                  mode="outlined"
                  label={`Opção ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChangeText={(text) => {
                    const newOptions = [...(currentQuestion.options || [])];
                    newOptions[index] = text;
                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                  }}
                  style={{ flex: 1 }}
                />
                <Chip
                  selected={currentQuestion.correctOption === index}
                  onPress={() => setCurrentQuestion({ ...currentQuestion, correctOption: index })}
                  style={{ marginLeft: 8 }}
                  icon={currentQuestion.correctOption === index ? 'check' : undefined}
                >
                  {currentQuestion.correctOption === index ? 'Correta' : 'Marcar'}
                </Chip>
              </View>
            ))}

            <TextInput
              mode="outlined"
              label="Explicação da resposta"
              value={currentQuestion.explanation}
              onChangeText={(explanation) => setCurrentQuestion({ ...currentQuestion, explanation })}
              multiline
              numberOfLines={2}
              style={styles.input}
            />

            <TextInput
              mode="outlined"
              label="Feedback ao acertar"
              value={currentQuestion.correctFeedback}
              onChangeText={(correctFeedback) => setCurrentQuestion({ ...currentQuestion, correctFeedback })}
              placeholder="Ex: ✅ Excelente! Você domina este conceito."
              style={styles.input}
            />

            <TextInput
              mode="outlined"
              label="Feedback ao errar"
              value={currentQuestion.incorrectFeedback}
              onChangeText={(incorrectFeedback) => setCurrentQuestion({ ...currentQuestion, incorrectFeedback })}
              placeholder="Ex: ❌ Revise os conceitos básicos..."
              style={styles.input}
            />

            <TextInput
              mode="outlined"
              label="Link YouTube (opcional)"
              value={currentQuestion.learnMoreUrl}
              onChangeText={(learnMoreUrl) => setCurrentQuestion({ ...currentQuestion, learnMoreUrl })}
              placeholder="https://youtube.com/..."
              style={styles.input}
            />

            <Button
              mode="outlined"
              onPress={addQuestion}
              icon="plus"
              style={styles.addButton}
            >
              Adicionar Questão
            </Button>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting || questions.length === 0}
          style={styles.submitButton}
          contentStyle={{ paddingVertical: 8 }}
        >
          Criar Exame
        </Button>
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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#f3f4f6',
  },
  row: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 14,
    color: '#111827',
  },
  topicText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  addQuestionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
  },
});
