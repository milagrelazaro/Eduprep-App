import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Modal, TextInput, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors, borderRadius, spacing, shadows } from '../theme/colors';
import * as DocumentPicker from 'expo-document-picker';

export default function ExamManagementScreen() {
  const navigation = useNavigation();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const examsQuery = query(
        collection(db, 'exams'),
        orderBy('createdAt', 'desc')
      );
      const examsSnapshot = await getDocs(examsQuery);
      
      const examsWithQuestions = await Promise.all(
        examsSnapshot.docs.map(async (examDoc) => {
          const examData = { id: examDoc.id, ...examDoc.data() };
          
          const questionsSnapshot = await getDocs(
            collection(db, 'exams', examDoc.id, 'questions')
          );
          
          const questions = questionsSnapshot.docs.map(qDoc => ({
            id: qDoc.id,
            ...qDoc.data()
          }));
          
          return { ...examData, questionsCount: questions.length };
        })
      );
      
      setExams(examsWithQuestions);
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
      Alert.alert('Erro', 'Não foi possível carregar os exames');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedExam) return;
    
    try {
      await deleteDoc(doc(db, 'exams', selectedExam.id));
      Alert.alert('Sucesso', 'Exame excluído com sucesso');
      setShowDeleteModal(false);
      setSelectedExam(null);
      loadExams();
    } catch (error) {
      console.error('Erro ao excluir exame:', error);
      Alert.alert('Erro', 'Não foi possível excluir o exame');
    }
  };

  const filteredExams = exams.filter(exam =>
    exam.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.year?.toString().includes(searchQuery)
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestão de Exames</Text>
          <Text style={styles.headerSubtitle}>{exams.length} exames cadastrados</Text>
        </View>
      </View>

      <View style={styles.content}>
        <TextInput
          mode="outlined"
          placeholder="Pesquisar exames..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />

        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={() => setShowOptionsModal(true)}
            style={styles.addButton}
            icon="plus"
          >
            Adicionar Exame
          </Button>
        </View>

        <ScrollView style={styles.examsList} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando exames...</Text>
            </View>
          )}

          {!loading && filteredExams.length === 0 && (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>Nenhum exame encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? 'Tente outra pesquisa' : 'Adicione o primeiro exame'}
                </Text>
              </Card.Content>
            </Card>
          )}

          {!loading && filteredExams.map((exam) => (
            <Card key={exam.id} style={styles.examCard}>
              <Card.Content style={styles.examCardContent}>
                <View style={styles.examInfo}>
                  <View style={styles.examIconBox}>
                    <Text style={styles.examIcon}>📝</Text>
                  </View>
                  <View style={styles.examDetails}>
                    <Text style={styles.examTitle}>{exam.subject}</Text>
                    <Text style={styles.examSubtitle}>
                      {exam.institution} • {exam.year}
                    </Text>
                    <View style={styles.examMeta}>
                      <Chip
                        style={[styles.metaChip, { backgroundColor: exam.status === 'approved' ? '#ecfdf5' : '#fef3c7' }]}
                        textStyle={[styles.metaChipText, { color: exam.status === 'approved' ? '#10b981' : '#f59e0b' }]}
                      >
                        {exam.status === 'approved' ? 'Aprovado' : 'Pendente'}
                      </Chip>
                      <Chip style={styles.metaChip} textStyle={styles.metaChipText}>
                        {exam.questionsCount || 0} questões
                      </Chip>
                      <Chip style={styles.metaChip} textStyle={styles.metaChipText}>
                        {exam.duration || 90} min
                      </Chip>
                    </View>
                  </View>
                </View>
                <View style={styles.examActions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => {
                      Alert.alert('Em breve', 'Funcionalidade de edição será implementada em breve');
                    }}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#ef4444"
                    onPress={() => {
                      setSelectedExam(exam);
                      setShowDeleteModal(true);
                    }}
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Modal de Opções de Criação */}
      <Modal
        visible={showOptionsModal}
        onDismiss={() => setShowOptionsModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Content>
            <Text style={styles.modalTitle}>Como deseja adicionar o exame?</Text>
            <Text style={styles.modalSubtitle}>Escolha o método de cadastro</Text>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => {
                setShowOptionsModal(false);
                (navigation as any).navigate('CreateExamManual');
              }}
            >
              <View style={styles.optionIconBox}>
                <Text style={styles.optionIcon}>✍️</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Cadastro Manual</Text>
                <Text style={styles.optionDescription}>
                  Ideal para exames de matemática com fórmulas e expressões. Permite adicionar imagens às questões.
                </Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => {
                setShowOptionsModal(false);
                Alert.alert('Upload CSV', 'Funcionalidade já existente no Painel Admin');
              }}
            >
              <View style={styles.optionIconBox}>
                <Text style={styles.optionIcon}>📄</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Upload CSV</Text>
                <Text style={styles.optionDescription}>
                  Para outras disciplinas. Importe múltiplas questões de uma vez via arquivo CSV.
                </Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>

            <Button
              mode="outlined"
              onPress={() => setShowOptionsModal(false)}
              style={styles.cancelButton}
            >
              Cancelar
            </Button>
          </Card.Content>
        </Card>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={showDeleteModal}
        onDismiss={() => setShowDeleteModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Content>
            <Text style={styles.modalTitle}>Excluir Exame</Text>
            <Text style={styles.deleteWarning}>
              Tem certeza que deseja excluir o exame "{selectedExam?.subject} - {selectedExam?.institution} ({selectedExam?.year})"?
            </Text>
            <Text style={styles.deleteSubWarning}>
              Esta ação não pode ser desfeita. Todas as {selectedExam?.questionsCount || 0} questões serão removidas.
            </Text>

            <View style={styles.deleteActions}>
              <Button
                mode="outlined"
                onPress={() => setShowDeleteModal(false)}
                style={styles.deleteActionButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleDeleteExam}
                style={[styles.deleteActionButton, styles.deleteButton]}
                buttonColor="#ef4444"
              >
                Excluir
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  searchInput: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  actionsContainer: {
    marginBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  examsList: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
  },
  emptyCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  examCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  examCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  examInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  examIconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examIcon: {
    fontSize: 24,
  },
  examDetails: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  examSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  examMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaChip: {
    height: 24,
    backgroundColor: colors.grayLight,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  examActions: {
    flexDirection: 'row',
  },
  modalContainer: {
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.grayLight,
    marginBottom: spacing.md,
  },
  optionIconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  optionArrow: {
    fontSize: 24,
    color: colors.textTertiary,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
  deleteWarning: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  deleteSubWarning: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  deleteActionButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
});
