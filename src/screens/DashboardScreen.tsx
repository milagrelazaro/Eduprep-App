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
      {/* Header: Logo + Nome + Avatar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
          <View>
            <Text style={[styles.appTitleText, { color: colors.textPrimary }]}>Simula<Text style={{ color: colors.primaryDark }}>Pass</Text></Text>
            <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>Simulador de Admissão</Text>
          </View>
        </View>
        <View style={[styles.profilePhoto, { backgroundColor: colors.grayDark }]}>
          <Text style={styles.profileInitial}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
      </View>

      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Próximos Passos */}
      <View style={[styles.nextStepsCard, { backgroundColor: colors.white, borderRadius: borderRadius.xxl, ...shadows.small }]}>
        <View style={[styles.nextStepsIcon, { backgroundColor: colors.warningLight }]}>
          <Text style={{ fontSize: 32 }}>⏰</Text>
        </View>
        {isStudent && daysUntilExam !== null ? (
          <>
            <Text style={[styles.nextStepsTitle, { color: colors.textPrimary }]}>
              Faltam {daysUntilExam} {daysUntilExam === 1 ? 'dia' : 'dias'} para o exame!
            </Text>
            <Text style={[styles.nextStepsDesc, { color: colors.textSecondary }]}>
              Mantém o ritmo e pratica com os simulados para chegares preparado.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('EnhancedSimulator')}
            >
              <Text style={styles.ctaButtonText}>Iniciar Simulado</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.nextStepsTitle, { color: colors.textPrimary }]}>
              Bem-vindo, {user?.name?.split(' ')[0] || 'Utilizador'}! 👋
            </Text>
            <Text style={[styles.nextStepsDesc, { color: colors.textSecondary }]}>
              Gere o sistema e acompanhe o desempenho dos estudantes.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('EnhancedSimulator')}
            >
              <Text style={styles.ctaButtonText}>Ver Simulados</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Meus Apps */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Meus Apps</Text>
        <View style={styles.appsGrid}>
          <TouchableOpacity
            style={[styles.appCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EnhancedSimulator')}
          >
            <View style={[styles.appIcon, { backgroundColor: colors.secondary }]}>
              <Text style={styles.appEmoji}>📝</Text>
            </View>
            <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Simulador</Text>
            <Text style={[styles.appDesc, { color: colors.textSecondary }]}>Exames de admissão</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.appCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ExamHistory')}
          >
            <View style={[styles.appIcon, { backgroundColor: colors.infoLight }]}>
              <Text style={styles.appEmoji}>📊</Text>
            </View>
            <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Histórico</Text>
            <Text style={[styles.appDesc, { color: colors.textSecondary }]}>Resultados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.appCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Discounts')}
          >
            <View style={[styles.appIcon, { backgroundColor: '#FFF0ED' }]}>
              <Text style={styles.appEmoji}>🎁</Text>
            </View>
            <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Descontos</Text>
            <Text style={[styles.appDesc, { color: colors.textSecondary }]}>Bónus e ofertas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.appCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Subscription')}
          >
            <View style={[styles.appIcon, { backgroundColor: colors.successLight }]}>
              <Text style={styles.appEmoji}>👑</Text>
            </View>
            <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Premium</Text>
            <Text style={[styles.appDesc, { color: colors.textSecondary }]}>Planos e benefícios</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progresso Académico */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Progresso Académico</Text>
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

      {/* Mais Opções */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Mais Opções</Text>
        <Card style={[styles.menuCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
          <Card.Content style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AcademicSetup')}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>🎓</Text>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Configuração Académica</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>Curso e disciplinas</Text>
                </View>
              </View>
              <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Ranking')}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>�</Text>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Ranking Nacional</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>Compara com outros estudantes</Text>
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
  content: { padding: spacing.xl, paddingBottom: 120 },

  // Header: Logo + Nome + Avatar
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 24 },
  appTitleText: { fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  appSubtitle: { fontSize: 11, fontWeight: '400', marginTop: 2, letterSpacing: 0.5, textTransform: 'uppercase' },
  profilePhoto: { width: 44, height: 44, borderRadius: borderRadius.round, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 16, fontWeight: '700', color: colors.white },

  // Próximos Passos
  nextStepsCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  nextStepsIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  nextStepsTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  nextStepsDesc: { fontSize: 13, fontWeight: '400', textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  ctaButton: {
    width: '100%',
    minHeight: 58,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: { fontSize: 16, fontWeight: '700', color: colors.black },

  // Secções
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.md },

  // Meus Apps (grid 2 colunas)
  appsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  appCard: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appEmoji: { fontSize: 30 },
  appTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  appDesc: { fontSize: 12, fontWeight: '400' },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.md, paddingRight: spacing.lg },

  // Dash Card
  dashCard: { width: 170, padding: spacing.lg },
  dashCardContent: { padding: 0 },
  dashCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  dashIconBox: { width: 36, height: 36, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  dashCardLabel: { fontSize: 11, fontWeight: '400' },
  dashCardValue: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  dashCardSubtitle: { fontSize: 10, fontWeight: '400' },

  // Menu
  menuCard: { elevation: 0, borderWidth: 1, borderColor: colors.borderLight },
  menuContent: { padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  menuIcon: { fontSize: 22 },
  menuItemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  menuItemSubtitle: { fontSize: 12, fontWeight: '400' },
  menuArrow: { fontSize: 24, fontWeight: '300' },
});
