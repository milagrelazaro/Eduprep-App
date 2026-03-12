import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTITUTIONS = ['UEM', 'UP', 'UCM', 'Unilúrio'];
const SUBJECTS_LIST = ['Matemática', 'Português', 'Física'];

export default function ExamCenterScreen() {
  const navigation = useNavigation();
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});

  const startSimulado = () => {
    setIsSimulating(true);
    setSelectedAnswers({});
  };

  const submitExam = async () => {
    const score = Math.floor(Math.random() * 11) + 10;
    const result = {
      id: Date.now().toString(),
      score,
      date: new Date().toLocaleDateString(),
      subject: 'Matemática',
    };

    const saved = await AsyncStorage.getItem('eduprep_exams');
    const exams = saved ? JSON.parse(saved) : [];
    await AsyncStorage.setItem('eduprep_exams', JSON.stringify([result, ...exams]));

    setCurrentScore(score);
    setIsSimulating(false);
    setAiAdvice(
      score >= 14
        ? 'Excelente resultado! Continue focado em trigonometria avançada e funções compostas para consolidar o seu nível.'
        : 'Recomendamos focar em funções logarítmicas e trigonometria. Agende uma sessão com um tutor especialista para melhorar rapidamente.'
    );
  };

  if (isSimulating) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.examHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconButton icon="close" onPress={() => setIsSimulating(false)} />
              <Text variant="titleMedium" style={{ fontWeight: '700' }}>Simulado: Matemática 2024</Text>
            </View>
            <View style={styles.timerBadge}>
              <IconButton icon="clock-outline" iconColor="#ef4444" size={18} style={{ margin: 0 }} />
              <Text style={styles.timerText}>119:45</Text>
            </View>
          </View>

          {[1, 2, 3, 4, 5].map((q) => (
            <Card key={q} style={styles.questionCard}>
              <Card.Content>
                <View style={styles.questionBadge}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#4f46e5' }}>Questão {q}</Text>
                </View>
                <Text variant="titleMedium" style={styles.questionText}>
                  Resolva a equação logarítmica log₂({q}x + 4) = 3. Qual o valor de x?
                </Text>
                {['x = 1', 'x = 2', 'x = 3', 'x = 4'].map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.optionBtn, selectedAnswers[q] === idx && styles.optionBtnActive]}
                    onPress={() => setSelectedAnswers({ ...selectedAnswers, [q]: idx })}
                  >
                    <View style={[styles.optionLetter, selectedAnswers[q] === idx && styles.optionLetterActive]}>
                      <Text style={[styles.optionLetterText, selectedAnswers[q] === idx && { color: '#fff' }]}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, selectedAnswers[q] === idx && { color: '#312e81' }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </Card.Content>
            </Card>
          ))}

          <Button
            mode="contained"
            onPress={submitExam}
            style={styles.submitBtn}
            labelStyle={{ fontWeight: '800', color: '#fff', fontSize: 15 }}
            contentStyle={{ paddingVertical: 8 }}
          >
            Finalizar e Ver Resultado
          </Button>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Centro de Exames</Text>
          <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Prepare-se para as melhores universidades.</Text>
        </View>
      </View>

      <Card style={{ backgroundColor: '#4f46e5', borderRadius: 16, marginBottom: 20 }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconButton icon="star" iconColor="#fbbf24" size={32} style={{ margin: 0 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 }}>
                Simulador Avançado
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                Feedback em tempo real, links educacionais e análise detalhada
              </Text>
            </View>
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('EnhancedSimulator' as never)}
            style={{ backgroundColor: '#fff', marginTop: 12, borderRadius: 12 }}
            labelStyle={{ color: '#4f46e5', fontWeight: '700' }}
          >
            Iniciar Simulador
          </Button>
        </Card.Content>
      </Card>

      {currentScore !== null && (
        <Card style={styles.resultCard}>
          <Card.Content>
            <View style={styles.resultBadge}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#4f46e5' }}>RESULTADO RECENTE</Text>
            </View>
            <Text style={styles.scoreText}>
              {currentScore}<Text style={styles.scoreMax}>/20</Text>
            </Text>
            <Text style={[styles.scoreMessage, { color: currentScore >= 14 ? '#10b981' : '#f97316' }]}>
              {currentScore >= 14 ? 'Excelente progresso!' : 'Podes melhorar com estudo focado.'}
            </Text>

            {aiAdvice && (
              <View style={styles.aiBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <IconButton icon="auto-fix" iconColor="#4f46e5" size={18} style={{ margin: 0 }} />
                  <Text style={{ fontWeight: '700', color: '#312e81' }}>IA Advisor</Text>
                </View>
                <Text style={styles.aiText}>"{aiAdvice}"</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {INSTITUTIONS.map((inst) => (
        <Card key={inst} style={styles.instCard}>
          <Card.Content>
            <View style={styles.instIcon}>
              <Text style={{ fontWeight: '800', fontSize: 20, color: '#d1d5db' }}>{inst[0]}</Text>
            </View>
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 2 }}>{inst}</Text>
            <Text variant="bodySmall" style={{ color: '#9ca3af', marginBottom: 16 }}>Exames atualizados 2024</Text>
            {SUBJECTS_LIST.map(sub => (
              <TouchableOpacity key={sub} style={styles.examAction} onPress={startSimulado}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.examActionIcon}>
                    <IconButton icon="book-open-variant" iconColor="#9ca3af" size={16} style={{ margin: 0 }} />
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#4b5563' }}>{sub}</Text>
                </View>
                <IconButton icon="play-circle" iconColor="#d1d5db" size={20} style={{ margin: 0 }} />
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 24 },
  examHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, backgroundColor: '#fff', borderRadius: 16, padding: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
  timerText: { fontWeight: '700', color: '#ef4444', fontFamily: 'monospace' },
  questionCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  questionBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  questionText: { fontWeight: '700', color: '#1f2937', marginBottom: 20, lineHeight: 26 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 8 },
  optionBtnActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  optionLetter: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionLetterActive: { backgroundColor: '#4f46e5' },
  optionLetterText: { fontWeight: '800', color: '#9ca3af' },
  optionText: { fontWeight: '700', color: '#4b5563' },
  submitBtn: { backgroundColor: '#4f46e5', borderRadius: 16, elevation: 4, marginTop: 8 },
  resultCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 2, borderColor: '#4f46e5', elevation: 2, marginBottom: 24 },
  resultBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  scoreText: { fontSize: 56, fontWeight: '800', color: '#4f46e5' },
  scoreMax: { fontSize: 20, color: '#d1d5db', fontWeight: '400' },
  scoreMessage: { fontWeight: '700', fontSize: 16, marginTop: 4, marginBottom: 16 },
  aiBox: { backgroundColor: '#eef2ff', borderRadius: 16, padding: 16 },
  aiText: { fontSize: 13, color: '#312e81', lineHeight: 20, fontStyle: 'italic' },
  instCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  instIcon: { width: 48, height: 48, backgroundColor: '#f9fafb', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  examAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f9fafb', marginBottom: 6 },
  examActionIcon: { width: 32, height: 32, backgroundColor: '#f9fafb', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
