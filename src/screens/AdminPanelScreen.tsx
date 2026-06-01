import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Searchbar, Button, Portal, Modal, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { userService, authService } from '../services/firebaseService';
import { UserRole } from '../types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

type Nav = NativeStackNavigationProp<RootStackParamList>;


function StatCard({ title, value, trend, icon, color }: any) {
  const colorMap: any = {
    blue: { bg: '#eff6ff', text: '#3b82f6' },
    orange: { bg: '#fff7ed', text: '#f97316' },
    green: { bg: '#ecfdf5', text: '#10b981' },
    indigo: { bg: '#eef2ff', text: '#4f46e5' },
  };
  const c = colorMap[color] || colorMap.indigo;

  const iconEmoji: { [key: string]: string } = {
    'account-group': '👥',
    'file-document': '📝',
    'chart-line': '📈',
  };

  return (
    <Card style={styles.statCard}>
      <Card.Content>
        <View style={[styles.statIcon, { backgroundColor: c.bg }]}>
          <Text style={{ fontSize: 22 }}>{iconEmoji[icon] || '📊'}</Text>
        </View>
        <Text style={styles.statLabel}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={styles.statValue}>{value}</Text>
          <View style={[styles.trendBadge, { backgroundColor: trend.startsWith('+') ? '#ecfdf5' : '#fff7ed' }]}>
            <Text style={{ fontSize: 9, fontWeight: '700', color: trend.startsWith('+') ? '#10b981' : '#f97316' }}>{trend}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    pending: { bg: '#fefce8', text: '#a16207', label: 'Pendente', border: '#fef08a' },
    active: { bg: '#ecfdf5', text: '#15803d', label: 'Ativo', border: '#bbf7d0' },
    suspended: { bg: '#fef2f2', text: '#b91c1c', label: 'Suspenso', border: '#fecaca' },
  };
  const s = map[status] || map.pending;
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={{ fontSize: 9, fontWeight: '700', color: s.text, textTransform: 'uppercase' }}>{s.label}</Text>
    </View>
  );
}

