import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type TutorProfileRoute = RouteProp<{ TutorProfile: { tutor: any } }, 'TutorProfile'>;

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const TIME_SLOTS = ['08:00', '10:00', '14:00', '16:00', '18:00'];

export default function TutorProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute<TutorProfileRoute>();
  const tutor = route.params?.tutor;
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!tutor) return null;

  const handleBook = async () => {
    if (!selectedTime) return;
    const saved = await AsyncStorage.getItem('eduprep_lessons');
    const lessons = saved ? JSON.parse(saved) : [];
    const newLesson = {
      id: Date.now().toString(),
      tutorName: tutor.name,
      subject: tutor.subject,
      date: `${WEEK_DAYS[selectedDay]}, ${selectedTime}`,
      status: 'pending',
      avatar: tutor.avatar,
      price: tutor.price,
    };
    await AsyncStorage.setItem('eduprep_lessons', JSON.stringify([newLesson, ...lessons]));
    setBookingSuccess(true);
  };

  if (bookingSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <IconButton icon="check-circle" iconColor="#10b981" size={56} />
        </View>
        <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827', marginBottom: 8 }}>Aula Agendada!</Text>
        <Text variant="bodyMedium" style={{ color: '#6b7280', textAlign: 'center', marginBottom: 32, maxWidth: 280 }}>
          O tutor {tutor.name} foi notificado. Aguarde a confirmação.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backBtn} labelStyle={{ fontWeight: '800', color: '#fff' }} contentStyle={{ paddingVertical: 8 }}>
          Voltar ao Marketplace
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} style={styles.backIcon} />
        <Image source={{ uri: tutor.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>{tutor.name}</Text>
            {tutor.verified && <IconButton icon="check-decagram" iconColor="#3b82f6" size={20} style={{ margin: 0 }} />}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Chip compact textStyle={{ fontSize: 11, fontWeight: '700', color: '#4f46e5' }} style={{ backgroundColor: '#eef2ff' }}>{tutor.subject}</Chip>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconButton icon="star" iconColor="#eab308" size={14} style={{ margin: 0 }} />
              <Text style={{ fontWeight: '800', fontSize: 14 }}>{tutor.rating}</Text>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>({tutor.reviews})</Text>
            </View>
          </View>
          <Text style={styles.priceTag}>{tutor.price} MT<Text style={{ fontSize: 11, color: '#9ca3af' }}> /hora</Text></Text>
        </View>
      </View>

      {/* Bio */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Sobre</Text>
          <Text variant="bodyMedium" style={{ color: '#4b5563', lineHeight: 22 }}>
            Tutor experiente com mais de 5 anos de experiência em {tutor.subject}. Especializado na preparação para exames de admissão das principais universidades de Moçambique. Metodologia prática e focada em resultados.
          </Text>
        </Card.Content>
      </Card>

      {/* Disciplinas & Experiência */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Disciplinas & Experiência</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {[tutor.subject, 'Álgebra', 'Geometria', 'Trigonometria'].map((d, i) => (
              <Chip key={i} compact textStyle={{ fontSize: 12, fontWeight: '600' }} style={{ backgroundColor: '#f3f4f6' }}>{d}</Chip>
            ))}
          </View>
          <View style={styles.expRow}>
            <View style={styles.expItem}>
              <IconButton icon="school" iconColor="#4f46e5" size={20} style={{ margin: 0 }} />
              <View>
                <Text style={{ fontWeight: '700', fontSize: 13, color: '#111827' }}>Licenciatura em {tutor.subject}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>Universidade Eduardo Mondlane</Text>
              </View>
            </View>
            <View style={styles.expItem}>
              <IconButton icon="briefcase" iconColor="#10b981" size={20} style={{ margin: 0 }} />
              <View>
                <Text style={{ fontWeight: '700', fontSize: 13, color: '#111827' }}>5+ anos de experiência</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>+200 alunos aprovados</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Preparação Exames */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Preparação para Exames de Admissão</Text>
          <View style={styles.examPrepRow}>
            {['UEM', 'UP', 'UCM'].map((inst) => (
              <View key={inst} style={styles.examPrepItem}>
                <View style={styles.examPrepIcon}>
                  <Text style={{ fontWeight: '800', fontSize: 16, color: '#4f46e5' }}>{inst[0]}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151' }}>{inst}</Text>
                <Text style={{ fontSize: 10, color: '#10b981', fontWeight: '700' }}>85% aprovação</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Calendário */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Disponibilidade</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {WEEK_DAYS.map((day, i) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(i)}
                  style={[styles.dayChip, selectedDay === i && styles.dayChipActive]}
                >
                  <Text style={[styles.dayText, selectedDay === i && { color: '#fff' }]}>{day}</Text>
                  <Text style={[styles.dayNum, selectedDay === i && { color: '#fff' }]}>{18 + i}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                style={[styles.timeChip, selectedTime === time && styles.timeChipActive]}
              >
                <Text style={[styles.timeText, selectedTime === time && { color: '#fff' }]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Reviews */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Avaliações Recentes</Text>
          {[
            { name: 'João M.', text: 'Excelente professor! Passei no exame da UEM graças às suas aulas.', rating: 5 },
            { name: 'Maria S.', text: 'Muito paciente e explica muito bem. Recomendo!', rating: 5 },
            { name: 'Pedro A.', text: 'Bom tutor, ajudou-me bastante com trigonometria.', rating: 4 },
          ].map((review, i) => (
            <View key={i} style={styles.reviewItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontWeight: '700', fontSize: 13, color: '#111827' }}>{review.name}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <IconButton key={j} icon="star" iconColor="#eab308" size={12} style={{ margin: 0 }} />
                  ))}
                </View>
              </View>
              <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 18 }}>{review.text}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Book Button */}
      <View style={styles.bookBar}>
        <View>
          <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '700' }}>TOTAL</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#4f46e5' }}>{tutor.price + 50} MT</Text>
        </View>
        <Button
          mode="contained"
          onPress={handleBook}
          disabled={!selectedTime}
          style={[styles.bookBtn, !selectedTime && { opacity: 0.5 }]}
          labelStyle={{ fontWeight: '800', color: '#fff', fontSize: 15 }}
          contentStyle={{ paddingVertical: 8 }}
        >
          Marcar Aula
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { paddingBottom: 32 },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 48, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, elevation: 2, marginBottom: 16 },
  backIcon: { position: 'absolute', top: 8, left: 4, zIndex: 10 },
  avatar: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#f3f4f6', alignSelf: 'center', marginBottom: 12 },
  headerInfo: { alignItems: 'center' },
  priceTag: { fontSize: 20, fontWeight: '800', color: '#4f46e5', marginTop: 8 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontWeight: '800', color: '#111827', marginBottom: 12 },
  expRow: { gap: 12 },
  expItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  examPrepRow: { flexDirection: 'row', gap: 12 },
  examPrepItem: { flex: 1, alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, gap: 4 },
  examPrepIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  dayChip: { width: 52, height: 68, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', gap: 4 },
  dayChipActive: { backgroundColor: '#4f46e5' },
  dayText: { fontSize: 11, fontWeight: '700', color: '#9ca3af' },
  dayNum: { fontSize: 18, fontWeight: '800', color: '#111827' },
  timeChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f3f4f6' },
  timeChipActive: { backgroundColor: '#4f46e5' },
  timeText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  reviewItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  bookBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, marginHorizontal: 16, borderRadius: 20, elevation: 4, marginTop: 4 },
  bookBtn: { backgroundColor: '#4f46e5', borderRadius: 16, elevation: 2 },
  successContainer: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: { width: 96, height: 96, backgroundColor: '#ecfdf5', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  backBtn: { backgroundColor: '#111827', borderRadius: 16, width: '100%' },
});
