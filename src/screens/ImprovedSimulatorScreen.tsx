import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, Card, IconButton, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTITUTIONS = ['UEM', 'UP', 'UCM', 'Unilúrio'];
const SUBJECTS = ['Matemática', 'Física', 'Química', 'Biologia', 'Português'];

const MOCK_QUESTIONS = [
  {
    id: 1,
    question: 'Qual é o valor de x na equação 2x + 5 = 13?',
    options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
    correctAnswer: 1,
    explanation: 'Para resolver: 2x + 5 = 13 → 2x = 8 → x = 4',
    correctComment: 'Excelente! Você domina equações de primeiro grau.',
    wrongComment: 'Revise os passos: isole o x primeiro, depois divida ambos os lados.',
    youtubeCorrect: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeWrong: 'https://youtube.com/watch?v=kfVsfOSbJY0',
  },
  {
    id: 2,
    question: 'Qual é a derivada de f(x) = x²?',
    options: ['f\'(x) = x', 'f\'(x) = 2x', 'f\'(x) = x²', 'f\'(x) = 2'],
    correctAnswer: 1,
    explanation: 'A regra da potência: d/dx(xⁿ) = n·xⁿ⁻¹. Portanto, d/dx(x²) = 2x¹ = 2x',
    correctComment: 'Perfeito! Você entende bem cálculo diferencial.',
    wrongComment: 'Lembre-se da regra da potência: multiplique pelo expoente e diminua 1 no expoente.',
    youtubeCorrect: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeWrong: 'https://youtube.com/watch?v=kfVsfOSbJY0',
  },
  {
    id: 3,
    question: 'Quanto é sen(90°)?',
    options: ['0', '1', '√2/2', '√3/2'],
    correctAnswer: 1,
    explanation: 'O seno de 90° (ou π/2 radianos) é igual a 1.',
    correctComment: 'Ótimo! Você conhece bem os valores notáveis de trigonometria.',
    wrongComment: 'Revise o círculo trigonométrico e os valores de seno para ângulos notáveis.',
    youtubeCorrect: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeWrong: 'https://youtube.com/watch?v=kfVsfOSbJY0',
  },
];

