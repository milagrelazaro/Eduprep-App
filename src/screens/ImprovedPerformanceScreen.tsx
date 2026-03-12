import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, ProgressBar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { ExamResult } from '../types';

export default function ImprovedPerformanceScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const saved = await AsyncStorage.getItem('eduprep_exam_results');
    if (saved) {
      setResults(JSON.parse(saved));
    }
  };

  const subjects = ['all', ...Array.from(new Set(results.map(r => r.examName.split(' - ')[0])))];
  
  const filteredResults = selectedSubject === 'all' 
    ? results 
    : results.filter(r => r.examName.includes(selectedSubject));

  const averageScore = filteredResults.length > 0
    ? filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length
    : 0;

  const totalQuestions = filteredResults.reduce((sum, r) => sum + r.totalQuestions, 0);
  const totalCorrect = filteredResults.reduce((sum, r) => sum + r.correctAnswers, 0);
  const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  const getPerformanceLevel = (score: number) => {
    if (score >= 16) return { label: 'Excelente', color: '#10b981', icon: '🌟' };
    if (score >= 14) return { label: 'Muito Bom', color: '#3b82f6', icon: '⭐' };
    if (score >= 10) return { label: 'Bom', color: '#f59e0b', icon: '👍' };
    return { label: 'Precisa Melhorar', color: '#ef4444', icon: '📚' };
  };

  const level = getPerformanceLevel(averageScore);

  const getRecommendations = () => {
    const recommendations = [];
    
    if (averageScore < 10) {
      recommendations.push({
        icon: '👨‍🏫',
        title: 'Busque um Tutor',
        description: 'Seu desempenho indica que você precisa de ajuda especializada. Recomendamos agendar aulas com um tutor.',
        action: 'Encontrar Tutor',
        color: '#ef4444',
      });
    }

    if (accuracy < 60) {
      recommendations.push({
        icon: '📖',
        title: 'Revise os Fundamentos',
        description: 'Sua taxa de acerto está abaixo do ideal. Foque em revisar os conceitos básicos antes de avançar.',
        action: 'Ver Conteúdos',
        color: '#f59e0b',
      });
    }

    if (filteredResults.length < 5) {
      recommendations.push({
        icon: '🎯',
        title: 'Pratique Mais',
        description: 'Quanto mais simulados você fizer, melhor será sua preparação. Tente fazer pelo menos 10 simulados.',
        action: 'Fazer Simulado',
        color: '#3b82f6',
      });
    }

    if (averageScore >= 14) {
      recommendations.push({
        icon: '🚀',
        title: 'Mantenha o Ritmo',
        description: 'Excelente desempenho! Continue praticando para manter seu nível e aumentar suas chances de aprovação.',
        action: 'Continuar Praticando',
        color: '#10b981',
      });
    }

    if (user?.competingDisciplines && user.competingDisciplines.length > 0) {
      const missingSubjects = user.competingDisciplines.filter(
        d => !results.some(r => r.examName.includes(d))
      );
      
      if (missingSubjects.length > 0) {
        recommendations.push({
          icon: '⚠️',
          title: 'Disciplinas Não Praticadas',
          description: `Você ainda não fez simulados de: ${missingSubjects.join(', ')}. Complete todas as disciplinas do seu curso.`,
          action: 'Ver Disciplinas',
          color: '#f59e0b',
        });
      }
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <IconButton 
              icon="arrow-left" 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            />
            <Text variant="headlineSmall" style={styles.title}>
              Desempenho Acadêmico
            </Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.subtitle}>
            Análise detalhada do seu progresso
          </Text>
        </View>

        {user?.intendedCourse && (
          <Card style={styles.goalCard}>
            <Card.Content>
              <View style={styles.goalHeader}>
                <IconButton icon="school" iconColor="#4f46e5" size={24} style={{ margin: 0 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalTitle}>Seu Objetivo</Text>
                  <Text style={styles.goalCourse}>{user.intendedCourse}</Text>
                  {user.targetUniversity && (
                    <Text style={styles.goalUniversity}>{user.targetUniversity}</Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.statsCard}>
          <Card.Content>
            <View style={styles.mainStat}>
              <View style={[styles.scoreCircle, { backgroundColor: level.color + '20' }]}>
                <Text style={[styles.scoreValue, { color: level.color }]}>
                  {averageScore.toFixed(1)}
                </Text>
                <Text style={styles.scoreMax}>/20</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 20 }}>
                <Text style={styles.levelLabel}>{level.icon} {level.label}</Text>
                <Text style={styles.levelDesc}>Média Geral</Text>
                <ProgressBar
                  progress={averageScore / 20}
                  color={level.color}
                  style={styles.progressBar}
                />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{filteredResults.length}</Text>
                <Text style={styles.statLabel}>Simulados</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#10b981' }]}>
                  {accuracy.toFixed(0)}%
                </Text>
                <Text style={styles.statLabel}>Taxa de Acerto</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCorrect}</Text>
                <Text style={styles.statLabel}>Questões Certas</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.filterSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Filtrar por Disciplina
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {subjects.map(subject => (
                <Chip
                  key={subject}
                  selected={selectedSubject === subject}
                  onPress={() => setSelectedSubject(subject)}
                  style={styles.chip}
                >
                  {subject === 'all' ? 'Todas' : subject}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.recommendationsSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            💡 Recomendações Personalizadas
          </Text>
          {recommendations.map((rec, index) => (
            <Card key={index} style={[styles.recommendationCard, { borderLeftColor: rec.color }]}>
              <Card.Content>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationIcon}>{rec.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recommendationTitle}>{rec.title}</Text>
                    <Text style={styles.recommendationDesc}>{rec.description}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {filteredResults.length > 0 && (
          <View style={styles.historySection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📊 Histórico de Simulados
            </Text>
            {filteredResults.slice(0, 10).map((result) => {
              const resultLevel = getPerformanceLevel(result.score);
              return (
                <Card key={result.id} style={styles.historyCard}>
                  <Card.Content>
                    <View style={styles.historyHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyTitle}>{result.examName}</Text>
                        <Text style={styles.historyDate}>
                          {new Date(result.date).toLocaleDateString('pt-PT')}
                        </Text>
                      </View>
                      <View style={[styles.historyScore, { backgroundColor: resultLevel.color + '20' }]}>
                        <Text style={[styles.historyScoreText, { color: resultLevel.color }]}>
                          {result.score}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.historyStats}>
                      <Text style={styles.historyStatText}>
                        ✓ {result.correctAnswers}/{result.totalQuestions} questões
                      </Text>
                      <Text style={styles.historyStatText}>
                        {((result.correctAnswers / result.totalQuestions) * 100).toFixed(0)}% de acerto
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}

        {filteredResults.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>Nenhum Simulado Realizado</Text>
              <Text style={styles.emptyText}>
                Comece a fazer simulados para acompanhar seu progresso e receber recomendações personalizadas.
              </Text>
            </Card.Content>
          </Card>
        )}
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
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  goalCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  goalCourse: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4f46e5',
    marginTop: 2,
  },
  goalUniversity: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  statsCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  mainStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  levelDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4f46e5',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f3f4f6',
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recommendationIcon: {
    fontSize: 24,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  recommendationDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  historySection: {
    marginBottom: 20,
  },
  historyCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  historyDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  historyScore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyScoreText: {
    fontSize: 18,
    fontWeight: '800',
  },
  historyStats: {
    flexDirection: 'row',
    gap: 16,
  },
  historyStatText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyCard: {
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyIconheader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  backButton: {
    margin: 0,
  },
  placeholder: {
    width: 48, // Same width as back button for centering
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 280,
  },
});
