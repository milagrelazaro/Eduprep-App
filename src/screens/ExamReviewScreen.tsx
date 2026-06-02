import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ExamReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { resultId } = route.params as { resultId: string };
  
  const [result, setResult] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResultDetails();
  }, [resultId]);

  const loadResultDetails = async () => {
    try {
      setLoading(true);
      console.log('Carregando detalhes do resultado:', resultId);
      
      // Buscar resultado
      const resultsRef = collection(db, 'examResults');
      const resultQuery = query(resultsRef, where('__name__', '==', resultId));
      const resultSnapshot = await getDocs(resultQuery);
      
      if (!resultSnapshot.empty) {
        const resultData = { id: resultSnapshot.docs[0].id, ...resultSnapshot.docs[0].data() };
        setResult(resultData);
        
        // Buscar questões do exame
        if (resultData.examId) {
          const questionsRef = collection(db, 'exams', resultData.examId, 'questions');
          const questionsSnapshot = await getDocs(questionsRef);
          const questionsData = questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setQuestions(questionsData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Data desconhecida';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 14) return '#10b981';
    if (score >= 10) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreBg = (score: number) => {
    if (score >= 14) return '#ecfdf5';
    if (score >= 10) return '#fffbeb';
    return '#fef2f2';
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={{ fontSize: 24, color: '#4f46e5' }}>←</Text>
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.title}>Carregando...</Text>
        </View>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={{ fontSize: 24, color: '#4f46e5' }}>←</Text>
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.title}>Resultado não encontrado</Text>
        </View>
      </View>
    );
  }

  const percentage = ((result.correctAnswers || 0) / (result.totalQuestions || 1)) * 100;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ fontSize: 24, color: '#4f46e5' }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={styles.title}>Revisão do Simulado</Text>
          <Text variant="bodyMedium" style={{ color: '#6b7280' }}>
            {result.examName || result.subject || 'Simulado'}
          </Text>
        </View>
      </View>

      {/* Score Card */}
      <Card style={[styles.scoreCard, { backgroundColor: getScoreBg(result.score) }]}>
        <Card.Content style={{ alignItems: 'center', padding: 24 }}>
          <View style={[styles.scoreCircle, { backgroundColor: '#fff' }]}>
            <Text style={[styles.scoreValue, { color: getScoreColor(result.score) }]}>
              {(result.score || 0).toFixed(1)}%
            </Text>
          </View>
          <Text variant="headlineSmall" style={{ fontWeight: '800', marginTop: 16, marginBottom: 8 }}>
            {result.score >= 14 ? '🎉 Excelente!' : result.score >= 10 ? '👍 Bom Trabalho!' : '📚 Continue Estudando!'}
          </Text>
          <Text style={{ color: '#6b7280', textAlign: 'center' }}>
            Você acertou {result.correctAnswers || 0} de {result.totalQuestions || 0} questões ({(percentage || 0).toFixed(0)}%)
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>
            {formatDate(result.date)}
          </Text>
        </Card.Content>
      </Card>

      {/* Estatísticas */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>📊 Estatísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{result.correctAnswers || 0}</Text>
              <Text style={styles.statLabel}>Acertos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>
                {(result.totalQuestions || 0) - (result.correctAnswers || 0)}
              </Text>
              <Text style={styles.statLabel}>Erros</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{result.totalQuestions || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            {result.duration > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={styles.statLabel}>Tempo</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Análise */}
      {result.analysis && (
        <Card style={[styles.card, { backgroundColor: getScoreBg(result.score), borderLeftWidth: 4, borderLeftColor: getScoreColor(result.score) }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: getScoreColor(result.score) }]}>
              💡 Análise
            </Text>
            <Text style={{ color: '#374151' }}>{result.analysis}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Questões Revisadas */}
      {result.answers && result.answers.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📝 Questões ({result.answers.length})
            </Text>
            {result.answers.map((answer: any, index: number) => {
              const question = questions.find(q => q.id === answer.questionId);
              const isCorrect = answer.isCorrect || answer.correct;
              
              return (
                <View key={index} style={styles.questionItem}>
                  <View style={styles.questionHeader}>
                    <View style={[styles.questionNumber, { 
                      backgroundColor: isCorrect ? '#ecfdf5' : '#fef2f2',
                      borderColor: isCorrect ? '#10b981' : '#ef4444'
                    }]}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '700',
                        color: isCorrect ? '#10b981' : '#ef4444'
                      }}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 20, marginLeft: 8 }}>
                      {isCorrect ? '✅' : '❌'}
                    </Text>
                  </View>
                  
                  {question && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ color: '#374151', marginBottom: 8 }}>
                        {question.text}
                      </Text>
                      {question.options && question.options.map((option: string, optIndex: number) => {
                        const isSelected = answer.selectedOption === optIndex;
                        const isCorrectOption = question.correctOption === optIndex;
                        
                        return (
                          <View 
                            key={optIndex}
                            style={[
                              styles.optionItem,
                              isCorrectOption && { backgroundColor: '#ecfdf5', borderColor: '#10b981' },
                              isSelected && !isCorrectOption && { backgroundColor: '#fef2f2', borderColor: '#ef4444' }
                            ]}
                          >
                            <Text style={{ 
                              fontWeight: isCorrectOption || isSelected ? '700' : '400',
                              color: isCorrectOption ? '#10b981' : isSelected ? '#ef4444' : '#374151'
                            }}>
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {isCorrectOption && ' ✓'}
                              {isSelected && !isCorrectOption && ' ✗'}
                            </Text>
                          </View>
                        );
                      })}
                      
                      {question.explanation && (
                        <View style={styles.explanationBox}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 4 }}>
                            💡 Explicação:
                          </Text>
                          <Text style={{ fontSize: 12, color: '#6b7280' }}>
                            {question.explanation}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
    color: '#111827',
  },
  scoreCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  questionItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  explanationBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4f46e5',
  },
});
