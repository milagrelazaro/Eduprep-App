import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Searchbar, Button, Portal, Modal, TextInput, Switch, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { userService, authService } from '../services/firebaseService';
import { referralService } from '../services/referralService';
import { UserRole, Promoter, ReferralLead } from '../types';
import { useAuthStore } from '../store/authStore';
import LogoutModal from '../components/LogoutModal';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';
import * as DocumentPicker from 'expo-document-picker';

type Nav = NativeStackNavigationProp<RootStackParamList>;


function StatCard({ title, value, trend, icon, color }: any) {
  const colorMap: any = {
    blue: { bg: colors.secondary, text: colors.info },
    orange: { bg: '#FFF0ED', text: colors.primary },
    green: { bg: colors.successLight, text: colors.success },
    indigo: { bg: colors.secondary, text: colors.info },
  };
  const c = colorMap[color] || colorMap.blue;

  const iconEmoji: { [key: string]: string } = {
    'account-group': '👥',
    'file-document': '📝',
    'chart-line': '📈',
  };

  return (
    <Card style={[styles.statCard, { backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.borderLight }]}>
      <Card.Content style={styles.statCardContent}>
        <View style={[styles.statIcon, { backgroundColor: c.bg }]}>
          <Text style={{ fontSize: 18 }}>{iconEmoji[icon] || '📊'}</Text>
        </View>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{title}</Text>
        <View style={styles.statValueRow}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
          <View style={[styles.trendBadge, { backgroundColor: trend.startsWith('+') ? colors.successLight : colors.warningLight }]}>
            <Text style={{ fontSize: 9, fontWeight: '700', color: trend.startsWith('+') ? colors.success : colors.warning }}>{trend}</Text>
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
  const { logout } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [selectedPromoter, setSelectedPromoter] = useState<Promoter | null>(null);
  const [promoterLeads, setPromoterLeads] = useState<ReferralLead[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPromoterModal, setShowPromoterModal] = useState(false);
  const [showCreatePromoterModal, setShowCreatePromoterModal] = useState(false);
  const [showPromoterLeadsModal, setShowPromoterLeadsModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPromoterName, setNewPromoterName] = useState('');
  const [newPromoterEmail, setNewPromoterEmail] = useState('');
  const [newPromoterCommission, setNewPromoterCommission] = useState('10');
  const [newPromoterPassword, setNewPromoterPassword] = useState('');
  const [sendEmailToPromoter, setSendEmailToPromoter] = useState(true);
  
  // Upload de exames
  const [showExamUploadModal, setShowExamUploadModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<any>(null);
  const [examInstitution, setExamInstitution] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examYear, setExamYear] = useState('');
  const [examDuration, setExamDuration] = useState('90');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logout Admin realizado com sucesso');
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Carregar todos os usuários
      const students = await userService.getUsersByRole(UserRole.STUDENT);
      setUsers(students);

      // Carregar promotores
      const promotersData = await referralService.getAllPromoters();
      setPromoters(promotersData);

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

  const handleCreatePromoter = async () => {
    if (!newPromoterName || !newPromoterEmail) {
      Alert.alert('Erro', 'Por favor, preenche todos os campos obrigatórios');
      return;
    }

    try {
      // Gerar senha: usar a fornecida ou gerar automática
      const password = newPromoterPassword || Math.random().toString(36).slice(-8) + 'Aa1!';
      
      // Create the user
      const userData = await authService.signUp(
        newPromoterEmail.toLowerCase(),
        password,
        newPromoterName,
        UserRole.PROMOTER
      );

      // Create the promoter profile
      await referralService.createPromoter({
        userId: userData.id,
        name: newPromoterName,
        email: newPromoterEmail.toLowerCase(),
        commissionRate: parseFloat(newPromoterCommission),
        status: 'active',
      });

      // Enviar email com credenciais se solicitado
      if (sendEmailToPromoter) {
        try {
          await sendPasswordResetEmail(auth, newPromoterEmail.toLowerCase());
          Alert.alert(
            'Sucesso!',
            `Promotor criado com sucesso!\n\nEmail: ${newPromoterEmail}\nSenha: ${password}\n\n✅ Email de redefinição enviado para o promotor.`,
            [{ text: 'OK' }]
          );
        } catch (emailError) {
          Alert.alert(
            'Promotor Criado',
            `Promotor criado com sucesso!\n\nEmail: ${newPromoterEmail}\nSenha: ${password}\n\n⚠️ Não foi possível enviar email. Envie as credenciais manualmente.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Promotor Criado',
          `Email: ${newPromoterEmail}\nSenha: ${password}\n\n⚠️ IMPORTANTE: Copie estas credenciais e envie ao promotor!`,
          [{ text: 'Copiar', onPress: () => {} }, { text: 'OK' }]
        );
      }

      setShowCreatePromoterModal(false);
      setNewPromoterName('');
      setNewPromoterEmail('');
      setNewPromoterCommission('10');
      setNewPromoterPassword('');
      setSendEmailToPromoter(true);
      loadData();
    } catch (error: any) {
      console.error('Erro ao criar promotor:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Erro', 'Este email já está cadastrado no sistema. Use outro email ou verifique se o usuário já existe.');
      } else {
        Alert.alert('Erro', error.message || 'Não foi possível criar o promotor');
      }
    }
  };

  const handleViewPromoterLeads = async (promoter: Promoter) => {
    try {
      const leads = await referralService.getPromoterLeads(promoter.id);
      setSelectedPromoter(promoter);
      setPromoterLeads(leads);
      setShowPromoterLeadsModal(true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os leads');
    }
  };

  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets[0]) {
        console.log('PDF selecionado:', result.assets[0]);
        setSelectedPDF(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar o PDF');
      console.error('Erro ao selecionar PDF:', error);
    }
  };

  const handleUploadExam = async () => {
    if (!selectedPDF) {
      Alert.alert('Erro', 'Por favor, selecione um PDF');
      return;
    }

    if (!examInstitution || !examSubject || !examYear) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Criar FormData para enviar ao backend
      const formData = new FormData();
      
      console.log('selectedPDF:', selectedPDF);
      
      // No web, usar o arquivo diretamente; no mobile, usar o objeto com uri
      if (selectedPDF.file) {
        // Web: usar o arquivo File diretamente
        console.log('Usando arquivo File (web)');
        formData.append('file', selectedPDF.file);
      } else if (selectedPDF.uri) {
        // Mobile: usar o objeto com uri
        console.log('Usando objeto com uri (mobile)');
        formData.append('file', {
          uri: selectedPDF.uri,
          type: 'application/pdf',
          name: selectedPDF.name,
        } as any);
      } else {
        throw new Error('Formato de arquivo não suportado');
      }
      
      formData.append('institution', examInstitution);
      formData.append('subject', examSubject);
      formData.append('year', examYear);
      formData.append('duration', examDuration);

      setUploadProgress(30);
      setUploadStatus('processing');

      // Enviar para backend real
      const response = await fetch('http://localhost:3000/api/upload-exam', {
        method: 'POST',
        body: formData,
        // Não definir Content-Type manualmente - o fetch define automaticamente com boundary
      });

      setUploadProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no servidor');
      }

      const result = await response.json();
      setUploadProgress(100);

      setUploadStatus('completed');
      Alert.alert(
        'Sucesso!',
        `${result.questionsCount} questões extraídas e importadas para o Firebase!`,
        [{ text: 'OK', onPress: () => {
          setShowExamUploadModal(false);
          setSelectedPDF(null);
          setExamInstitution('');
          setExamSubject('');
          setExamYear('');
          setExamDuration('90');
          setUploadProgress(0);
          setUploadStatus('idle');
        }}]
      );
    } catch (error) {
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Erro desconhecido');
      Alert.alert('Erro', 'Não foi possível processar o exame. Verifique se o backend está rodando.');
    }
  };

  const handlePromoterAction = (promoter: Promoter, action: string) => {
    setShowPromoterModal(false);

    switch (action) {
      case 'suspend':
        Alert.alert(
          'Suspender Promotor',
          `Tem certeza que deseja suspender ${promoter.name}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Suspender',
              style: 'destructive',
              onPress: async () => {
                try {
                  await referralService.updatePromoter(promoter.id, { status: 'suspended' });
                  Alert.alert('Sucesso', 'Promotor suspenso com sucesso');
                  loadData();
                } catch (error) {
                  Alert.alert('Erro', 'Não foi possível suspender o promotor');
                }
              },
            },
          ]
        );
        break;
      case 'activate':
        Alert.alert(
          'Ativar Promotor',
          `Tem certeza que deseja ativar ${promoter.name}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Ativar',
              onPress: async () => {
                try {
                  await referralService.updatePromoter(promoter.id, { status: 'active' });
                  Alert.alert('Sucesso', 'Promotor ativado com sucesso');
                  loadData();
                } catch (error) {
                  Alert.alert('Erro', 'Não foi possível ativar o promotor');
                }
              },
            },
          ]
        );
        break;
      case 'viewLeads':
        handleViewPromoterLeads(promoter);
        break;
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header estilo Yango */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.profilePhoto, { backgroundColor: colors.secondary }]}>
            <Text style={styles.profileInitial}>A</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>Painel Admin</Text>
            <Text style={[styles.userRole, { color: colors.textSecondary }]}>Gestão global</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={loadData}
          style={styles.headerAction}
        >
          <Text style={styles.headerActionIcon}>�</Text>
        </TouchableOpacity>
      </View>

      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

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

      {/* Gestão de Exames */}
      <Card style={styles.tableCard}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={{ fontWeight: '800', color: '#111827' }}>Gestão de Exames</Text>
            <Button
              mode="contained"
              onPress={() => (navigation as any).navigate('ExamManagement')}
              style={{ backgroundColor: '#7c3aed' }}
              icon="book-open-variant"
            >
              Gerenciar
            </Button>
          </View>
          <View style={{ alignItems: 'center', paddingVertical: 24, backgroundColor: '#f5f3ff', borderRadius: 12, borderWidth: 2, borderColor: '#ddd6fe', borderStyle: 'dashed' }}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>�</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#5b21b6', marginBottom: 4 }}>
              Cadastro Manual e Upload CSV
            </Text>
            <Text style={{ fontSize: 12, color: '#7c3aed', textAlign: 'center', paddingHorizontal: 20 }}>
              Cadastre questões manualmente com imagens (ideal para Matemática) ou importe via CSV para outras disciplinas
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Gestão de Promotores */}
      <Card style={styles.tableCard}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={{ fontWeight: '800', color: '#111827' }}>Gestão de Promotores</Text>
            <Button
              mode="contained"
              onPress={() => setShowCreatePromoterModal(true)}
              style={{ backgroundColor: '#f59e0b' }}
              icon="plus"
            >
              Novo Promotor
            </Button>
          </View>

          {promoters.length > 0 ? promoters.map((promoter) => (
            <View key={promoter.id} style={styles.tutorRow}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#fef3c7',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 20 }}>📣</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{promoter.name}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>{promoter.email}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <View style={[styles.subjectBadge, { backgroundColor: '#fef3c7' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#92400e' }}>
                      {promoter.referralCode}
                    </Text>
                  </View>
                  <View style={[styles.subjectBadge, { backgroundColor: promoter.status === 'active' ? '#ecfdf5' : '#fef2f2' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: promoter.status === 'active' ? '#10b981' : '#ef4444' }}>
                      {promoter.status === 'active' ? 'Ativo' : 'Suspenso'}
                    </Text>
                  </View>
                  <View style={styles.subjectBadge}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#4b5563' }}>
                      {promoter.commissionRate}% comissão
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: '#eef2ff', borderRadius: 10, padding: 8 }}
                onPress={() => {
                  setSelectedPromoter(promoter);
                  setShowPromoterModal(true);
                }}
              >
                <Text style={{ fontSize: 18 }}>ℹ️</Text>
              </TouchableOpacity>
            </View>
          )) : (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>📣</Text>
              <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                Nenhum promotor registado.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Logout */}
      <Button
        mode="outlined"
        onPress={() => setShowLogoutModal(true)}
        style={{ marginTop: 16, marginBottom: 32, borderColor: '#ef4444' }}
        labelStyle={{ color: '#ef4444', fontWeight: '600' }}
        icon="logout"
      >
        Terminar Sessão
      </Button>

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

        {/* Modal de Ações do Promotor */}
        <Modal
          visible={showPromoterModal}
          onDismiss={() => setShowPromoterModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ fontWeight: '700', marginBottom: 16, color: '#111827' }}>
                Ações do Promotor
              </Text>
              {selectedPromoter && (
                <>
                  <Text variant="bodyMedium" style={{ marginBottom: 20, color: '#6b7280' }}>
                    {selectedPromoter.name} ({selectedPromoter.email})
                  </Text>

                  <TouchableOpacity style={styles.modalButton} onPress={() => handlePromoterAction(selectedPromoter, 'viewLeads')}><Text style={{ fontSize: 20, marginRight: 8 }}>👥</Text><Text style={styles.modalButtonText}>Ver Leads</Text></TouchableOpacity>
                  {selectedPromoter.status === 'active' ? (<TouchableOpacity style={styles.modalButton} onPress={() => handlePromoterAction(selectedPromoter, 'suspend')}><Text style={{ fontSize: 20, marginRight: 8 }}>⛔</Text><Text style={styles.modalButtonText}>Suspender Promotor</Text></TouchableOpacity>) : (<TouchableOpacity style={styles.modalButton} onPress={() => handlePromoterAction(selectedPromoter, 'activate')}><Text style={{ fontSize: 20, marginRight: 8 }}>✅</Text><Text style={styles.modalButtonText}>Ativar Promotor</Text></TouchableOpacity>)}

                  <Button
                    mode="outlined"
                    onPress={() => setShowPromoterModal(false)}
                    style={{ marginTop: 16 }}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        </Modal>

        {/* Modal de Criar Promotor */}
        <Modal
          visible={showCreatePromoterModal}
          onDismiss={() => setShowCreatePromoterModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ fontWeight: '700', marginBottom: 16, color: '#111827' }}>
                Criar Novo Promotor
              </Text>
              <TextInput
                mode="outlined"
                label="Nome"
                value={newPromoterName}
                onChangeText={setNewPromoterName}
                style={{ marginBottom: 12 }}
              />
              <TextInput
                mode="outlined"
                label="Email"
                value={newPromoterEmail}
                onChangeText={setNewPromoterEmail}
                style={{ marginBottom: 12 }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                mode="outlined"
                label="Comissão (%)"
                value={newPromoterCommission}
                onChangeText={setNewPromoterCommission}
                style={{ marginBottom: 12 }}
                keyboardType="number-pad"
              />
              <TextInput
                mode="outlined"
                label="Senha (opcional - será gerada se vazio)"
                value={newPromoterPassword}
                onChangeText={setNewPromoterPassword}
                style={{ marginBottom: 12 }}
                secureTextEntry
                placeholder="Deixe vazio para gerar automática"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#EAF3FF', padding: 12, borderRadius: 8 }}>
                <Switch
                  value={sendEmailToPromoter}
                  onValueChange={setSendEmailToPromoter}
                  color="#4f46e5"
                />
                <Text style={{ marginLeft: 12, flex: 1, fontSize: 13, color: '#1e40af' }}>
                  📧 Enviar credenciais por email
                </Text>
              </View>
              <View style={{ backgroundColor: '#FFF0ED', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ fontSize: 11, color: '#f97316', lineHeight: 16 }}>
                  💡 Se não enviar por email, copie as credenciais e envie manualmente ao promotor.
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={handleCreatePromoter}
                style={{ marginBottom: 8 }}
              >
                Criar Promotor
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowCreatePromoterModal(false)}
              >
                Cancelar
              </Button>
            </Card.Content>
          </Card>
        </Modal>

        {/* Modal de Leads do Promotor */}
        <Modal
          visible={showPromoterLeadsModal}
          onDismiss={() => setShowPromoterLeadsModal(false)}
          contentContainerStyle={[styles.modalContainer, { maxHeight: '80%' }]}
        >
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ fontWeight: '700', marginBottom: 16, color: '#111827' }}>
                Leads de {selectedPromoter?.name}
              </Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {promoterLeads.length > 0 ? promoterLeads.map((lead) => (
                  <View key={lead.id} style={[styles.tutorRow, { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{lead.userName}</Text>
                      <Text style={{ fontSize: 11, color: '#9ca3af' }}>{lead.userEmail}</Text>
                      <Text style={{ fontSize: 10, color: '#9ca3af' }}>
                        {new Date(lead.activationDate).toLocaleDateString('pt-PT')}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={[styles.subjectBadge, {
                        backgroundColor: lead.status === 'confirmed' ? '#ecfdf5' : lead.status === 'paid' ? '#dbeafe' : '#fef2f2'
                      }]}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: lead.status === 'confirmed' ? '#10b981' : lead.status === 'paid' ? '#3b82f6' : '#ef4444' }}>
                          {lead.status === 'confirmed' ? 'Confirmado' : lead.status === 'paid' ? 'Pago' : 'Fraude'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#111827', marginTop: 4 }}>
                        {lead.commissionAmount} MZN
                      </Text>
                    </View>
                  </View>
                )) : (
                  <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                    <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                      Nenhum lead ainda.
                    </Text>
                  </View>
                )}
              </ScrollView>
              <Button
                mode="outlined"
                onPress={() => setShowPromoterLeadsModal(false)}
                style={{ marginTop: 16 }}
              >
                Fechar
              </Button>
            </Card.Content>
          </Card>
        </Modal>

        {/* Modal de Upload de Exame */}
        <Modal
          visible={showExamUploadModal}
          onDismiss={() => {
            setShowExamUploadModal(false);
            setSelectedPDF(null);
            setExamInstitution('');
            setExamSubject('');
            setExamYear('');
            setExamDuration('90');
            setUploadProgress(0);
            setUploadStatus('idle');
            setUploadError('');
          }}
          contentContainerStyle={[styles.modalContainer, { maxHeight: '90%' }]}
        >
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ fontWeight: '700', marginBottom: 16, color: '#111827' }}>
                Upload de Exame
              </Text>
              
              {uploadStatus === 'idle' && (
                <>
                  <TouchableOpacity
                    onPress={handlePickPDF}
                    style={{
                      backgroundColor: '#f5f3ff',
                      borderWidth: 2,
                      borderColor: '#ddd6fe',
                      borderStyle: 'dashed',
                      borderRadius: 12,
                      padding: 24,
                      alignItems: 'center',
                      marginBottom: 16
                    }}
                  >
                    <Text style={{ fontSize: 48, marginBottom: 8 }}>{selectedPDF ? '📄' : '📤'}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#5b21b6', marginBottom: 4 }}>
                      {selectedPDF ? selectedPDF.name : 'Selecionar PDF'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#7c3aed' }}>
                      {selectedPDF ? 'Clique para alterar' : 'Toque para selecionar arquivo'}
                    </Text>
                  </TouchableOpacity>

                  <TextInput
                    mode="outlined"
                    label="Instituição *"
                    value={examInstitution}
                    onChangeText={setExamInstitution}
                    style={{ marginBottom: 12 }}
                    placeholder="UEM, UP, UCM, ISCTEM..."
                  />
                  <TextInput
                    mode="outlined"
                    label="Disciplina *"
                    value={examSubject}
                    onChangeText={setExamSubject}
                    style={{ marginBottom: 12 }}
                    placeholder="Matemática, Física, Química..."
                  />
                  <TextInput
                    mode="outlined"
                    label="Ano *"
                    value={examYear}
                    onChangeText={setExamYear}
                    style={{ marginBottom: 12 }}
                    keyboardType="number-pad"
                    placeholder="2024"
                  />
                  <TextInput
                    mode="outlined"
                    label="Duração (minutos)"
                    value={examDuration}
                    onChangeText={setExamDuration}
                    style={{ marginBottom: 16 }}
                    keyboardType="number-pad"
                    placeholder="90"
                  />

                  <View style={{ backgroundColor: '#f0fdf4', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    <Text style={{ fontSize: 11, color: '#166534', lineHeight: 16 }}>
                      🤖 O sistema usará IA (Claude) para extrair automaticamente todas as questões do PDF e importar para o Firebase.
                    </Text>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleUploadExam}
                    style={{ marginBottom: 8, backgroundColor: '#7c3aed' }}
                    disabled={!selectedPDF || !examInstitution || !examSubject || !examYear}
                  >
                    Processar Exame
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => setShowExamUploadModal(false)}
                  >
                    Cancelar
                  </Button>
                </>
              )}

              {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                <>
                  <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>
                      {uploadStatus === 'uploading' ? '📤' : '🤖'}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                      {uploadStatus === 'uploading' ? 'Enviando PDF...' : 'Processando com IA...'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
                      {uploadStatus === 'uploading' ? 'Carregando arquivo para o servidor' : 'Claude está analisando o exame'}
                    </Text>
                    <ProgressBar progress={uploadProgress / 100} color="#7c3aed" style={{ width: '100%', marginBottom: 8 }} />
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>{uploadProgress}%</Text>
                  </View>
                </>
              )}

              {uploadStatus === 'completed' && (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Text style={{ fontSize: 48, marginBottom: 16 }}>✅</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                    Exame Processado com Sucesso!
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                    As questões foram extraídas e importadas para o Firebase automaticamente.
                  </Text>
                </View>
              )}

              {uploadStatus === 'error' && (
                <>
                  <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>❌</Text>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                      Erro ao Processar
                    </Text>
                    <Text style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', marginBottom: 16 }}>
                      {uploadError}
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setUploadStatus('idle');
                      setUploadError('');
                    }}
                  >
                    Tentar Novamente
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => setShowExamUploadModal(false)}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32 },
  
  // Header estilo Yango
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profilePhoto: { width: 50, height: 50, borderRadius: borderRadius.round, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 20, fontWeight: '700', color: colors.info },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  userRole: { fontSize: 13, fontWeight: '400' },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerAction: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.grayLight, alignItems: 'center', justifyContent: 'center' },
  headerActionIcon: { fontSize: 20 },
  
  // Stat Card
  statCard: { width: 170, padding: spacing.md },
  statCardContent: { padding: 0 },
  statIcon: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  statValueRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  statValue: { fontSize: 22, fontWeight: '700' },
  trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: borderRadius.sm },
  
  // Table Card
  tableCard: { backgroundColor: colors.white, borderRadius: borderRadius.xl, elevation: 0, borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.lg },
  tableHeader: { marginBottom: spacing.md },
  searchBar: { borderRadius: borderRadius.md, backgroundColor: colors.grayLight, elevation: 0, marginBottom: spacing.md, height: 44 },
  tutorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
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
