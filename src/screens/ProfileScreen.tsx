import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useNavigation, CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { MainTabParamList, RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';
import * as ImagePicker from 'expo-image-picker';

type StackNav = NativeStackNavigationProp<RootStackParamList>;
type ProfileNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  StackNav
>;

const getRoleLabel = (role: string | undefined) => {
  if (!role) return '';
  const roleMap: { [key: string]: string } = {
    student: 'Estudante',
    admin: 'Administrador',
  };
  return roleMap[role] || role.toUpperCase();
};

const getMenuItems = (userRole: UserRole | undefined) => {
  // Admin não tem menu de perfil - edita direto no Firebase
  if (userRole === UserRole.ADMIN) {
    return [];
  }

  // Apenas para estudantes
  return [
    { label: 'Configuração Acadêmica', icon: 'school', color: '#10b981', screen: 'AcademicSetup' },
    { label: 'Universidades Favoritas', icon: 'star', color: '#f59e0b', screen: 'FavoriteUniversities' },
    { label: 'Ranking Nacional', icon: 'trophy', color: '#3b82f6', screen: 'Ranking' },
    { label: 'Descontos e Bônus', icon: 'gift', color: '#f59e0b', screen: 'Discounts' },
    { label: 'Subscrição Premium', icon: 'crown', color: '#fbbf24', screen: 'Subscription' },
    { label: 'Segurança', icon: 'shield', color: '#7c3aed', screen: 'Security' },
    { label: 'Melhorar Conteúdo', icon: 'flag', color: '#ef4444', screen: 'ReportIssue' },
    { label: 'Suporte e Ajuda', icon: 'help-circle', color: '#8b5cf6', screen: 'Support' },
  ];
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout, updateUser } = useAuthStore();
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null);
  const [examStats, setExamStats] = useState({ total: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(0);

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

  const loadExamStats = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const resultsQuery = query(
        collection(db, 'examResults'),
        where('userId', '==', user.id)
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      
      const results = resultsSnapshot.docs.map(doc => doc.data());
      const total = results.length;
      const average = total > 0 
        ? results.reduce((sum, r) => sum + (r.score || 0), 0) / total
        : 0;
      
      setExamStats({ total, average });
      console.log(`Estatísticas carregadas: ${total} simulados, média ${average.toFixed(1)}%`);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateDaysUntilExam();
    loadExamStats();
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = () => {
    let completed = 0;
    if (user?.name) completed++;
    if (user?.email) completed++;
    if (user?.intendedCourse) completed++;
    if (user?.competingDisciplines && user.competingDisciplines.length > 0) completed++;
    if (profilePhoto) completed++;
    setProfileComplete(completed);
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos de acesso à galeria para alterar a foto de perfil');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePhoto(result.assets[0].uri);
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
        checkProfileCompletion();
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  // Recarregar estatísticas quando a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      loadExamStats();
    }, [user?.id])
  );

  const handleLogout = async () => {
    console.log('handleLogout chamado');
    // Usar window.confirm para web, Alert.alert para nativo
    const confirmed = typeof window !== 'undefined' 
      ? window.confirm('Tem certeza que deseja sair?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              { 
                text: 'Sair', 
                style: 'destructive', 
                onPress: () => resolve(true)
              },
            ]
          );
        });

    if (confirmed) {
      console.log('Botão Sair pressionado');
      try {
        await logout();
        console.log('Logout realizado com sucesso');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    }
  };

  const menuItems = getMenuItems(user?.role);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Banner Completar Perfil */}
      {profileComplete < 5 && (
        <TouchableOpacity 
          style={[styles.completeBanner, { backgroundColor: colors.warningLight }]}
          onPress={() => navigation.navigate('AcademicSetup' as never)}
        >
          <View style={styles.completeBannerLeft}>
            <Text style={styles.completeBannerEmoji}>⚠️</Text>
            <View>
              <Text style={[styles.completeBannerTitle, { color: colors.warning }]}>COMPLETAR PERFIL</Text>
              <Text style={[styles.completeBannerText, { color: colors.textSecondary }]}>{profileComplete} de 5 concluídos</Text>
            </View>
          </View>
          <Text style={[styles.completeBannerArrow, { color: colors.warning }]}>›</Text>
        </TouchableOpacity>
      )}

      {/* Header estilo Yango */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handlePickImage}>{profilePhoto ? (<Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />) : (<View style={[styles.profilePhoto, { backgroundColor: colors.secondary }]}><Text style={styles.profileInitial}>{user?.name?.charAt(0) || 'U'}</Text></View>)}<View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}><Text style={styles.cameraEmoji}>📷</Text></View></TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'Utilizador'}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'email@exemplo.com'}</Text>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.badgeText, { color: colors.info }]}>{getRoleLabel(user?.role)}</Text>
              </View>
              {examStats.total > 0 && (
                <View style={[styles.badge, { backgroundColor: examStats.average >= 70 ? colors.successLight : examStats.average >= 50 ? colors.warningLight : colors.errorLight }]}>
                  <Text style={[styles.badgeText, { color: examStats.average >= 70 ? colors.success : examStats.average >= 50 ? colors.warning : colors.error }]}>
                    ⭐ {examStats.average.toFixed(0)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      {examStats.total > 0 ? (
        <Card style={[styles.statsCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
          <Card.Content style={styles.statsContent}>
            <View style={styles.statsRow}>
              <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: colors.borderLight }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Simulados Feitos</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{examStats.total}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Média</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{examStats.average.toFixed(1)}%</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ExamHistory' as never)}
              style={[styles.historyButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.historyButtonText}>📋 Ver Histórico Completo</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      ) : (
        <Card style={[styles.motivationCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
          <Card.Content style={styles.motivationContent}>
            <Text style={styles.motivationEmoji}>🎯</Text>
            <Text style={[styles.motivationTitle, { color: colors.textPrimary }]}>
              Comece sua jornada!
            </Text>
            <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
              Faça seu primeiro simulado para ver seu progresso aqui.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Menu */}
      {menuItems.length > 0 && (
        <Card style={[styles.menuCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
          <Card.Content style={styles.menuContent}>
            {menuItems.map((item, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
                onPress={() => navigation.navigate(item.screen as never)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: colors.grayLight }]}>
                    <Text style={styles.menuIconEmoji}>{item.icon === 'school' ? '🎓' : item.icon === 'star' ? '⭐' : item.icon === 'trophy' ? '🏆' : item.icon === 'gift' ? '🎁' : item.icon === 'crown' ? '👑' : item.icon === 'shield' ? '🛡️' : item.icon === 'flag' ? '🚩' : item.icon === 'help-circle' ? '❓' : '⚙️'}</Text>
                  </View>
                  <View>
                    <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>{item.label}</Text>
                  </View>
                </View>
                <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Logout */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={{ marginTop: spacing.md, marginBottom: 32, borderColor: colors.error }}
        labelStyle={{ color: colors.error, fontWeight: '600' }}
      >
        🚪 Terminar Sessão
      </Button>

      {/* Contagem Regressiva para o Exame */}
      {daysUntilExam !== null && (
        <Card style={[styles.countdownCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32 },
  
  // Banner Completar Perfil
  completeBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: spacing.md, 
    borderRadius: borderRadius.md, 
    marginBottom: spacing.lg 
  },
  completeBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  completeBannerEmoji: { fontSize: 24 },
  completeBannerTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  completeBannerText: { fontSize: 11, fontWeight: '400' },
  completeBannerArrow: { fontSize: 24, fontWeight: '300' },
  
  // Header estilo Yango
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profilePhoto: { width: 60, height: 60, borderRadius: borderRadius.round, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 24, fontWeight: '700', color: colors.info },
  cameraIcon: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white
  },
  cameraEmoji: { fontSize: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 13, fontWeight: '400', marginBottom: 8 },
  badges: { flexDirection: 'row', gap: spacing.sm },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.md },
  badgeText: { fontSize: 10, fontWeight: '600' },
  logoutButton: { width: 48, height: 48, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', minWidth: 48, minHeight: 48 },
  logoutIcon: { fontSize: 22 },
  
  // Stats Card
  statsCard: { marginBottom: spacing.lg },
  statsContent: { padding: spacing.lg },
  statsRow: { flexDirection: 'row', marginBottom: spacing.lg },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, fontWeight: '400', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '700' },
  historyButton: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center' },
  historyButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  
  // Motivation Card
  motivationCard: { marginBottom: spacing.lg },
  motivationContent: { alignItems: 'center', padding: spacing.xl },
  motivationEmoji: { fontSize: 40, marginBottom: spacing.md },
  motivationTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' },
  motivationText: { fontSize: 14, textAlign: 'center' },
  
  // Menu Card
  menuCard: { marginBottom: spacing.lg, elevation: 0, borderWidth: 1, borderColor: colors.borderLight },
  menuContent: { padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  menuIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  menuIconEmoji: { fontSize: 20 },
  menuItemTitle: { fontSize: 16, fontWeight: '600' },
  menuArrow: { fontSize: 24, fontWeight: '300' },
  
  // Countdown Card
  countdownCard: { marginBottom: spacing.lg },
  countdownContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countdownLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  countdownIcon: { width: 48, height: 48, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  countdownLabel: { fontSize: 12, fontWeight: '400', marginBottom: 2 },
  countdownValue: { fontSize: 20, fontWeight: '700' },
  countdownAction: { fontSize: 14, fontWeight: '600' },
});
