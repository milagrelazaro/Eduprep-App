import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, IconButton, Button, Portal, Modal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const SUBJECTS = ['Todos', 'Matemática', 'Física', 'Química', 'Português', 'Biologia', 'Inglês', 'História'];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function MarketplaceScreen() {
  const navigation = useNavigation<Nav>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'success'>('details');
  const [tutors, setTutors] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('Todos');

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    let saved = await AsyncStorage.getItem('eduprep_all_tutors');
    if (!saved) {
      const initial = [
        { id: '1', name: 'Pedro Sambo', subject: 'Matemática', status: 'pending', email: 'pedro@gmail.com', avatar: '' },
        { id: '2', name: 'Ana Vilanculos', subject: 'Português', status: 'pending', email: 'ana@gmail.com', avatar: '' },
        { id: '3', name: 'Mário Langa', subject: 'Física', status: 'active', email: 'mario@gmail.com', avatar: '' },
      ];
      await AsyncStorage.setItem('eduprep_all_tutors', JSON.stringify(initial));
      saved = JSON.stringify(initial);
    }
    const all = JSON.parse(saved);
    const marketplaceData = all
      .filter((t: any) => t.status === 'active')
      .map((t: any) => ({
        ...t,
        price: t.price || Math.floor(Math.random() * 500) + 500,
        rating: t.rating || (Math.random() * (5 - 4.5) + 4.5).toFixed(1),
        reviews: t.reviews || Math.floor(Math.random() * 100) + 10,
        verified: true,
        avatar: t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=4f46e5&color=fff`,
      }));
    setTutors(marketplaceData);
  };

  const handleBook = async () => {
    const saved = await AsyncStorage.getItem('eduprep_lessons');
    const lessons = saved ? JSON.parse(saved) : [];
    const newLesson = {
      id: Date.now().toString(),
      tutorName: selectedTutor.name,
      subject: selectedTutor.subject,
      date: 'Amanhã, 10:00',
      status: 'pending',
      avatar: selectedTutor.avatar,
    };
    await AsyncStorage.setItem('eduprep_lessons', JSON.stringify([newLesson, ...lessons]));
    setBookingStep('success');
  };

  const filteredTutors = tutors.filter(t =>
    (activeFilter === 'Todos' || t.subject === activeFilter) &&
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Encontrar Explicações</Text>
        <Text variant="bodyMedium" style={{ color: '#6b7280', marginBottom: 16 }}>
          Tutores certificados para o seu sucesso académico.
        </Text>

        <Searchbar
          placeholder="Disciplina, nome ou nível..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchBar}
          inputStyle={{ fontSize: 14 }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {SUBJECTS.map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {filteredTutors.length > 0 ? filteredTutors.map(tutor => (
          <Card key={tutor.id} style={styles.tutorCard}>
            <Card.Content>
              <View style={styles.tutorHeader}>
                <Image source={{ uri: tutor.avatar }} style={styles.tutorAvatar} />
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.priceText}>{tutor.price}<Text style={styles.priceCurrency}> MT</Text></Text>
                  <Text style={styles.priceLabel}>POR HORA</Text>
                </View>
              </View>

              <Text variant="titleMedium" style={{ fontWeight: '800', color: '#111827', marginBottom: 4 }}>{tutor.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <View style={styles.subjectBadge}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#4f46e5' }}>{tutor.subject}</Text>
                </View>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '700' }}>• Preparação Exames</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconButton icon="star" iconColor="#eab308" size={14} style={{ margin: 0 }} />
                    <Text style={{ fontWeight: '800', fontSize: 13 }}>{tutor.rating}</Text>
                  </View>
                  <Text style={styles.statLabel}>{tutor.reviews} Reviews</Text>
                </View>
                <View style={[styles.statItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#e5e7eb' }]}>
                  <IconButton icon="video" iconColor="#4f46e5" size={16} style={{ margin: 0 }} />
                  <Text style={styles.statLabel}>Aula Online</Text>
                </View>
                <View style={styles.statItem}>
                  <IconButton icon="map-marker" iconColor="#9ca3af" size={16} style={{ margin: 0 }} />
                  <Text style={styles.statLabel}>Maputo</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('TutorProfile', { tutor })}
                  style={{ flex: 1, borderColor: '#e0e7ff', borderRadius: 16 }}
                  labelStyle={{ fontWeight: '700', color: '#4f46e5', fontSize: 12 }}
                  contentStyle={{ paddingVertical: 4 }}
                >
                  Ver Perfil
                </Button>
                <Button
                  mode="contained"
                  onPress={() => { setSelectedTutor(tutor); setBookingStep('details'); }}
                  style={[styles.bookBtn, { flex: 1 }]}
                  labelStyle={{ fontWeight: '800', color: '#fff', fontSize: 12 }}
                  contentStyle={{ paddingVertical: 4 }}
                >
                  Marcar Aula
                </Button>
              </View>
            </Card.Content>
          </Card>
        )) : (
          <View style={styles.emptyState}>
            <IconButton icon="magnify" iconColor="#d1d5db" size={48} />
            <Text variant="titleMedium" style={{ fontWeight: '700', color: '#111827', marginBottom: 8 }}>A aguardar aprovação de tutores</Text>
            <Text variant="bodySmall" style={{ color: '#9ca3af', textAlign: 'center', maxWidth: 280 }}>
              Neste momento não existem tutores ativos. Volte mais tarde ou aceda ao painel Admin para aprovar novos candidatos.
            </Text>
            <Button mode="text" onPress={loadTutors} style={{ marginTop: 12 }} labelStyle={{ color: '#4f46e5', fontWeight: '700' }}>Recarregar Lista</Button>
          </View>
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Portal>
        <Modal visible={!!selectedTutor} onDismiss={() => setSelectedTutor(null)} contentContainerStyle={styles.modal}>
          {selectedTutor && bookingStep === 'details' ? (
            <View>
              <View style={styles.modalHeader}>
                <View>
                  <Text variant="titleLarge" style={{ fontWeight: '800', color: '#111827' }}>Agendar Aula</Text>
                  <Text variant="bodyMedium" style={{ color: '#9ca3af' }}>Com {selectedTutor.name}</Text>
                </View>
                <IconButton icon="close" onPress={() => setSelectedTutor(null)} />
              </View>

              <View style={styles.modalInfoRow}>
                <View style={[styles.modalInfoIcon, { backgroundColor: '#4f46e5' }]}>
                  <IconButton icon="calendar" iconColor="#fff" size={22} />
                </View>
                <View>
                  <Text style={styles.modalInfoLabel}>SESSÃO SUGERIDA</Text>
                  <Text style={styles.modalInfoValue}>Amanhã, 22 de Outubro</Text>
                </View>
              </View>

              <View style={styles.modalInfoRow}>
                <View style={[styles.modalInfoIcon, { backgroundColor: '#eef2ff' }]}>
                  <IconButton icon="clock-outline" iconColor="#4f46e5" size={22} />
                </View>
                <View>
                  <Text style={styles.modalInfoLabel}>HORÁRIO FIXO</Text>
                  <Text style={styles.modalInfoValue}>10:00 — 11:30</Text>
                </View>
              </View>

              <View style={styles.priceBox}>
                <View style={styles.priceRow}>
                  <Text style={{ color: '#312e81', fontSize: 13 }}>Preço da sessão</Text>
                  <Text style={{ fontWeight: '800', color: '#312e81' }}>{selectedTutor.price} MT</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={{ color: '#312e81', fontSize: 13 }}>Taxa EduPrep</Text>
                  <Text style={{ fontWeight: '800', color: '#312e81' }}>50 MT</Text>
                </View>
                <View style={styles.priceDivider} />
                <View style={styles.priceRow}>
                  <Text style={{ fontWeight: '800', color: '#312e81' }}>Total a pagar</Text>
                  <Text style={{ fontWeight: '800', color: '#4f46e5', fontSize: 20 }}>{selectedTutor.price + 50} MT</Text>
                </View>
              </View>

              <Button mode="contained" onPress={handleBook} style={styles.confirmBtn} labelStyle={{ fontWeight: '800', color: '#fff', fontSize: 16 }} contentStyle={{ paddingVertical: 8 }}>
                Confirmar Agendamento
              </Button>
            </View>
          ) : selectedTutor ? (
            <View style={{ alignItems: 'center', padding: 24 }}>
              <View style={styles.successIcon}>
                <IconButton icon="check-circle" iconColor="#10b981" size={48} />
              </View>
              <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827', marginBottom: 8 }}>Pedido Enviado!</Text>
              <Text variant="bodyMedium" style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
                O tutor foi notificado e deve aceitar a aula em breve.
              </Text>
              <Button mode="contained" onPress={() => setSelectedTutor(null)} style={{ backgroundColor: '#111827', borderRadius: 16, width: '100%' }} labelStyle={{ fontWeight: '800', color: '#fff' }} contentStyle={{ paddingVertical: 8 }}>
                Entendido
              </Button>
            </View>
          ) : null}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontWeight: '800', color: '#111827' },
  searchBar: { borderRadius: 16, backgroundColor: '#fff', elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  filterChip: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  filterChipActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  filterText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  filterTextActive: { color: '#fff' },
  tutorCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  tutorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  tutorAvatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#f3f4f6' },
  priceText: { fontSize: 22, fontWeight: '800', color: '#4f46e5' },
  priceCurrency: { fontSize: 11, fontWeight: '600' },
  priceLabel: { fontSize: 9, color: '#9ca3af', fontWeight: '800', letterSpacing: 2 },
  subjectBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statsRow: { flexDirection: 'row', backgroundColor: '#f9fafb', borderRadius: 16, padding: 12, marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statLabel: { fontSize: 9, color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase' },
  bookBtn: { backgroundColor: '#4f46e5', borderRadius: 16, elevation: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f3f4f6' },
  modal: { backgroundColor: '#fff', margin: 20, borderRadius: 28, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#f9fafb', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  modalInfoIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalInfoLabel: { fontSize: 9, color: '#9ca3af', fontWeight: '800', letterSpacing: 2 },
  modalInfoValue: { fontWeight: '800', color: '#111827', fontSize: 15 },
  priceBox: { backgroundColor: '#eef2ff', borderRadius: 20, padding: 20, marginVertical: 16, borderWidth: 1, borderColor: '#c7d2fe', borderStyle: 'dashed' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceDivider: { height: 1, backgroundColor: '#c7d2fe', marginVertical: 8 },
  confirmBtn: { backgroundColor: '#4f46e5', borderRadius: 20, elevation: 4 },
  successIcon: { width: 80, height: 80, backgroundColor: '#ecfdf5', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
});
