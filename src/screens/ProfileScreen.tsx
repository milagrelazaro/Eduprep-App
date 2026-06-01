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

  // Apenas para estudantes - sem botão Sair aqui
  return [
    { label: 'Configuração Acadêmica', icon: 'school', color: '#10b981', screen: 'AcademicSetup' },
  ];
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null);
  const [examStats, setExamStats] = useState({ total: 0, average: 0 });
  const [loading, setLoading] = useState(true);

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
  }, []);

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Image
            source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4f46e5&color=fff` }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text variant="titleLarge" style={{ fontWeight: '800', color: '#111827', marginBottom: 2 }}>{user?.name}</Text>
            <Text variant="bodySmall" style={{ color: '#6b7280', marginBottom: 8 }}>{user?.email}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={styles.roleBadge}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#4f46e5', letterSpacing: 2 }}>{getRoleLabel(user?.role)}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: '#ecfdf5' }]}>
                <Text style={{ fontSize: 10 }}>✅</Text>
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#10b981', letterSpacing: 1 }}>VERIFICADA</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Stats */}
      {examStats.total > 0 ? (
        <Card style={styles.statsCard}>
          <Card.Content style={{ flexDirection: 'row' }}>
            <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: '#f3f4f6' }]}>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>Simulados Feitos</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>{examStats.total}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>Média</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>{examStats.average.toFixed(1)}%</Text>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.motivationCard}>
          <Card.Content style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🎯</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4, textAlign: 'center' }}>
              Comece sua jornada!
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
              Faça seu primeiro simulado para ver seu progresso aqui.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Contagem Regressiva para o Exame */}
      {daysUntilExam !== null && (
        <Card style={styles.countdownCard}>
          <Card.Content style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.countdownIcon}>
                <Text style={{ fontSize: 28 }}>⏰</Text>
              </View>
              <View>
                <Text variant="labelSmall" style={{ color: '#6b7280', marginBottom: 2 }}>Faltam para o exame</Text>
                <Text variant="headlineMedium" style={{ fontWeight: '800', color: '#111827' }}>
                  {daysUntilExam} {daysUntilExam === 1 ? 'dia' : 'dias'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AcademicSetup' as never)}>
              <Text style={{ color: '#4f46e5', fontWeight: '600', fontSize: 14 }}>Alterar</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}

      {/* Settings Menu */}
      <Card style={styles.menuCard}>
        <Card.Content style={{ padding: 0 }}>
          {menuItems.map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.menuItem, i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#f9fafb' }]}
              onPress={() => navigation.navigate(item.screen as never)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={[styles.menuIcon, { backgroundColor: '#f9fafb' }]}>
                  <Text style={{ fontSize: 20 }}>{item.icon === 'school' ? '🎓' : '⚙️'}</Text>
                </View>
                <Text style={{ fontWeight: '700', color: '#1f2937', fontSize: 15 }}>{item.label}</Text>
              </View>
              <Text style={{ fontSize: 20, color: '#d1d5db' }}>›</Text>
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      {/* Botão Sair separado com destaque */}
      <TouchableOpacity 
        onPress={() => {
          console.log('Botão Sair clicado');
          handleLogout();
        }} 
        style={styles.logoutButton}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 24 }}>🚪</Text>
          <Text style={{ fontWeight: '700', color: '#fff', fontSize: 16 }}>Sair da Conta</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  headerCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#f3f4f6' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  roleSwitchCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 16,
  },
  roleSwitchIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 24,
    padding: 24,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f3f4f6',
    marginBottom: 12,
  },
  roleOptionActive: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  roleOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletCard: { backgroundColor: '#4f46e5', borderRadius: 20, elevation: 4, marginBottom: 16 },
  walletBtnOutline: { flex: 1, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center' },
  walletBtnSolid: { flex: 1, paddingVertical: 12, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center' },
  statsCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  motivationCard: { backgroundColor: '#eef2ff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#dbeafe', marginBottom: 16 },
  countdownCard: { backgroundColor: '#fef3c7', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#fde68a', marginBottom: 16 },
  countdownIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  menuCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoutButton: { backgroundColor: '#ef4444', borderRadius: 16, padding: 16, marginTop: 8, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
});
