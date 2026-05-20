import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, Card, IconButton, Button, TextInput, Portal, Modal, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AdminExamsScreen() {
  const navigation = useNavigation();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    approvedExams: 0,
    totalQuestions: 0,
    totalAttempts: 0,
  });

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os exames
      const examsQuery = query(
        collection(db, 'exams'),
        orderBy('createdAt', 'desc')
      );
      const examsSnapshot = await getDocs(examsQuery);
      
      const examsData = await Promise.all(
        examsSnapshot.docs.map(async (examDoc) => {
          const examData = { id: examDoc.id, ...examDoc.data() };
          
          // Contar questões
          const questionsSnapshot = await getDocs(
            collection(db, 'exams', examDoc.id, 'questions')
          );
          
          return {
            ...examData,
            questionsCount: questionsSnapshot.size,
          };
        })
      );
      
      setExams(examsData);
      
      // Calcular estatísticas
      const totalQuestions = examsData.reduce((sum, exam) => sum + (exam.questionsCount || 0), 0);
      const approvedCount = examsData.filter((e: any) => e.approved === true).length;
      
      // Buscar tentativas de exames
      const resultsSnapshot = await getDocs(collection(db, 'examResults'));
      
      setStats({
        totalExams: examsData.length,
        approvedExams: approvedCount,
        totalQuestions,
        totalAttempts: resultsSnapshot.size,
      });
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
      Alert.alert('Erro', 'Não foi possível carregar os exames.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = () => {
    navigation.navigate('CreateExam' as never);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'approved' ? 'pending_validation' : 'approved';
      await updateDoc(doc(db, 'exams', id), {
        status: newStatus,
        updatedAt: new Date(),
      });
      
      // Atualizar localmente
      setExams(exams.map(e => e.id === id ? { ...e, status: newStatus } : e));
      Alert.alert('Sucesso', `Exame ${newStatus === 'approved' ? 'aprovado' : 'desativado'}!`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  const deleteExam = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este exame? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'exams', id));
              setExams(exams.filter(e => e.id !== id));
              Alert.alert('Sucesso', 'Exame excluído!');
            } catch (error) {
              console.error('Erro ao excluir exame:', error);
              Alert.alert('Erro', 'Não foi possível excluir o exame.');
            }
          },
        },
      ]
    );
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
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Histórico de Exames</Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Todos os exames criados na plataforma</Text>
          </View>
        </View>
        <Button mode="contained" onPress={handleCreateExam} style={styles.addBtn} labelStyle={{ fontWeight: '700', color: '#fff' }} icon="plus">
          Novo Exame
        </Button>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#4f46e5' }}>{stats.totalExams}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Total Exames</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#10b981' }}>{stats.approvedExams}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Aprovados</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#f97316' }}>{stats.totalQuestions}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Questões</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#8b5cf6' }}>{stats.totalAttempts}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Tentativas</Text>
          </Card.Content>
        </Card>
      </View>

      {loading && (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{ marginTop: 16, color: '#6b7280' }}>Carregando exames...</Text>
        </View>
      )}

      {!loading && exams.length === 0 && (
        <Card style={{ marginTop: 16, backgroundColor: '#f9fafb' }}>
          <Card.Content style={{ alignItems: 'center', padding: 32 }}>
            <IconButton icon="file-document-outline" size={48} iconColor="#9ca3af" />
            <Text style={{ marginTop: 8, fontSize: 16, fontWeight: '600', color: '#6b7280' }}>Nenhum exame criado</Text>
            <Text style={{ marginTop: 4, fontSize: 14, color: '#9ca3af', textAlign: 'center' }}>Clique em "Novo Exame" para criar o primeiro exame</Text>
          </Card.Content>
        </Card>
      )}

      {/* Exams List */}
      {exams.map(exam => (
        <Card key={exam.id} style={styles.examCard}>
          <Card.Content>
            <View style={styles.examHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={{ fontWeight: '800', fontSize: 16, color: '#111827' }}>{exam.subject}</Text>
                  <Chip compact textStyle={{ fontSize: 10, fontWeight: '700', color: exam.status === 'approved' ? '#10b981' : exam.status === 'pending_validation' ? '#f97316' : '#ef4444' }} style={{ backgroundColor: exam.status === 'approved' ? '#ecfdf5' : exam.status === 'pending_validation' ? '#fff7ed' : '#fef2f2' }}>
                    {exam.status === 'approved' ? 'Aprovado' : exam.status === 'pending_validation' ? 'Pendente' : 'Rejeitado'}
                  </Chip>
                </View>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>{exam.institution}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <IconButton icon={exam.status === 'approved' ? 'pause' : 'check'} iconColor={exam.status === 'approved' ? '#f97316' : '#10b981'} size={18} style={{ backgroundColor: exam.status === 'approved' ? '#fff7ed' : '#ecfdf5', borderRadius: 10 }} onPress={() => toggleStatus(exam.id, exam.status)} />
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
            <Button 
              mode="outlined" 
              onPress={() => Alert.alert('Info', 'Funcionalidade de edição será implementada em breve')} 
              style={styles.editBtn} 
              labelStyle={{ fontSize: 12, fontWeight: '700', color: '#4f46e5' }}
            >
              Ver Detalhes
            </Button>
          </Card.Content>
        </Card>
      ))}
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