export default function AdminPanelScreen() {
  const navigation = useNavigation<Nav>();
  const [users, setUsers] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      // Carregar todos os usuários
      const students = await userService.getUsersByRole(UserRole.STUDENT);
      setUsers(students);
      
      // Carregar resultados de simulados do Firebase
      const resultsQuery = query(
        collection(db, 'examResults'),
        orderBy('completedAt', 'desc')
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      
      const results = await Promise.all(
        resultsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Buscar informações do usuário
          let userName = 'Usuário desconhecido';
          if (data.userId) {
            try {
              const user = await userService.getUserById(data.userId);
              userName = user?.name || user?.email || 'Usuário desconhecido';
            } catch (err) {
              console.error('Erro ao buscar usuário:', err);
            }
          }
          
          return {
            id: doc.id,
            ...data,
            userName,
            date: data.completedAt?.toDate?.()?.toLocaleDateString('pt-PT') || 'Data desconhecida',
          };
        })
      );
      
      setExamResults(results);
      console.log(`${results.length} simulados carregados`);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(filter.toLowerCase()) ||
    u.email?.toLowerCase().includes(filter.toLowerCase()) ||
    u.intendedCourse?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleUserAction = (user: any, action: string) => {
    setShowUserModal(false);
    
    switch (action) {
      case 'block':
        Alert.alert(
          'Bloquear Utilizador',
          `Tem certeza que deseja bloquear ${user.name}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Bloquear',
              style: 'destructive',
              onPress: async () => {
                try {
                  await userService.updateUser(user.id, { status: 'suspended' });
                  Alert.alert('Sucesso', 'Utilizador bloqueado com sucesso');
                  loadData();
                } catch (error) {
                  Alert.alert('Erro', 'Não foi possível bloquear o utilizador');
                }
              },
            },
          ]
        );
        break;
      case 'delete':
        Alert.alert(
          'Apagar Utilizador',
          'Esta funcionalidade será implementada em breve. Por enquanto, você pode bloquear o utilizador.',
          [{ text: 'OK' }]
        );
        break;
      case 'resetPassword':
        setResetEmail(user.email);
        setShowPasswordModal(true);
        break;
      case 'viewProfile':
        setSelectedUser(user);
        setShowProfileModal(true);
        break;
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert('Sucesso', 'Email de redefinição de senha enviado com sucesso');
      setShowPasswordModal(false);
      setResetEmail('');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o email de redefinição');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={{ fontSize: 24, color: '#4f46e5' }}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Painel Administrativo</Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Gestão global de utilizadores e aprovações.</Text>
          </View>
        </View>
        <Button mode="text" onPress={loadData} labelStyle={{ color: '#4f46e5', fontWeight: '700', fontSize: 12 }}>Atualizar</Button>
      </View>

      {/* Info */}
      <Text variant="bodySmall" style={{ color: '#6b7280', marginBottom: 16 }}>
        Visualize informações dos utilizadores e simulados realizados
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 12, paddingRight: 16 }}>
          <StatCard 
            title="Total Utilizadores" 
            value={users.length.toString()} 
            trend={`${users.length} ativos`} 
            icon="account-group" 
            color="blue" 
          />
          <StatCard 
            title="Simulados Feitos" 
            value={examResults.length.toString()} 
            trend={examResults.length > 0 ? 'Registados' : 'Nenhum'} 
            icon="file-document" 
            color="green" 
          />
          <StatCard 
            title="Média Geral" 
            value={
              examResults.length > 0 
                ? `${(examResults.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / examResults.length).toFixed(1)}%`
                : '0%'
            } 
            trend={examResults.length > 0 ? `${examResults.length} exames` : '-'} 
            icon="chart-line" 
            color="indigo" 
          />
        </View>
      </ScrollView>

      {/* Lista de Utilizadores */}
      <Card style={styles.tableCard}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={{ fontWeight: '800', color: '#111827' }}>Utilizadores Registados</Text>
          </View>
          <Searchbar
            placeholder="Pesquisar por nome, email ou curso..."
            value={filter}
            onChangeText={setFilter}
            style={styles.searchBar}
            inputStyle={{ fontSize: 13 }}
          />

          {filtered.length > 0 ? filtered.map((user) => (
            <View key={user.id} style={styles.tutorRow}>
              <Image
                source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=4f46e5&color=fff` }}
                style={styles.tutorAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{user.name || 'Sem nome'}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>{user.email}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  {user.intendedCourse && (
                    <View style={styles.subjectBadge}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: '#4b5563' }}>{user.intendedCourse}</Text>
                    </View>
                  )}
                  {user.competingDisciplines && user.competingDisciplines.length > 0 && (
                    <View style={[styles.subjectBadge, { backgroundColor: '#ecfdf5' }]}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: '#10b981' }}>
                        {user.competingDisciplines.length} disciplinas
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity 
                style={{ backgroundColor: '#eef2ff', borderRadius: 10, padding: 8 }} 
                onPress={() => {
                  setSelectedUser(user);
                  setShowUserModal(true);
                }}
              >
                <Text style={{ fontSize: 18 }}>ℹ️</Text>
              </TouchableOpacity>
            </View>
          )) : (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>Nenhum utilizador encontrado.</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Simulados Realizados */}
      <Card style={styles.tableCard}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={{ fontWeight: '800', color: '#111827' }}>Simulados Realizados</Text>
          </View>
          
          {examResults.length > 0 ? examResults.map((result: any) => {
            const scoreColor = result.score >= 70 ? '#10b981' : result.score >= 50 ? '#f97316' : '#ef4444';
            const scoreBg = result.score >= 70 ? '#ecfdf5' : result.score >= 50 ? '#fff7ed' : '#fef2f2';
            
            return (
              <View key={result.id} style={styles.tutorRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>
                    {result.subject || result.examTitle || 'Simulado'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af' }}>
                    {result.userName} • {result.date}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <View style={[styles.subjectBadge, { backgroundColor: scoreBg, borderColor: scoreColor, borderWidth: 1 }]}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: scoreColor }}>
                        {result.score?.toFixed(1) || 0}%
                      </Text>
                    </View>
                    <View style={styles.subjectBadge}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: '#4b5563' }}>
                        {result.correctAnswers || 0}/{result.totalQuestions || 0} acertos
                      </Text>
                    </View>
                    {result.timeTaken && (
                      <View style={styles.subjectBadge}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: '#6b7280' }}>
                          ⏱️ {Math.floor(result.timeTaken / 60)}min
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          }) : (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>📝</Text>
              <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                Nenhum simulado realizado ainda.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Modal de Ações do Utilizador */}
      <Portal>
        <Modal
          visible={showUserModal}
          onDismiss={() => setShowUserModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ fontWeight: '700', marginBottom: 16, color: '#111827' }}>
                Ações do Utilizador
              </Text>
              {selectedUser && (
                <>
                  <Text variant="bodyMedium" style={{ marginBottom: 20, color: '#6b7280' }}>
                    {selectedUser.name} ({selectedUser.email})
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => handleUserAction(selectedUser, 'viewProfile')}
                  >
                    <Text style={{ fontSize: 20, marginRight: 8 }}>👤</Text>
                    <Text style={styles.modalButtonText}>Ver Perfil Completo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => handleUserAction(selectedUser, 'resetPassword')}
                  >
                    <Text style={{ fontSize: 20, marginRight: 8 }}>🔐</Text>
                    <Text style={styles.modalButtonText}>Redefinir Senha</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => handleUserAction(selectedUser, 'block')}
                  >
                    <Text style={{ fontSize: 20, marginRight: 8 }}>⛔</Text>
                    <Text style={styles.modalButtonText}>Bloquear Utilizador</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => handleUserAction(selectedUser, 'delete')}
                  >
                    <Text style={{ fontSize: 20, marginRight: 8 }}>🗑️</Text>
                    <Text style={styles.modalButtonText}>Apagar Utilizador</Text>
                  </TouchableOpacity>

                  <Button
                    mode="outlined"
                    onPress={() => setShowUserModal(false)}
                    style={{ marginTop: 16 }}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        </Modal>

        {/* Modal de Perfil Completo */}
        <Modal
          visible={showProfileModal}
          onDismiss={() => setShowProfileModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ fontWeight: '700', marginBottom: 16, color: '#111827' }}>
                Perfil Completo
              </Text>
              {selectedUser && (
                <>
                  <View style={{ marginBottom: 12 }}>
                    <Text variant="labelMedium" style={{ color: '#6b7280' }}>Nome</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '600', color: '#111827' }}>{selectedUser.name}</Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text variant="labelMedium" style={{ color: '#6b7280' }}>Email</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '600', color: '#111827' }}>{selectedUser.email}</Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text variant="labelMedium" style={{ color: '#6b7280' }}>Função</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '600', color: '#111827' }}>{selectedUser.role}</Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text variant="labelMedium" style={{ color: '#6b7280' }}>Curso</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '600', color: '#111827' }}>{selectedUser.intendedCourse || 'Não definido'}</Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text variant="labelMedium" style={{ color: '#6b7280' }}>Disciplinas</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '600', color: '#111827' }}>{selectedUser.competingDisciplines?.join(', ') || 'Não definido'}</Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text variant="labelMedium" style={{ color: '#6b7280' }}>Status</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '600', color: '#111827' }}>{selectedUser.status || 'active'}</Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text variant="labelMedium" style={{ color: '#6b7280' }}>ID</Text>
                    <Text variant="bodySmall" style={{ color: '#6b7280' }}>{selectedUser.id}</Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => setShowProfileModal(false)}
                    style={{ marginTop: 16 }}
                  >
                    Fechar
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        </Modal>

        {/* Modal de Redefinir Senha */}
        <Modal
          visible={showPasswordModal}
          onDismiss={() => setShowPasswordModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ fontWeight: '700', marginBottom: 16, color: '#111827' }}>
                Redefinir Senha
              </Text>
              <Text variant="bodyMedium" style={{ marginBottom: 16, color: '#6b7280' }}>
                Um email de redefinição de senha será enviado para:
              </Text>
              <TextInput
                mode="outlined"
                label="Email"
                value={resetEmail}
                onChangeText={setResetEmail}
                style={{ marginBottom: 16 }}
                disabled
              />
              <Button
                mode="contained"
                onPress={handleResetPassword}
                style={{ marginBottom: 8 }}
              >
                Enviar Email
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowPasswordModal(false)}
              >
                Cancelar
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backButton: { margin: 0 },
  headerContent: { flex: 1, marginLeft: 8 },
  statCard: { width: 170, backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statLabel: { fontSize: 9, color: '#9ca3af', fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
  trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tableCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  tableHeader: { marginBottom: 12 },
  searchBar: { borderRadius: 12, backgroundColor: '#f9fafb', elevation: 0, marginBottom: 16, height: 44 },
  tutorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  tutorAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f3f4f6' },
  subjectBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
  quickAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  quickActionText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  iconButton: { margin: 0 },
  modalContainer: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 20 },
  modalButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalButtonText: { fontSize: 15, color: '#111827', fontWeight: '600', flex: 1 },
});
