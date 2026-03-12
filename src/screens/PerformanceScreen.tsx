import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, IconButton, ProgressBar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_PERFORMANCE = {
  overallScore: 14.5,
  targetScore: 16,
  examsTaken: 12,
  strongSubjects: ['Matemática', 'Física'],
  weakSubjects: ['Português', 'Biologia'],
  recommendations: [
    {
      id: '1',
      type: 'critical',
      title: 'Melhore em Português',
      description: 'A sua média em Português está abaixo do necessário (12/20). Recomendamos 3 aulas semanais com foco em interpretação de texto.',
      action: 'Marcar Aula de Português',
      icon: 'alert-circle',
      color: '#ef4444',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Aumente a velocidade em Matemática',
      description: 'Você acerta 85% das questões mas demora muito tempo. Pratique mais simulados cronometrados.',
      action: 'Fazer Simulado Cronometrado',
      icon: 'clock-alert',
      color: '#f97316',
    },
    {
      id: '3',
      type: 'success',
      title: 'Excelente progresso em Física!',
      description: 'Subiu de 13 para 16 pontos em 2 semanas. Continue com este ritmo e terá 95% de chance de admissão.',
      action: 'Ver Estatísticas',
      icon: 'trophy',
      color: '#10b981',
    },
    {
      id: '4',
      type: 'info',
      title: 'Foco na UEM - Medicina',
      description: 'Com base no seu curso pretendido, você precisa de média mínima de 16/20. Atualmente está em 14.5/20.',
      action: 'Ver Requisitos UEM',
      icon: 'school',
      color: '#3b82f6',
    },
  ],
  subjectProgress: [
    { subject: 'Matemática', current: 16, target: 17, trend: 'up' },
    { subject: 'Física', current: 16, target: 16, trend: 'up' },
    { subject: 'Química', current: 14, target: 15, trend: 'stable' },
    { subject: 'Biologia', current: 13, target: 15, trend: 'down' },
    { subject: 'Português', current: 12, target: 16, trend: 'down' },
  ],
};

export default function PerformanceScreen() {
  const navigation = useNavigation();
  const [performance, setPerformance] = useState(MOCK_PERFORMANCE);

  const admissionChance = Math.min(95, Math.round((performance.overallScore / performance.targetScore) * 100));

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
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Desempenho</Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Análise completa e recomendações personalizadas.</Text>
          </View>
        </View>
      </View>

      {/* Overall Score Card */}
      <Card style={[styles.card, { backgroundColor: '#4f46e5' }]}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 1 }}>MÉDIA GERAL</Text>
              <Text style={{ fontSize: 40, fontWeight: '800', color: '#fff', marginTop: 4 }}>{performance.overallScore}</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Meta: {performance.targetScore}/20</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={styles.chanceCircle}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#4f46e5' }}>{admissionChance}%</Text>
              </View>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 8, fontWeight: '600' }}>Chance de Admissão</Text>
            </View>
          </View>
          <ProgressBar progress={performance.overallScore / 20} color="#fff" style={{ height: 6, borderRadius: 3, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </Card.Content>
      </Card>

      {/* Recommendations */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Recomendações para Aumentar suas Chances</Text>
      {performance.recommendations.map(rec => (
        <Card key={rec.id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: rec.color }]}>
          <Card.Content>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.recIcon, { backgroundColor: `${rec.color}15` }]}>
                <IconButton icon={rec.icon} iconColor={rec.color} size={20} style={{ margin: 0 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', fontSize: 15, color: '#111827', marginBottom: 4 }}>{rec.title}</Text>
                <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 12 }}>{rec.description}</Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => {}}
                  style={{ borderColor: rec.color, borderRadius: 12, alignSelf: 'flex-start' }}
                  labelStyle={{ fontSize: 12, fontWeight: '700', color: rec.color }}
                >
                  {rec.action}
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* Subject Progress */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Progresso por Disciplina</Text>
      <Card style={styles.card}>
        <Card.Content>
          {performance.subjectProgress.map((item, i) => (
            <View key={i} style={styles.subjectRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{item.subject}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: item.current >= item.target ? '#10b981' : '#ef4444' }}>
                      {item.current}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#9ca3af' }}>/ {item.target}</Text>
                    <IconButton
                      icon={item.trend === 'up' ? 'trending-up' : item.trend === 'down' ? 'trending-down' : 'minus'}
                      iconColor={item.trend === 'up' ? '#10b981' : item.trend === 'down' ? '#ef4444' : '#9ca3af'}
                      size={16}
                      style={{ margin: 0 }}
                    />
                  </View>
                </View>
                <ProgressBar
                  progress={item.current / 20}
                  color={item.current >= item.target ? '#10b981' : '#f97316'}
                  style={{ height: 6, borderRadius: 3, backgroundColor: '#f3f4f6' }}
                />
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Stats Summary */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <Card style={[styles.card, { flex: 1 }]}>
          <Card.Content style={{ alignItems: 'center' }}>
            <IconButton icon="clipboard-check" iconColor="#4f46e5" size={24} style={{ margin: 0 }} />
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 4 }}>{performance.examsTaken}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Simulados</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.card, { flex: 1 }]}>
          <Card.Content style={{ alignItems: 'center' }}>
            <IconButton icon="chart-line" iconColor="#10b981" size={24} style={{ margin: 0 }} />
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 4 }}>+2.5</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Evolução</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.card, { flex: 1 }]}>
          <Card.Content style={{ alignItems: 'center' }}>
            <IconButton icon="target" iconColor="#f97316" size={24} style={{ margin: 0 }} />
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 4 }}>1.5</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Falta</Text>
          </Card.Content>
        </Card>
      </View>
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
  card: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 },
  sectionTitle: { fontWeight: '800', color: '#111827', marginBottom: 12, marginTop: 8 },
  chanceCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  recIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  subjectRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
});