export default function ImprovedSimulatorScreen() {
  const navigation = useNavigation();
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isTimed, setIsTimed] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: { selected: number; isCorrect: boolean } }>({});
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isFinished, setIsFinished] = useState(false);

  const startSimulator = () => {
    if (!selectedSubject) return;
    setIsSimulating(true);
    setAnswers({});
    setCurrentQuestion(0);
    setShowFeedback(null);
    setIsFinished(false);
    if (isTimed) {
      setTimeLeft(3600);
    }
  };

  const handleAnswer = (questionId: number, selectedOption: number) => {
    const question = MOCK_QUESTIONS[currentQuestion];
    const isCorrect = selectedOption === question.correctAnswer;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: { selected: selectedOption, isCorrect },
    }));
    
    setShowFeedback(questionId);
  };

  const nextQuestion = () => {
    if (currentQuestion < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(null);
    } else {
      finishExam();
    }
  };

  const finishExam = async () => {
    const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / MOCK_QUESTIONS.length) * 20);
    
    const result = {
      id: Date.now().toString(),
      score,
      date: new Date().toLocaleDateString(),
      subject: selectedSubject,
      institution: selectedInstitution,
    };

    const saved = await AsyncStorage.getItem('eduprep_exams');
    const exams = saved ? JSON.parse(saved) : [];
    await AsyncStorage.setItem('eduprep_exams', JSON.stringify([result, ...exams]));

    setIsFinished(true);
  };

  const openYouTube = (url: string) => {
    Linking.openURL(url);
  };

  if (isFinished) {
    const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / MOCK_QUESTIONS.length) * 20);
    
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.resultContainer}>
            <View style={[styles.scoreCircle, { backgroundColor: score >= 14 ? '#ecfdf5' : '#fef2f2' }]}>
              <Text style={{ fontSize: 48, fontWeight: '800', color: score >= 14 ? '#10b981' : '#ef4444' }}>
                {score}
              </Text>
              <Text style={{ fontSize: 14, color: '#9ca3af', fontWeight: '600' }}>/20</Text>
            </View>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827', marginTop: 24, textAlign: 'center' }}>
              {score >= 14 ? 'Excelente Resultado!' : 'Continue Praticando!'}
            </Text>
            <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>
              Você acertou {correctCount} de {MOCK_QUESTIONS.length} questões
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 32, width: '100%' }}>
              <Button
                mode="outlined"
                onPress={() => { setIsSimulating(false); setIsFinished(false); }}
                style={{ flex: 1, borderColor: '#e5e7eb', borderRadius: 16 }}
                labelStyle={{ fontWeight: '700', color: '#374151' }}
              >
                Voltar
              </Button>
              <Button
                mode="contained"
                onPress={startSimulator}
                style={{ flex: 1, backgroundColor: '#4f46e5', borderRadius: 16 }}
                labelStyle={{ fontWeight: '800', color: '#fff' }}
              >
                Tentar Novamente
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (isSimulating) {
    const question = MOCK_QUESTIONS[currentQuestion];
    const hasAnswered = answers[question.id] !== undefined;
    const selectedAnswer = answers[question.id];

    return (
      <View style={styles.screen}>
        <View style={styles.examHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconButton icon="close" onPress={() => setIsSimulating(false)} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 16, color: '#111827' }}>
                {selectedSubject} - {selectedInstitution}
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                Questão {currentQuestion + 1} de {MOCK_QUESTIONS.length}
              </Text>
            </View>
            {isTimed && (
              <View style={styles.timerBadge}>
                <IconButton icon="clock-outline" iconColor="#f97316" size={16} style={{ margin: 0 }} />
                <Text style={{ fontWeight: '800', color: '#f97316' }}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.questionCard}>
            <Card.Content>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', lineHeight: 24 }}>
                {question.question}
              </Text>
            </Card.Content>
          </Card>

          {question.options.map((option, index) => {
            const isSelected = selectedAnswer?.selected === index;
            const isCorrect = index === question.correctAnswer;
            const showResult = hasAnswered && showFeedback === question.id;
            
            let bgColor = '#fff';
            let borderColor = '#f3f4f6';
            
            if (showResult) {
              if (isSelected && isCorrect) {
                bgColor = '#ecfdf5';
                borderColor = '#10b981';
              } else if (isSelected && !isCorrect) {
                bgColor = '#fef2f2';
                borderColor = '#ef4444';
              } else if (isCorrect) {
                bgColor = '#ecfdf5';
                borderColor = '#10b981';
              }
            } else if (isSelected) {
              bgColor = '#eef2ff';
              borderColor = '#4f46e5';
            }

            return (
              <TouchableOpacity
                key={index}
                onPress={() => !hasAnswered && handleAnswer(question.id, index)}
                disabled={hasAnswered}
                activeOpacity={0.7}
              >
                <Card style={[styles.optionCard, { backgroundColor: bgColor, borderColor, borderWidth: 2 }]}>
                  <Card.Content style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[styles.optionCircle, { backgroundColor: showResult && isCorrect ? '#10b981' : showResult && isSelected ? '#ef4444' : '#f3f4f6' }]}>
                      <Text style={{ fontWeight: '800', color: showResult && (isCorrect || isSelected) ? '#fff' : '#9ca3af' }}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' }}>{option}</Text>
                    {showResult && isCorrect && (
                      <IconButton icon="check-circle" iconColor="#10b981" size={24} style={{ margin: 0 }} />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <IconButton icon="close-circle" iconColor="#ef4444" size={24} style={{ margin: 0 }} />
                    )}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })}

          {showFeedback === question.id && (
            <>
              <Card style={[styles.feedbackCard, { backgroundColor: selectedAnswer.isCorrect ? '#ecfdf5' : '#fef2f2', borderColor: selectedAnswer.isCorrect ? '#10b981' : '#ef4444' }]}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <IconButton
                      icon={selectedAnswer.isCorrect ? 'check-circle' : 'alert-circle'}
                      iconColor={selectedAnswer.isCorrect ? '#10b981' : '#ef4444'}
                      size={24}
                      style={{ margin: 0 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '800', fontSize: 15, color: '#111827', marginBottom: 4 }}>
                        {selectedAnswer.isCorrect ? question.correctComment : question.wrongComment}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 12 }}>
                        {question.explanation}
                      </Text>
                      <Button
                        mode="outlined"
                        compact
                        icon="youtube"
                        onPress={() => openYouTube(selectedAnswer.isCorrect ? question.youtubeCorrect : question.youtubeWrong)}
                        style={{ borderColor: selectedAnswer.isCorrect ? '#10b981' : '#ef4444', borderRadius: 12, alignSelf: 'flex-start' }}
                        labelStyle={{ fontSize: 12, fontWeight: '700', color: selectedAnswer.isCorrect ? '#10b981' : '#ef4444' }}
                      >
                        {selectedAnswer.isCorrect ? 'Saiba Mais no YouTube' : 'Ver Explicação no YouTube'}
                      </Button>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <Button
                mode="contained"
                onPress={nextQuestion}
                style={{ backgroundColor: '#4f46e5', borderRadius: 16, marginTop: 8 }}
                labelStyle={{ fontWeight: '800', color: '#fff', fontSize: 15 }}
                contentStyle={{ paddingVertical: 8 }}
              >
                {currentQuestion < MOCK_QUESTIONS.length - 1 ? 'Próxima Questão' : 'Finalizar Simulado'}
              </Button>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton 
            icon="arrow-left" 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          />
          <View style={styles.headerContent}>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Simulador Inteligente</Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Escolha o tema, disciplina e universidade.</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Instituição</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {INSTITUTIONS.map(inst => (
            <Chip
              key={inst}
              selected={selectedInstitution === inst}
              onPress={() => setSelectedInstitution(inst)}
              style={[styles.chip, selectedInstitution === inst && styles.chipSelected]}
              textStyle={{ fontSize: 13, fontWeight: '700', color: selectedInstitution === inst ? '#fff' : '#374151' }}
            >
              {inst}
            </Chip>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.sectionLabel}>Disciplina</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {SUBJECTS.map(subj => (
          <Chip
            key={subj}
            selected={selectedSubject === subj}
            onPress={() => setSelectedSubject(subj)}
            style={[styles.chip, selectedSubject === subj && styles.chipSelected]}
            textStyle={{ fontSize: 13, fontWeight: '700', color: selectedSubject === subj ? '#fff' : '#374151' }}
          >
            {subj}
          </Chip>
        ))}
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827' }}>Modo Cronometrado</Text>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>60 minutos para completar</Text>
            </View>
            <TouchableOpacity onPress={() => setIsTimed(!isTimed)}>
              <View style={[styles.toggle, isTimed && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isTimed && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={startSimulator}
        disabled={!selectedSubject}
        style={[styles.startBtn, !selectedSubject && { opacity: 0.5 }]}
        labelStyle={{ fontWeight: '800', color: '#fff', fontSize: 16 }}
        contentStyle={{ paddingVertical: 10 }}
        icon="play"
      >
        Iniciar Simulador
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backButton: { margin: 0 },
  headerContent: { flex: 1, marginLeft: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  chip: { backgroundColor: '#f3f4f6', borderRadius: 12 },
  chipSelected: { backgroundColor: '#4f46e5' },
  card: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', padding: 2, justifyContent: 'center' },
  toggleActive: { backgroundColor: '#4f46e5' },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', elevation: 2 },
  toggleThumbActive: { alignSelf: 'flex-end' },
  startBtn: { backgroundColor: '#4f46e5', borderRadius: 16, elevation: 4, marginTop: 8 },
  examHeader: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff7ed', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  questionCard: { backgroundColor: '#eef2ff', borderRadius: 20, elevation: 0, borderWidth: 2, borderColor: '#c7d2fe', marginBottom: 16 },
  optionCard: { backgroundColor: '#fff', borderRadius: 16, elevation: 0, marginBottom: 12 },
  optionCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  feedbackCard: { borderRadius: 20, elevation: 0, borderWidth: 2, marginTop: 8 },
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
