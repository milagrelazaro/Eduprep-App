import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, IconButton, Button } from 'react-native-paper';
import { useNavigation, CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import LogoutModal from '../components/LogoutModal';
import { MainTabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { examResultService } from '../services/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';

type StackNav = NativeStackNavigationProp<RootStackParamList>;
type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  StackNav
>;

function DashCard({ title, value, subtitle, icon, color }: any) {
  const colorMap: any = {
    blue: { bg: colors.secondary, text: colors.info },
    orange: { bg: '#FFF0ED', text: colors.primary },
    green: { bg: colors.successLight, text: colors.success },
    yellow: { bg: colors.warningLight, text: colors.warning },
  };
  const c = colorMap[color] || colorMap.blue;

  const iconEmoji: { [key: string]: string } = {
    'trophy': '🏆',
    'chart-line': '📈',
    'trending-up': '📊',
    'check-circle': '✅',
    'shield-account': '🛡️',
  };

  return (
    <Card style={[styles.dashCard, { backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.borderLight }]}>
      <Card.Content style={styles.dashCardContent}>
        <View style={styles.dashCardHeader}>
          <View style={[styles.dashIconBox, { backgroundColor: c.bg }]}>
            <Text style={{ fontSize: 18 }}>{iconEmoji[icon] || '📋'}</Text>
          </View>
          <Text style={[styles.dashCardLabel, { color: colors.textSecondary }]}>{title}</Text>
        </View>
        <Text style={[styles.dashCardValue, { color: colors.textPrimary }]}>{value}</Text>
        <Text style={[styles.dashCardSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
      </Card.Content>
    </Card>
  );
}

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<DashboardNavigationProp>();
  const isStudent = user?.role === UserRole.STUDENT;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logout realizado com sucesso');
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const [examResults, setExamResults] = useState<any[]>([]);
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null);

  const calculateDaysUntilExam = async () => {
    try {
      const examDateStr = await AsyncStorage.getItem('user_exam_date');
      if (examDateStr) {
        const monthMap: { [key: string]: number } = {
          'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3, 'Maio': 4, 'Junho': 5,
          'Julho': 6, 'Agosto': 7, 'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
        };
        const [month, year] = examDateStr.split(' ');
        const examDate = new Date(parseInt(year), monthMap[month] || 0, 1);
        const today = new Date();
        const diffTime = examDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysUntilExam(diffDays > 0 ? diffDays : 0);
      }
    } catch (error) {
      console.error('Erro ao calcular dias até o exame:', error);
    }
  };

  useEffect(() => {
    calculateDaysUntilExam();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExamResults();
    }, [user?.id])
  );

  const loadExamResults = async () => {
    try {
      console.log('=== DASHBOARD: CARREGANDO RESULTADOS ===');
      console.log('User ID:', user?.id);
      console.log('User Email:', user?.email);
      const results = await examResultService.getResultsByStudent(user?.id ?? '');
      console.log('Total de resultados encontrados:', results.length);
      if (results.length > 0) {
        console.log('IDs dos resultados:', results.map(r => r.id));
        console.log('Scores:', results.map(r => r.score));
      }
      setExamResults(results);
      console.log('=== FIM DO CARREGAMENTO ===');
    } catch (error) {
      console.error('Error loading exam results:', error);
    }
  };

  const averageScore = examResults.length > 0 
    ? (examResults.reduce((sum: number, r: any) => sum + r.score, 0) / examResults.length).toFixed(1)
    : '0';

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* App Title */}
      <View style={styles.appTitle}>
        <Text style={[styles.appTitleText, { color: colors.textPrimary }]}>Simula<Text style={{ color: colors.primary }}>Pass</Text></Text>
        <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>Simulador de Admissão</Text>
      </View>

      {/* Header estilo Yango */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.profilePhoto, { backgroundColor: colors.secondary }]}>
            <Text style={styles.profileInitial}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'Utilizador'}</Text>
            <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
              {user?.email || 'email@exemplo.com'}
            </Text>
          </View>
        </View>
      </View>

      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Contagem Regressiva para Estudantes */}
      {isStudent && daysUntilExam !== null && (
        <Card style={[styles.countdownCard, { backgroundColor: colors.white, borderRadius: borderRadius.xxl, ...shadows.small }]}>
          <Card.Content style={styles.countdownContent}>
            <View style={styles.countdownLeft}>
              <View style={[styles.countdownIcon, { backgroundColor: colors.warningLight }]}>
                <Text style={{ fontSize: 28 }}>⏰</Text>
              </View>
              <View>
                <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>Faltam para o exame</Text>
                <Text style={[styles.countdownValue, { color: colors.textPrimary }]}>
                  {daysUntilExam} {daysUntilExam === 1 ? 'dia' : 'dias'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AcademicSetup')}>
              <Text style={[styles.countdownAction, { color: colors.primary }]}>Configurar</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}

      {/* Ações Rápidas */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}
          onPress={() => navigation.navigate('EnhancedSimulator')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary }]}>
            <Text style={styles.quickActionEmoji}>📝</Text>
          </View>
          <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>Simulador</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}
          onPress={() => navigation.navigate('Discounts')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FFF0ED' }]}>
            <Text style={styles.quickActionEmoji}>🎁</Text>
          </View>
          <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>Descontos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}
          onPress={() => navigation.navigate('Subscription')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.successLight }]}>
            <Text style={styles.quickActionEmoji}>👑</Text>
          </View>
          <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>Premium</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}
          onPress={() => navigation.navigate('ExamHistory')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.infoLight }]}>
            <Text style={styles.quickActionEmoji}>�</Text>
          </View>
          <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Estatísticas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statsRow}>
            {isStudent ? (
              <>
                <DashCard title="Simulados Feitos" value={examResults.length.toString()} subtitle="Total realizado" icon="trophy" color="green" />
                <DashCard title="Média Geral" value={`${averageScore}%`} subtitle="Pontuação média" icon="chart-line" color="blue" />
                <DashCard title="Último Score" value={examResults.length > 0 ? `${examResults[0].score.toFixed(1)}%` : '0%'} subtitle="Simulado mais recente" icon="trending-up" color="orange" />
              </>
            ) : (
              <>
                <DashCard title="Status" value="Ativo" subtitle="Sistema operacional" icon="check-circle" color="green" />
                <DashCard title="Painel Admin" value="Ativo" subtitle="Gestão completa" icon="shield-account" color="blue" />
              </>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Menu de Funcionalidades */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Funcionalidades</Text>
        <Card style={[styles.menuCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
          <Card.Content style={styles.menuContent}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('ExamHistory')}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>📊</Text>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Histórico de Exames</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>Ver todos os simulados</Text>
                </View>
              </View>
              <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('AcademicSetup')}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>🎓</Text>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Configuração Acadêmica</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>Curso e disciplinas</Text>
                </View>
              </View>
              <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('Discounts')}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>🎁</Text>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Descontos e Bônus</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>Códigos de referral</Text>
                </View>
              </View>
              <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('Subscription')}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>👑</Text>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Subscrição Premium</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>Planos e benefícios</Text>
                </View>
              </View>
              <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => setShowLogoutModal(true)}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>🚪</Text>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.error }]}>Terminar Sessão</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>Sair da conta</Text>
                </View>
              </View>
              <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32 },
  
  // App Title
  appTitle: { marginBottom: spacing.lg },
  appTitleText: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  appSubtitle: { fontSize: 11, fontWeight: '400', marginTop: 2, letterSpacing: 0.5, textTransform: 'uppercase' },
  
  // Header estilo Yango
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profilePhoto: { width: 40, height: 40, borderRadius: borderRadius.round, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 16, fontWeight: '700', color: colors.info },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  userPhone: { fontSize: 12, fontWeight: '400' },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerAction: { width: 44, height: 44, borderRadius: borderRadius.md, backgroundColor: colors.grayLight, alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44 },
  headerActionIcon: { fontSize: 20 },
  
  // Countdown Card
  countdownCard: { marginBottom: spacing.lg },
  countdownContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countdownLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  countdownIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  countdownLabel: { fontSize: 11, fontWeight: '400', marginBottom: 2 },
  countdownValue: { fontSize: 18, fontWeight: '700' },
  countdownAction: { fontSize: 14, fontWeight: '600' },
  
  // Quick Actions
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
  quickAction: { flex: 1, alignItems: 'center', padding: spacing.md, marginHorizontal: 4 },
  quickActionIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  quickActionEmoji: { fontSize: 20 },
  quickActionLabel: { fontSize: 11, fontWeight: '600' },
  
  // Stats Section
  statsSection: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md, paddingRight: spacing.lg },
  
  // Dash Card
  dashCard: { width: 160, padding: spacing.md },
  dashCardContent: { padding: 0 },
  dashCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  dashIconBox: { width: 32, height: 32, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  dashCardLabel: { fontSize: 11, fontWeight: '400' },
  dashCardValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  dashCardSubtitle: { fontSize: 10, fontWeight: '400' },
  
  // Menu Section
  menuSection: { marginBottom: spacing.xl },
  menuCard: { elevation: 0, borderWidth: 1, borderColor: colors.borderLight },
  menuContent: { padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  menuIcon: { fontSize: 20 },
  menuItemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  menuItemSubtitle: { fontSize: 12, fontWeight: '400' },
  menuArrow: { fontSize: 24, fontWeight: '300' },
});
