import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const TUTOR_PERFORMANCE = [
  { name: 'Pedro Sambo', subject: 'Matemática', lessons: 45, rating: 4.9, revenue: 24750 },
  { name: 'Mário Langa', subject: 'Física', lessons: 38, rating: 4.8, revenue: 26600 },
  { name: 'Ana Vilanculos', subject: 'Português', lessons: 22, rating: 4.7, revenue: 9900 },
];

const EXAM_STATS = [
  { institution: 'UEM', subject: 'Matemática', attempts: 234, avgScore: 14.2, passRate: 0.72 },
  { institution: 'UEM', subject: 'Física', attempts: 156, avgScore: 13.8, passRate: 0.65 },
  { institution: 'UP', subject: 'Português', attempts: 189, avgScore: 15.1, passRate: 0.78 },
  { institution: 'UCM', subject: 'Biologia', attempts: 98, avgScore: 12.5, passRate: 0.58 },
];

const REVENUE_DATA = [
  { month: 'Set', value: 45000 },
  { month: 'Out', value: 62000 },
  { month: 'Nov', value: 78000 },
  { month: 'Dez', value: 95000 },
  { month: 'Jan', value: 112000 },
  { month: 'Fev', value: 135000 },
];

export default function AdminReportsScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<'tutors' | 'exams' | 'revenue'>('tutors');
  const maxRevenue = Math.max(...REVENUE_DATA.map(r => r.value));

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
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Relatórios</Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Análise de performance e métricas.</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['tutors', 'exams', 'revenue'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && styles.tabBtnActive]}>
            <IconButton
              icon={t === 'tutors' ? 'account-group' : t === 'exams' ? 'school' : 'chart-line'}
              iconColor={tab === t ? '#fff' : '#9ca3af'}
              size={16}
              style={{ margin: 0 }}
            />
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'tutors' ? 'Tutores' : t === 'exams' ? 'Exames' : 'Receita'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tutors Performance */}
      {tab === 'tutors' && (
        <>
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Performance de Tutores</Text>
              {TUTOR_PERFORMANCE.map((tutor, i) => (
                <View key={i} style={styles.tutorRow}>
                  <View style={styles.tutorRank}>
                    <Text style={{ fontWeight: '800', fontSize: 16, color: i === 0 ? '#eab308' : '#9ca3af' }}>#{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{tutor.name}</Text>
                    <Text style={{ fontSize: 11, color: '#9ca3af' }}>{tutor.subject}</Text>
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <IconButton icon="book-open-variant" iconColor="#4f46e5" size={12} style={{ margin: 0 }} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#4b5563' }}>{tutor.lessons} aulas</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <IconButton icon="star" iconColor="#eab308" size={12} style={{ margin: 0 }} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#4b5563' }}>{tutor.rating}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <IconButton icon="cash" iconColor="#10b981" size={12} style={{ margin: 0 }} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#4b5563' }}>{tutor.revenue.toLocaleString()} MT</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        </>
      )}

      {/* Exam Stats */}
      {tab === 'exams' && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Taxa de Aprovação por Exame</Text>
            {EXAM_STATS.map((exam, i) => (
              <View key={i} style={styles.examRow}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{exam.subject}</Text>
                    <Text style={{ fontSize: 11, color: '#9ca3af' }}>{exam.institution} • {exam.attempts} tentativas</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: '800', fontSize: 18, color: exam.passRate >= 0.7 ? '#10b981' : exam.passRate >= 0.6 ? '#f97316' : '#ef4444' }}>
                      {(exam.passRate * 100).toFixed(0)}%
                    </Text>
                    <Text style={{ fontSize: 11, color: '#9ca3af' }}>Média: {exam.avgScore}/20</Text>
                  </View>
                </View>
                <ProgressBar
                  progress={exam.passRate}
                  color={exam.passRate >= 0.7 ? '#10b981' : exam.passRate >= 0.6 ? '#f97316' : '#ef4444'}
                  style={styles.progressBar}
                />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Revenue */}
      {tab === 'revenue' && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Receita por Período</Text>
            <View style={styles.chartContainer}>
              {REVENUE_DATA.map((item, i) => (
                <View key={i} style={styles.barContainer}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#9ca3af', marginBottom: 4 }}>
                    {(item.value / 1000).toFixed(0)}k
                  </Text>
                  <View style={styles.barBg}>
                    <View style={[styles.bar, { height: `${(item.value / maxRevenue) * 100}%` }]} />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#6b7280', marginTop: 6 }}>{item.month}</Text>
                </View>
              ))}
            </View>
            <View style={styles.revenueSummary}>
              <View style={styles.revSumItem}>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Total 6 meses</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#4f46e5' }}>
                  {(REVENUE_DATA.reduce((a, r) => a + r.value, 0) / 1000).toFixed(0)}k MT
                </Text>
              </View>
              <View style={styles.revSumItem}>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Crescimento</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#10b981' }}>+200%</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}
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
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f3f4f6' },
  tabBtnActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  sectionCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  sectionTitle: { fontWeight: '800', color: '#111827', marginBottom: 16 },
  tutorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  tutorRank: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  examRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: '#f3f4f6' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 180, marginBottom: 20 },
  barContainer: { flex: 1, alignItems: 'center' },
  barBg: { width: 28, height: 140, backgroundColor: '#f3f4f6', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', backgroundColor: '#4f46e5', borderRadius: 8 },
  revenueSummary: { flexDirection: 'row', gap: 12 },
  revSumItem: { flex: 1, alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, gap: 4 },
});
