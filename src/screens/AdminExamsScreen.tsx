import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Text, Card, IconButton, Button, TextInput, Portal, Modal, Chip, Snackbar } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { auditService } from '../services/auditService';

export default function AdminExamsScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    approvedExams: 0,
    totalQuestions: 0,
    totalAttempts: 0,
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [viewQuestions, setViewQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Confirmação via modal (Alert.alert com botões não funciona no web)
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    destructive?: boolean;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; error?: boolean } | null>(null);

  const runConfirm = async () => {
    if (!confirmAction) return;
    setConfirmBusy(true);
    try {
      await confirmAction.onConfirm();
    } finally {
      setConfirmBusy(false);
      setConfirmAction(null);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadExams();
    }, [])
  );

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
            questionsCount: questionsSnapshot.docs.filter(d => d.data().type !== 'text').length,
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
    navigation.navigate('CreateExamManual' as never);
  };

  const openQuestionsModal = async (exam: any) => {
    setSelectedExam(exam);
    setShowViewModal(true);
    setLoadingQuestions(true);
    setViewQuestions([]);
    try {
      const questionsSnapshot = await getDocs(
        collection(db, 'exams', exam.id, 'questions')
      );
      const questions = questionsSnapshot.docs.map((qDoc) => ({
        id: qDoc.id,
        ...qDoc.data(),
      }));
      questions.sort((a: any, b: any) =>
        ((a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)) ||
        ((a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0))
      );
      setViewQuestions(questions);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      Alert.alert('Erro', 'Não foi possível carregar as questões');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const setExamStatus = async (id: string, newStatus: string, successMessage: string, exam?: any) => {
    try {
      const updates: any = {
        status: newStatus,
        updatedAt: new Date(),
      };

      // Ao aprovar com fonte confirmada, marca como verificado e questões como oficiais
      if (newStatus === 'approved' && exam && exam.source && exam.source.trim()) {
        updates.verificationStatus = 'verified';
        const questionsSnapshot = await getDocs(collection(db, 'exams', id, 'questions'));
        const updatePromises = questionsSnapshot.docs
          .filter(qDoc => qDoc.data().type !== 'text')
          .map(qDoc =>
            updateDoc(doc(db, 'exams', id, 'questions', qDoc.id), {
              isOfficial: true,
            })
          );
        await Promise.all(updatePromises);
      }

      await updateDoc(doc(db, 'exams', id), updates);

      auditService.log({
        actorId: user?.id || '',
        actorName: user?.name || '',
        actorRole: user?.role || '',
        action: newStatus === 'approved' ? 'exam_approved' : 'exam_rejected',
        entity: 'exam',
        entityId: id,
        description: `${newStatus === 'approved' ? 'Aprovou' : 'Rejeitou'} o exame "${exam?.subject || ''} - ${exam?.institution || ''} (${exam?.year || ''})"`,
      });
      
      // Atualizar localmente
      setExams(exams.map(e => e.id === id ? { ...e, status: newStatus } : e));
      setShowViewModal(false);
      setSnackbar({ message: successMessage });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setSnackbar({ message: 'Não foi possível atualizar o status.', error: true });
    }
  };

  const approveExam = (exam: any) => {
    setConfirmAction({
      title: 'Aprovar Exame',
      message: `Aprovar o exame "${exam.subject} - ${exam.institution} (${exam.year})"? Ele ficará disponível para os estudantes.`,
      confirmLabel: 'Aprovar',
      onConfirm: async () => { await setExamStatus(exam.id, 'approved', 'Exame aprovado e disponível!', exam); },
    });
  };

  const rejectExam = (exam: any) => {
    setConfirmAction({
      title: 'Rejeitar Exame',
      message: `Rejeitar o exame "${exam.subject} - ${exam.institution} (${exam.year})"?`,
      confirmLabel: 'Rejeitar',
      destructive: true,
      onConfirm: async () => { await setExamStatus(exam.id, 'rejected', 'Exame rejeitado', exam); },
    });
  };


  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved': return { label: 'Aprovado', color: '#10b981', bg: '#ecfdf5' };
      case 'rejected': return { label: 'Rejeitado', color: '#ef4444', bg: '#fef2f2' };
      case 'pending_validation': return { label: 'Pendente', color: '#f97316', bg: '#fff7ed' };
      case 'draft': return { label: 'Rascunho', color: '#8b5cf6', bg: '#f5f3ff' };
      default: return { label: 'Pendente', color: '#f59e0b', bg: '#fef3c7' };
    }
  };

  const deleteExam = (id: string) => {
    setConfirmAction({
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este exame? Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      destructive: true,
      onConfirm: async () => {
        try {
          const examData = exams.find(e => e.id === id);
          await deleteDoc(doc(db, 'exams', id));
          auditService.log({
            actorId: user?.id || '',
            actorName: user?.name || '',
            actorRole: user?.role || '',
            action: 'exam_deleted',
            entity: 'exam',
            entityId: id,
            description: `Excluiu o exame "${examData?.subject || ''} - ${examData?.institution || ''} (${examData?.year || ''})"`,
          });
          setExams(exams.filter(e => e.id !== id));
          setSnackbar({ message: 'Exame excluído!' });
        } catch (error) {
          console.error('Erro ao excluir exame:', error);
          setSnackbar({ message: 'Não foi possível excluir o exame.', error: true });
        }
      },
    });
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
                  <Text style={{ fontWeight: '800', fontSize: 16, color: '#111827', flexShrink: 1 }} numberOfLines={1}>{exam.subject}</Text>
                  <Chip compact textStyle={{ fontSize: 10, fontWeight: '700', color: getStatusInfo(exam.status).color }} style={{ backgroundColor: getStatusInfo(exam.status).bg }}>
                    {getStatusInfo(exam.status).label}
                  </Chip>
                </View>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>{exam.institution}</Text>
                {exam.uploadedByName ? (
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    Cadastrado por: {exam.uploadedByName}
                  </Text>
                ) : null}
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
            <View style={styles.examActions}>
              {exam.status !== 'approved' && (
                <IconButton icon="check" iconColor="#10b981" size={18} style={[styles.examActionButton, { backgroundColor: '#ecfdf5' }]} onPress={() => approveExam(exam)} />
              )}
              <IconButton icon="eye" iconColor="#4f46e5" size={18} style={[styles.examActionButton, { backgroundColor: '#eef2ff' }]} onPress={() => openQuestionsModal(exam)} />
              <IconButton icon="delete" iconColor="#ef4444" size={18} style={[styles.examActionButton, { backgroundColor: '#fef2f2' }]} onPress={() => deleteExam(exam.id)} />
            </View>
            <Button 
              mode="outlined" 
              onPress={() => openQuestionsModal(exam)} 
              style={styles.editBtn} 
              labelStyle={{ fontSize: 12, fontWeight: '700', color: '#4f46e5' }}
              icon="eye"
            >
              Ver Questões
            </Button>
          </Card.Content>
        </Card>
      ))}

      {/* Modal de Revisão de Questões */}
      <Portal>
        <Modal
          visible={showViewModal}
          onDismiss={() => setShowViewModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={{ fontWeight: '800', color: '#111827', marginBottom: 4 }}>
            Revisão de Questões
          </Text>
          <Text variant="bodyMedium" style={{ color: '#6b7280', marginBottom: 16 }}>
            {selectedExam?.subject} • {selectedExam?.institution} • {selectedExam?.year}
          </Text>

          {loadingQuestions ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={{ marginTop: 12, color: '#6b7280' }}>Carregando questões...</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={true}>
              {viewQuestions.length === 0 ? (
                <Text style={{ color: '#9ca3af', fontStyle: 'italic', paddingVertical: 20 }}>
                  Este exame não tem questões registadas.
                </Text>
              ) : (
                viewQuestions.map((q: any, index: number) => {
                  // Bloco de texto/divisor inserido entre questões
                  if (q.type === 'text') {
                    return (
                      <View key={q.id} style={styles.textBlockReviewItem}>
                        <Text style={styles.textBlockReviewLabel}>📄 Texto / Divisor</Text>
                        <Text style={styles.textBlockReviewText}>{q.text}</Text>
                      </View>
                    );
                  }
                  const questionNumber = viewQuestions.slice(0, index + 1).filter((i: any) => i.type !== 'text').length;
                  return (
                  <View key={q.id} style={styles.questionReviewItem}>
                    <Text style={styles.questionReviewNumber}>Questão {questionNumber}</Text>
                    <Text style={styles.questionReviewText}>{q.text}</Text>
                    {q.imageUrl ? (
                      <Image
                        source={{ uri: q.imageUrl }}
                        style={styles.questionReviewImage}
                        resizeMode="contain"
                      />
                    ) : null}
                    {(q.options || []).map((opt: string, optIdx: number) => {
                      const isCorrect = optIdx === q.correctOption;
                      return (
                        <View
                          key={optIdx}
                          style={[
                            styles.optionReviewRow,
                            isCorrect && styles.optionReviewRowCorrect,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionReviewLetter,
                              isCorrect && styles.optionReviewLetterCorrect,
                            ]}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </Text>
                          <Text
                            style={[
                              styles.optionReviewText,
                              isCorrect && styles.optionReviewTextCorrect,
                            ]}
                          >
                            {opt}
                          </Text>
                          {isCorrect && <Text style={{ fontSize: 14 }}>✅</Text>}
                        </View>
                      );
                    })}
                    {q.explanation ? (
                      <Text style={styles.questionReviewExplanation}>💡 {q.explanation}</Text>
                    ) : null}
                  </View>
                  );
                })
              )}
            </ScrollView>
          )}

          <View style={styles.reviewActions}>
            {selectedExam?.status !== 'approved' && (
              <Button
                mode="contained"
                onPress={() => setExamStatus(selectedExam.id, 'approved', 'Exame aprovado e disponível!', selectedExam)}
                style={[styles.reviewActionButton, { backgroundColor: '#10b981' }]}
                labelStyle={{ color: '#fff', fontWeight: '700' }}
                icon="check"
              >
                Aprovar
              </Button>
            )}
            {selectedExam?.status !== 'rejected' && (
              <Button
                mode="contained"
                onPress={() => rejectExam(selectedExam)}
                style={[styles.reviewActionButton, { backgroundColor: '#ef4444' }]}
                labelStyle={{ color: '#fff', fontWeight: '700' }}
                icon="close"
              >
                Rejeitar
              </Button>
            )}
            <Button
              mode="outlined"
              onPress={() => setShowViewModal(false)}
              style={styles.reviewActionButton}
            >
              Fechar
            </Button>
          </View>
        </Modal>

        {/* Modal de Confirmação (Alert.alert não funciona no web) */}
        <Modal
          visible={!!confirmAction}
          onDismiss={() => setConfirmAction(null)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={{ fontWeight: '700', marginBottom: 12, color: '#111827' }}>
            {confirmAction?.title}
          </Text>
          <Text variant="bodyMedium" style={{ color: '#6b7280', marginBottom: 20, lineHeight: 20 }}>
            {confirmAction?.message}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              mode="outlined"
              onPress={() => setConfirmAction(null)}
              style={{ flex: 1 }}
              disabled={confirmBusy}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={runConfirm}
              loading={confirmBusy}
              style={{ flex: 1 }}
              buttonColor={confirmAction?.destructive ? '#ef4444' : '#4f46e5'}
            >
              {confirmAction?.confirmLabel || 'Confirmar'}
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Feedback de ações (sucesso/erro) */}
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar(null)}
        duration={3500}
        style={snackbar?.error ? { backgroundColor: '#ef4444' } : { backgroundColor: '#10b981' }}
      >
        {snackbar?.message || ''}
      </Snackbar>
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
  examHeader: { marginBottom: 12 },
  examActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10, marginTop: 4 },
  examActionButton: { margin: 0, width: 36, height: 36, borderRadius: 10 },
  examMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtn: { borderColor: '#e0e7ff', borderRadius: 12 },
  modal: { backgroundColor: '#fff', margin: 20, borderRadius: 24, padding: 24 },
  input: { marginBottom: 12, backgroundColor: '#f9fafb' },
  questionReviewItem: { marginBottom: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  questionReviewNumber: { fontSize: 12, fontWeight: '700', color: '#4f46e5', marginBottom: 4 },
  questionReviewText: { fontSize: 14, color: '#111827', marginBottom: 8, lineHeight: 20 },
  questionReviewImage: { width: '100%', height: 160, borderRadius: 8, backgroundColor: '#f3f4f6', marginBottom: 8 },
  optionReviewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, marginBottom: 4 },
  optionReviewRowCorrect: { backgroundColor: '#ecfdf5' },
  optionReviewLetter: { fontSize: 12, fontWeight: '700', color: '#6b7280', width: 18 },
  optionReviewLetterCorrect: { color: '#10b981' },
  optionReviewText: { fontSize: 13, color: '#111827', flex: 1 },
  optionReviewTextCorrect: { color: '#065f46', fontWeight: '600' },
  questionReviewExplanation: { fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 6, lineHeight: 16 },
  reviewActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  reviewActionButton: { flex: 1, borderRadius: 10 },
  textBlockReviewItem: { marginBottom: 20, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#fffbeb', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  textBlockReviewLabel: { fontSize: 11, fontWeight: '700', color: '#b45309', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  textBlockReviewText: { fontSize: 13, color: '#78350f', lineHeight: 20, fontStyle: 'italic' },
});
