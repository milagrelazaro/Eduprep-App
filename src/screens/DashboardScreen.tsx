import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, IconButton, Button } from 'react-native-paper';
import { useNavigation, CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { MainTabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { examResultService } from '../services/firebaseService';

type StackNav = NativeStackNavigationProp<RootStackParamList>;
type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  StackNav
>;

function DashCard({ title, value, subtitle, icon, color }: any) {
  const colorMap: any = {
    blue: { bg: '#eff6ff', text: '#3b82f6' },
    indigo: { bg: '#eef2ff', text: '#4f46e5' },
    green: { bg: '#ecfdf5', text: '#10b981' },
    yellow: { bg: '#fefce8', text: '#eab308' },
    orange: { bg: '#fff7ed', text: '#f97316' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <Card style={styles.dashCard}>
      <Card.Content>
        <View style={styles.dashCardHeader}>
          <View style={[styles.dashIconBox, { backgroundColor: c.bg }]}>
            <IconButton icon={icon} iconColor={c.text} size={22} />
          </View>
          <Text variant="labelSmall" style={styles.dashCardLabel}>{title}</Text>
        </View>
        <Text variant="headlineSmall" style={styles.dashCardValue}>{value}</Text>
        <Text variant="bodySmall" style={{ color: '#9ca3af', marginTop: 2 }}>{subtitle}</Text>
      </Card.Content>
    </Card>
  );
}

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<DashboardNavigationProp>();
  const isStudent = user?.role === UserRole.STUDENT;

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: async () => await logout() },
      ]
    );
  };

  const [examResults, setExamResults] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadExamResults();
    }, [user?.id])
  );

  const loadExamResults = async () => {
    try {
      console.log('=== CARREGANDO RESULTADOS DO FIRESTORE ===');
      console.log('User ID:', user?.id ?? '');
      const results = await examResultService.getResultsByStudent(user?.id ?? '');
      console.log('Resultados carregados:', results);
      console.log('Quantidade de resultados:', results.length);
      setExamResults(results);
      console.log('=== FIM DO CARREGAMENTO ===');
    } catch (error) {
      console.error('Error loading exam results:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  };

  const averageScore = examResults.length > 0 
    ? (examResults.reduce((sum: number, r: any) => sum + r.score, 0) / examResults.length).toFixed(1)
    : '0';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={styles.greeting}>Olá, {user?.name}! 👋</Text>
          <Text variant="bodyMedium" style={{ color: '#6b7280' }}>
            {isStudent ? 'Pronto para praticar os simulados de exames?' : 'Gerencie os exames do sistema.'}
          </Text>
        </View>
        <IconButton
          icon="logout"
          iconColor="#ef4444"
          size={24}
          style={{ backgroundColor: '#fef2f2', borderRadius: 12 }}
          onPress={handleLogout}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', gap: 12, paddingRight: 16 }}>
          {isStudent ? (
            <>
              <DashCard title="Simulados Feitos" value={examResults.length.toString()} subtitle="Total de sessões" icon="trophy" color="green" />
              <DashCard title="Média" value={`${averageScore}/20`} subtitle="Pontuação média" icon="chart-line" color="indigo" />
              <DashCard title="Progresso" value={examResults.length > 0 ? `${Math.min(100, examResults.length * 10)}%` : '0%'} subtitle="Baseado em simulados" icon="trending-up" color="blue" />
            </>
          ) : (
            <>
              <DashCard title="Status" value="Ativo" subtitle="Sistema operacional" icon="check-circle" color="green" />
              <DashCard title="Painel Admin" value="Ativo" subtitle="Gestão completa" icon="shield-account" color="indigo" />
            </>
          )}
        </View>
      </ScrollView>

      {/* BOTÃO PRINCIPAL - SIMULADOR */}
      <Card style={styles.simulatorCard}>
        <Card.Content style={styles.simulatorCardContent}>
          <View style={{ flex: 1 }}>
            <Text variant="titleLarge" style={styles.simulatorTitle}>🎓 Simulador de Exames</Text>
            <Text variant="bodyMedium" style={styles.simulatorSubtitle}>
              Pratique com até 10 perguntas por exame dos exames reais das universidades.
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('EnhancedSimulator')}
            style={styles.simulatorButton}
            contentStyle={{ paddingVertical: 8 }}
          >
            Iniciar Simulado
          </Button>
        </Card.Content>
      </Card>

      {/* Histórico Recente (apenas para estudantes) */}
      {isStudent && examResults.length > 0 ? (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>📊 Histórico Recente</Text>
            {examResults.slice(0, 3).map((result: any) => (
              <View key={result.id} style={styles.resultRow}>
                <View style={styles.resultIconBox}>
                  <Text style={styles.resultScore}>{result.score}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: '700', color: '#111827' }}>
                    {result.examName || 'Simulado'}
                  </Text>
                  <Text variant="labelSmall" style={{ color: '#9ca3af' }}>
                    {new Date(result.date).toLocaleDateString('pt-PT')} • {result.correctAnswers}/{result.totalQuestions} acertos
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      ) : isStudent && (
        <Card style={styles.sectionCard}>
          <Card.Content style={{ alignItems: 'center', padding: 24 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🎯</Text>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: '#111827', marginBottom: 4, textAlign: 'center' }}>
              Comece sua jornada!
            </Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280', textAlign: 'center' }}>
              Faça seu primeiro simulado para ver seu histórico aqui.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* CTA para estudantes */}
      {isStudent && (
        <Card style={styles.ctaCard}>
          <Card.Content style={styles.ctaContent}>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontWeight: '800', color: '#fff', marginBottom: 8 }}>
                🎯 Prepare-se para o Exame de Admissão!
              </Text>
              <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Pratique regularmente com os simulados para aumentar suas chances de aprovação.
              </Text>
            </View>
            <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('EnhancedSimulator')}>
              <Text style={{ color: '#4f46e5', fontWeight: '800', fontSize: 16 }}>Começar Agora</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  greeting: { fontWeight: '800', color: '#111827' },
  dashCard: { width: 180, backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  dashCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  dashIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dashCardLabel: { color: '#9ca3af', letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  dashCardValue: { fontWeight: '800', color: '#111827' },
  simulatorCard: { backgroundColor: '#4f46e5', borderRadius: 20, elevation: 4, marginBottom: 16 },
  simulatorCardContent: { padding: 20 },
  simulatorTitle: { fontWeight: '800', color: '#fff', fontSize: 20, marginBottom: 8 },
  simulatorSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 16 },
  simulatorButton: { backgroundColor: '#fff', borderRadius: 12 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  sectionTitle: { fontWeight: '800', color: '#111827', marginBottom: 16 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  resultIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  resultScore: { fontSize: 18, fontWeight: '800', color: '#4f46e5' },
  ctaCard: { backgroundColor: '#4f46e5', borderRadius: 20, elevation: 4, marginTop: 8 },
  ctaContent: { flexDirection: 'column', gap: 16, padding: 8 },
  ctaButton: { backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, alignItems: 'center', alignSelf: 'flex-start' },
});
