import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button, TextInput, Portal, Modal, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_EXAMS = [
  { id: '1', institution: 'UEM', subject: 'Matemática', duration: 120, questions: 20, status: 'active' },
  { id: '2', institution: 'UEM', subject: 'Física', duration: 90, questions: 15, status: 'active' },
  { id: '3', institution: 'UP', subject: 'Português', duration: 90, questions: 25, status: 'draft' },
  { id: '4', institution: 'UCM', subject: 'Biologia', duration: 120, questions: 20, status: 'active' },
];

export default function AdminExamsScreen() {
  const navigation = useNavigation();
  const [exams, setExams] = useState(MOCK_EXAMS);
  const [showCreate, setShowCreate] = useState(false);
  const [editExam, setEditExam] = useState<any>(null);
  const [form, setForm] = useState({ institution: '', subject: '', duration: '', questions: '' });

  const handleCreate = () => {
    const newExam = {
      id: Date.now().toString(),
      institution: form.institution,
      subject: form.subject,
      duration: parseInt(form.duration) || 90,
      questions: parseInt(form.questions) || 20,
      status: 'draft',
    };
    setExams([newExam, ...exams]);
    setForm({ institution: '', subject: '', duration: '', questions: '' });
    setShowCreate(false);
  };

  const toggleStatus = (id: string) => {
    setExams(exams.map(e => e.id === id ? { ...e, status: e.status === 'active' ? 'draft' : 'active' } : e));
  };

  const deleteExam = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
  };

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
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Gestão de Exames</Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Criar e gerir exames de admissão.</Text>
          </View>
        </View>
        <Button mode="contained" onPress={() => setShowCreate(true)} style={styles.addBtn} labelStyle={{ fontWeight: '700', color: '#fff' }} icon="plus">
          Novo Exame
        </Button>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#4f46e5' }}>{exams.length}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Total Exames</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#10b981' }}>{exams.filter(e => e.status === 'active').length}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Activos</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#f97316' }}>{exams.reduce((a, e) => a + e.questions, 0)}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Perguntas</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Exams List */}
      {exams.map(exam => (
        <Card key={exam.id} style={styles.examCard}>
          <Card.Content>
            <View style={styles.examHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={{ fontWeight: '800', fontSize: 16, color: '#111827' }}>{exam.subject}</Text>
                  <Chip compact textStyle={{ fontSize: 10, fontWeight: '700', color: exam.status === 'active' ? '#10b981' : '#f97316' }} style={{ backgroundColor: exam.status === 'active' ? '#ecfdf5' : '#fff7ed' }}>
                    {exam.status === 'active' ? 'Activo' : 'Rascunho'}
                  </Chip>
                </View>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>{exam.institution}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <IconButton icon={exam.status === 'active' ? 'pause' : 'play'} iconColor={exam.status === 'active' ? '#f97316' : '#10b981'} size={18} style={{ backgroundColor: exam.status === 'active' ? '#fff7ed' : '#ecfdf5', borderRadius: 10 }} onPress={() => toggleStatus(exam.id)} />
                <IconButton icon="delete" iconColor="#ef4444" size={18} style={{ backgroundColor: '#fef2f2', borderRadius: 10 }} onPress={() => deleteExam(exam.id)} />
              </View>
            </View>
            <View style={styles.examMeta}>
              <View style={styles.metaItem}>
                <IconButton icon="clock-outline" iconColor="#9ca3af" size={14} style={{ margin: 0 }} />
                <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>{exam.duration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <IconButton icon="help-circle-outline" iconColor="#9ca3af" size={14} style={{ margin: 0 }} />
                <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>{exam.questions} perguntas</Text>
              </View>
              <View style={styles.metaItem}>
                <IconButton icon="calculator" iconColor="#9ca3af" size={14} style={{ margin: 0 }} />
                <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>{(20 / exam.questions).toFixed(1)} pts/cada</Text>
              </View>
            </View>
            <Button mode="outlined" onPress={() => setEditExam(exam)} style={styles.editBtn} labelStyle={{ fontSize: 12, fontWeight: '700', color: '#4f46e5' }}>
              Gerir Perguntas
            </Button>
          </Card.Content>
        </Card>
      ))}

      {/* Create Modal */}
      <Portal>
        <Modal visible={showCreate} onDismiss={() => setShowCreate(false)} contentContainerStyle={styles.modal}>
          <Text variant="titleLarge" style={{ fontWeight: '800', color: '#111827', marginBottom: 20 }}>Novo Exame</Text>
          <TextInput label="Instituição" value={form.institution} onChangeText={v => setForm({ ...form, institution: v })} mode="outlined" style={styles.input} outlineStyle={{ borderRadius: 12 }} placeholder="Ex: UEM" />
          <TextInput label="Disciplina" value={form.subject} onChangeText={v => setForm({ ...form, subject: v })} mode="outlined" style={styles.input} outlineStyle={{ borderRadius: 12 }} placeholder="Ex: Matemática" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput label="Duração (min)" value={form.duration} onChangeText={v => setForm({ ...form, duration: v })} mode="outlined" style={[styles.input, { flex: 1 }]} outlineStyle={{ borderRadius: 12 }} keyboardType="numeric" placeholder="120" />
            <TextInput label="Nº Perguntas" value={form.questions} onChangeText={v => setForm({ ...form, questions: v })} mode="outlined" style={[styles.input, { flex: 1 }]} outlineStyle={{ borderRadius: 12 }} keyboardType="numeric" placeholder="20" />
          </View>
          <Button mode="contained" onPress={handleCreate} style={{ backgroundColor: '#4f46e5', borderRadius: 16, marginTop: 8 }} labelStyle={{ fontWeight: '800', color: '#fff' }} contentStyle={{ paddingVertical: 6 }}>
            Criar Exame
          </Button>
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
  addBtn: { backgroundColor: '#4f46e5', borderRadius: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  examCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 },
  examHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  examMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtn: { borderColor: '#e0e7ff', borderRadius: 12 },
  modal: { backgroundColor: '#fff', margin: 20, borderRadius: 24, padding: 24 },
  input: { marginBottom: 12, backgroundColor: '#f9fafb' },
});
