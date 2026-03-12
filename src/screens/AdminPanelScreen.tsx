import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Searchbar, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const INITIAL_TUTORS = [
  { id: '1', name: 'Pedro Sambo', subject: 'Matemática', status: 'pending', email: 'pedro@gmail.com', avatar: '' },
  { id: '2', name: 'Ana Vilanculos', subject: 'Português', status: 'pending', email: 'ana@gmail.com', avatar: '' },
  { id: '3', name: 'Mário Langa', subject: 'Física', status: 'active', email: 'mario@gmail.com', avatar: '' },
];

function StatCard({ title, value, trend, icon, color }: any) {
  const colorMap: any = {
    blue: { bg: '#eff6ff', text: '#3b82f6' },
    orange: { bg: '#fff7ed', text: '#f97316' },
    green: { bg: '#ecfdf5', text: '#10b981' },
    indigo: { bg: '#eef2ff', text: '#4f46e5' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <Card style={styles.statCard}>
      <Card.Content>
        <View style={[styles.statIcon, { backgroundColor: c.bg }]}>
          <IconButton icon={icon} iconColor={c.text} size={22} style={{ margin: 0 }} />
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
  const [tutors, setTutors] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  const loadData = async () => {
    const saved = await AsyncStorage.getItem('eduprep_all_tutors');
    if (saved) {
      setTutors(JSON.parse(saved));
    } else {
      await AsyncStorage.setItem('eduprep_all_tutors', JSON.stringify(INITIAL_TUTORS));
      setTutors(INITIAL_TUTORS);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (id: string, status: 'active' | 'suspended' | 'pending') => {
    const updated = tutors.map(t => t.id === id ? { ...t, status } : t);
    setTutors(updated);
    await AsyncStorage.setItem('eduprep_all_tutors', JSON.stringify(updated));
  };

  const filtered = tutors.filter(t =>
    t.name.toLowerCase().includes(filter.toLowerCase()) ||
    t.subject.toLowerCase().includes(filter.toLowerCase())
  );

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
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Painel Administrativo</Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Gestão global de utilizadores e aprovações.</Text>
          </View>
        </View>
        <Button mode="text" onPress={loadData} labelStyle={{ color: '#4f46e5', fontWeight: '700', fontSize: 12 }}>Atualizar</Button>
      </View>

      {/* Admin Quick Actions */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('AdminExams')}>
          <IconButton icon="school" iconColor="#4f46e5" size={20} style={{ margin: 0 }} />
          <Text style={styles.quickActionText}>Exames</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('AdminFinance')}>
          <IconButton icon="cash-multiple" iconColor="#10b981" size={20} style={{ margin: 0 }} />
          <Text style={styles.quickActionText}>Finanças</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('AdminReports')}>
          <IconButton icon="chart-line" iconColor="#f97316" size={20} style={{ margin: 0 }} />
          <Text style={styles.quickActionText}>Relatórios</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 12, paddingRight: 16 }}>
          <StatCard title="Total Utilizadores" value={tutors.length.toString()} trend="+2" icon="account-group" color="blue" />
          <StatCard title="Pendentes" value={tutors.filter(t => t.status === 'pending').length.toString()} trend="Ação" icon="shield-check" color="orange" />
          <StatCard title="Receita (Sim)" value="245k MT" trend="+5.4%" icon="currency-usd" color="green" />
          <StatCard title="Aulas" value="856" trend="+20%" icon="book-open-variant" color="indigo" />
        </View>
      </ScrollView>

      <Card style={styles.tableCard}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={{ fontWeight: '800', color: '#111827' }}>Aprovação de Tutores</Text>
          </View>
          <Searchbar
            placeholder="Pesquisar tutor..."
            value={filter}
            onChangeText={setFilter}
            style={styles.searchBar}
            inputStyle={{ fontSize: 13 }}
          />

          {filtered.length > 0 ? filtered.map((tutor) => (
            <View key={tutor.id} style={styles.tutorRow}>
              <Image
                source={{ uri: tutor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=4f46e5&color=fff` }}
                style={styles.tutorAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{tutor.name}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>{tutor.email}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <View style={styles.subjectBadge}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#4b5563' }}>{tutor.subject}</Text>
                  </View>
                  <StatusBadge status={tutor.status} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {tutor.status === 'pending' && (
                  <>
                    <IconButton icon="check" iconColor="#10b981" size={18} style={{ backgroundColor: '#ecfdf5', borderRadius: 10 }} onPress={() => updateStatus(tutor.id, 'active')} />
                    <IconButton icon="close" iconColor="#ef4444" size={18} style={{ backgroundColor: '#fef2f2', borderRadius: 10 }} onPress={() => updateStatus(tutor.id, 'suspended')} />
                  </>
                )}
                {tutor.status === 'active' && (
                  <IconButton icon="alert" iconColor="#f97316" size={18} style={{ backgroundColor: '#fff7ed', borderRadius: 10 }} onPress={() => updateStatus(tutor.id, 'suspended')} />
                )}
                {tutor.status === 'suspended' && (
                  <IconButton icon="check" iconColor="#10b981" size={18} style={{ backgroundColor: '#ecfdf5', borderRadius: 10 }} onPress={() => updateStatus(tutor.id, 'active')} />
                )}
              </View>
            </View>
          )) : (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>Nenhum tutor encontrado.</Text>
            </View>
          )}
        </Card.Content>
      </Card>
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
});
