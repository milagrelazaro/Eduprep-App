import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, IconButton, Portal, Modal, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

const menuItems = [
  { label: 'Dados Pessoais', icon: 'account', color: '#3b82f6', screen: 'PersonalData' },
  { label: 'Configuração Acadêmica', icon: 'school', color: '#10b981', screen: 'AcademicSetup' },
  { label: 'Desempenho', icon: 'chart-line', color: '#4f46e5', screen: 'ImprovedPerformance' },
  { label: 'Firebase', icon: 'cloud-sync', color: '#ef4444', screen: 'FirebaseToggle' },
  { label: 'Notificações', icon: 'bell', color: '#f97316', screen: 'Notifications' },
  { label: 'Criar Exame', icon: 'file-plus', color: '#8b5cf6', screen: 'CreateExam' },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout, switchRole } = useAuthStore();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSwitchRole = async (newRole: UserRole) => {
    if (user?.role === UserRole.ADMIN) {
      Alert.alert('Atenção', 'Administradores não podem trocar de papel.');
      return;
    }
    
    await switchRole(newRole);
    setShowRoleModal(false);
    Alert.alert('Sucesso', `Mudou para o modo ${newRole === UserRole.STUDENT ? 'Estudante' : 'Tutor'}!`);
  };

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
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#4f46e5', letterSpacing: 2 }}>{user?.role?.toUpperCase()}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: '#ecfdf5' }]}>
                <IconButton icon="shield-check" iconColor="#10b981" size={10} style={{ margin: 0 }} />
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#10b981', letterSpacing: 1 }}>VERIFICADA</Text>
              </View>
            </View>
          </View>
          <IconButton
            icon="logout"
            iconColor="#ef4444"
            size={22}
            style={{ backgroundColor: '#fef2f2', borderRadius: 16 }}
            onPress={logout}
          />
        </Card.Content>
      </Card>

      {/* Role Switch Card */}
      {user?.role !== UserRole.ADMIN && (
        <Card style={styles.roleSwitchCard}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.roleSwitchIcon}>
                <IconButton icon="swap-horizontal" iconColor="#4f46e5" size={24} style={{ margin: 0 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827' }}>Trocar de Papel</Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>Mudar entre Estudante e Tutor</Text>
              </View>
              <IconButton
                icon="chevron-right"
                iconColor="#9ca3af"
                size={20}
                onPress={() => setShowRoleModal(true)}
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Wallet */}
      <Card style={styles.walletCard}>
        <Card.Content>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 }}>CARTEIRA VIRTUAL</Text>
          <Text style={{ color: '#fff', fontSize: 36, fontWeight: '800', marginBottom: 20 }}>
            4.200 <Text style={{ fontSize: 16, opacity: 0.6 }}>MT</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.walletBtnOutline}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Recarregar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.walletBtnSolid}>
              <Text style={{ color: '#4f46e5', fontWeight: '700', fontSize: 13 }}>Histórico</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Stats */}
      <Card style={styles.statsCard}>
        <Card.Content style={{ flexDirection: 'row' }}>
          <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: '#f3f4f6' }]}>
            <Text style={{ color: '#9ca3af', fontSize: 12 }}>Simulados</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>12</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={{ color: '#9ca3af', fontSize: 12 }}>Aulas dadas</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>0</Text>
          </View>
        </Card.Content>
      </Card>

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
                  <IconButton icon={item.icon} iconColor={item.color} size={20} style={{ margin: 0 }} />
                </View>
                <Text style={{ fontWeight: '700', color: '#1f2937', fontSize: 15 }}>{item.label}</Text>
              </View>
              <IconButton icon="chevron-right" iconColor="#d1d5db" size={20} style={{ margin: 0 }} />
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      {/* Role Switch Modal */}
      <Portal>
        <Modal visible={showRoleModal} onDismiss={() => setShowRoleModal(false)} contentContainerStyle={styles.modal}>
          <Text variant="titleLarge" style={{ fontWeight: '800', color: '#111827', marginBottom: 8 }}>Trocar de Papel</Text>
          <Text style={{ color: '#6b7280', marginBottom: 24 }}>Escolha o papel que deseja usar na plataforma.</Text>
          
          <TouchableOpacity
            onPress={() => handleSwitchRole(UserRole.STUDENT)}
            style={[styles.roleOption, user?.role === UserRole.STUDENT && styles.roleOptionActive]}
          >
            <View style={[styles.roleOptionIcon, { backgroundColor: '#eff6ff' }]}>
              <IconButton icon="school" iconColor="#3b82f6" size={24} style={{ margin: 0 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827' }}>Estudante</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Acesso a tutores, simulados e exames</Text>
            </View>
            {user?.role === UserRole.STUDENT && (
              <IconButton icon="check-circle" iconColor="#10b981" size={24} style={{ margin: 0 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSwitchRole(UserRole.TUTOR)}
            style={[styles.roleOption, user?.role === UserRole.TUTOR && styles.roleOptionActive]}
          >
            <View style={[styles.roleOptionIcon, { backgroundColor: '#f0fdf4' }]}>
              <IconButton icon="account-tie" iconColor="#10b981" size={24} style={{ margin: 0 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827' }}>Tutor</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Dar aulas e gerir disponibilidade</Text>
            </View>
            {user?.role === UserRole.TUTOR && (
              <IconButton icon="check-circle" iconColor="#10b981" size={24} style={{ margin: 0 }} />
            )}
          </TouchableOpacity>

          <Button
            mode="outlined"
            onPress={() => setShowRoleModal(false)}
            style={{ borderColor: '#e5e7eb', borderRadius: 16, marginTop: 16 }}
            labelStyle={{ fontWeight: '700', color: '#374151' }}
          >
            Cancelar
          </Button>
        </Modal>
      </Portal>
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
  menuCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
