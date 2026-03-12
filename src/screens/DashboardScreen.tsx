import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
  const { user } = useAuthStore();
  const navigation = useNavigation<Nav>();
  const isStudent = user?.role === UserRole.STUDENT;

  const [lessons, setLessons] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedLessons = await AsyncStorage.getItem('eduprep_lessons');
    const savedExams = await AsyncStorage.getItem('eduprep_exams');
    setLessons(savedLessons ? JSON.parse(savedLessons) : []);
    setExamResults(savedExams ? JSON.parse(savedExams) : []);
  };

  const handleLessonAction = async (id: string, action: 'confirmed' | 'cancelled') => {
    const updated = lessons.map(l => l.id === id ? { ...l, status: action } : l);
    setLessons(updated);
    await AsyncStorage.setItem('eduprep_lessons', JSON.stringify(updated));
  };

  const activeLessons = lessons.filter(l => l.status === 'confirmed');
  const pendingLessons = lessons.filter(l => l.status === 'pending');
  const displayLessons = isStudent ? activeLessons : pendingLessons;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={styles.greeting}>Olá, {user?.name}! 👋</Text>
          <Text variant="bodyMedium" style={{ color: '#6b7280' }}>
            {isStudent ? 'Pronto para dominar os próximos exames?' : 'Gerencie suas aulas e acompanhe seus ganhos.'}
          </Text>
        </View>
        {!isStudent && (
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Disponível</Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', gap: 12, paddingRight: 16 }}>
          {isStudent ? (
            <>
              <DashCard title="Próxima Aula" value={activeLessons.length > 0 ? activeLessons[0].subject : 'Sem aulas'} subtitle={activeLessons.length > 0 ? activeLessons[0].date : 'Agende hoje'} icon="clock-outline" color="blue" />
              <DashCard title="Progresso" value={examResults.length > 0 ? `${Math.min(100, examResults.length * 20)}%` : '0%'} subtitle="Baseado em simulados" icon="trending-up" color="indigo" />
              <DashCard title="Simulados" value={examResults.length.toString()} subtitle="Média 14.5/20" icon="trophy" color="green" />
            </>
          ) : (
            <>
              <DashCard title="Ganhos Totais" value="15.800 MT" subtitle="Ganhos este mês" icon="wallet" color="green" />
              <DashCard title="Pendentes" value={pendingLessons.length.toString()} subtitle="Aguardando confirmação" icon="calendar" color="orange" />
              <DashCard title="Avaliação" value="4.9" subtitle="Top 5%" icon="star" color="yellow" />
            </>
          )}
        </View>
      </ScrollView>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {isStudent ? 'Próximas Sessões' : 'Pedidos de Aula'}
          </Text>
          {displayLessons.length > 0 ? displayLessons.slice(0, 4).map((lesson: any) => (
            <View key={lesson.id} style={styles.lessonRow}>
              <Image source={{ uri: lesson.avatar || 'https://ui-avatars.com/api/?name=U' }} style={styles.lessonAvatar} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: '#111827' }}>{lesson.subject}</Text>
                <Text variant="labelSmall" style={{ color: '#9ca3af' }}>{lesson.tutorName || 'Estudante'} • {lesson.date}</Text>
              </View>
              {isStudent ? (
                <IconButton icon="play" iconColor="#fff" size={18} style={{ backgroundColor: '#4f46e5', borderRadius: 12 }} onPress={() => navigation.navigate('LessonRoom', { id: lesson.id })} />
              ) : (
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <IconButton icon="check" iconColor="#10b981" size={18} style={{ backgroundColor: '#ecfdf5', borderRadius: 12 }} onPress={() => handleLessonAction(lesson.id, 'confirmed')} />
                  <IconButton icon="close" iconColor="#ef4444" size={18} style={{ backgroundColor: '#fef2f2', borderRadius: 12 }} onPress={() => handleLessonAction(lesson.id, 'cancelled')} />
                </View>
              )}
            </View>
          )) : (
            <View style={styles.emptyState}>
              <IconButton icon="calendar-blank" iconColor="#d1d5db" size={40} />
              <Text variant="bodySmall" style={{ color: '#9ca3af', textAlign: 'center' }}>Tudo em dia! Sem pedidos no momento.</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Quick Access Cards */}
      <Text variant="titleMedium" style={{ fontWeight: '800', color: '#111827', marginBottom: 12 }}>Acesso Rápido</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('Performance')}>
          <Card style={styles.quickCard}>
            <Card.Content style={{ alignItems: 'center', paddingVertical: 20 }}>
              <View style={[styles.quickIcon, { backgroundColor: '#eff6ff' }]}>
                <IconButton icon="chart-line" iconColor="#3b82f6" size={24} style={{ margin: 0 }} />
              </View>
              <Text style={{ fontWeight: '700', fontSize: 13, color: '#111827', marginTop: 8 }}>Desempenho</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('ImprovedSimulator')}>
          <Card style={styles.quickCard}>
            <Card.Content style={{ alignItems: 'center', paddingVertical: 20 }}>
              <View style={[styles.quickIcon, { backgroundColor: '#f0fdf4' }]}>
                <IconButton icon="brain" iconColor="#10b981" size={24} style={{ margin: 0 }} />
              </View>
              <Text style={{ fontWeight: '700', fontSize: 13, color: '#111827', marginTop: 8 }}>Simulador</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('UploadExam')}>
          <Card style={styles.quickCard}>
            <Card.Content style={{ alignItems: 'center', paddingVertical: 20 }}>
              <View style={[styles.quickIcon, { backgroundColor: '#fef3c7' }]}>
                <IconButton icon="upload" iconColor="#eab308" size={24} style={{ margin: 0 }} />
              </View>
              <Text style={{ fontWeight: '700', fontSize: 13, color: '#111827', marginTop: 8 }}>Upload</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </View>

      {isStudent && (
        <Card style={styles.ctaCard}>
          <Card.Content style={styles.ctaContent}>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontWeight: '800', color: '#fff', marginBottom: 8 }}>Alcance a sua vaga na UEM!</Text>
              <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Estudantes que fazem pelo menos 3 simulados por semana têm 85% mais chance de aprovação.
              </Text>
            </View>
            <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.getParent()?.navigate('ExamCenter')}>
              <Text style={{ color: '#4f46e5', fontWeight: '800', fontSize: 16 }}>Treinar Agora</Text>
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
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: '#d1fae5' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 },
  dashCard: { width: 180, backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  dashCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  dashIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dashCardLabel: { color: '#9ca3af', letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  dashCardValue: { fontWeight: '800', color: '#111827' },
  sectionCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  sectionTitle: { fontWeight: '800', color: '#111827', marginBottom: 16 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  lessonAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f3f4f6' },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  ctaCard: { backgroundColor: '#4f46e5', borderRadius: 20, elevation: 4, marginTop: 8 },
  ctaContent: { flexDirection: 'column', gap: 16, padding: 8 },
  ctaButton: { backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, alignItems: 'center', alignSelf: 'flex-start' },
  quickCard: { backgroundColor: '#fff', borderRadius: 16, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  quickIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
