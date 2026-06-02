import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { examResultService } from '../services/firebaseService';

export default function ExamHistoryScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [examResults, setExamResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadExamResults();
    }, [user?.id])
  );

  const loadExamResults = async () => {
    try {
      setLoading(true);
      console.log('=== HISTÓRICO: CARREGANDO RESULTADOS ===');
      const results = await examResultService.getResultsByStudent(user?.id ?? '');
      console.log('Total de resultados:', results.length);
      setExamResults(results);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
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

  const averageScore = examResults.length > 0 
    ? (examResults.reduce((sum: number, r: any) => sum + r.score, 0) / examResults.length).toFixed(1)
    : '0';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ fontSize: 24, color: '#4f46e5' }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={styles.title}>Histórico de Simulados</Text>
          <Text variant="bodyMedium" style={{ color: '#6b7280' }}>
            {examResults.length} simulado{examResults.length !== 1 ? 's' : ''} realizado{examResults.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Estatísticas Gerais */}
      {examResults.length > 0 && (
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12 }}>📊 Estatísticas Gerais</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{examResults.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#4f46e5' }]}>{averageScore}%</Text>
                <Text style={styles.statLabel}>Média</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#10b981' }]}>
                  {examResults.filter(r => r.score >= 14).length}
                </Text>
                <Text style={styles.statLabel}>Excelente</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                  {examResults.filter(r => r.score >= 10 && r.score < 14).length}
                </Text>
                <Text style={styles.statLabel}>Bom</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Lista de Simulados */}
      {loading ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={{ textAlign: 'center', color: '#6b7280' }}>Carregando histórico...</Text>
          </Card.Content>
        </Card>
      ) : examResults.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>📝</Text>
            <Text variant="titleMedium" style={{ textAlign: 'center', fontWeight: '700', marginBottom: 8 }}>
              Nenhum simulado realizado
            </Text>
            <Text style={{ textAlign: 'center', color: '#6b7280' }}>
              Comece sua jornada fazendo seu primeiro simulado!
            </Text>
          </Card.Content>
        </Card>
      ) : (
        examResults.map((result: any, index: number) => (
          <TouchableOpacity 
            key={result.id}
            onPress={() => navigation.navigate('ExamReview' as never, { resultId: result.id } as never)}
            activeOpacity={0.7}
          >
            <Card style={styles.resultCard}>
              <Card.Content>
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={styles.examName}>
                    {result.examName || result.subject || 'Simulado'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#6b7280' }}>
                    {formatDate(result.date)}
                  </Text>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreBg(result.score) }]}>
                  <Text style={[styles.scoreText, { color: getScoreColor(result.score) }]}>
                    {(result.score || 0).toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={styles.resultDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Questões</Text>
                  <Text style={styles.detailValue}>
                    {result.correctAnswers || 0}/{result.totalQuestions || 0}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Acertos</Text>
                  <Text style={[styles.detailValue, { color: '#10b981' }]}>
                    {Math.round(((result.correctAnswers || 0) / (result.totalQuestions || 1)) * 100)}%
                  </Text>
                </View>
                {result.duration > 0 && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Tempo</Text>
                    <Text style={styles.detailValue}>
                      {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                )}
              </View>

              {result.analysis && (
                <View style={[styles.analysisBox, { 
                  backgroundColor: getScoreBg(result.score),
                  borderLeftColor: getScoreColor(result.score)
                }]}>
                  <Text style={{ color: getScoreColor(result.score), fontSize: 12 }}>
                    {result.analysis}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
          </TouchableOpacity>
        ))
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
  statsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  resultCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  examName: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '800',
  },
  resultDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  analysisBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
});
