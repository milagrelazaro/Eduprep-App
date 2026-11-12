import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Modal, TextInput, Chip, IconButton, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors, borderRadius, spacing, shadows } from '../theme/colors';
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from '../store/authStore';
import { auditService } from '../services/auditService';

export default function ExamManagementScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
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

  // Upload CSV
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvProgress, setCsvProgress] = useState({ saved: 0, total: 0 });

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
          
          return { ...examData, questionsCount: questions.filter((q: any) => q.type !== 'text').length };
        })
      );
      
      setExams(examsWithQuestions);
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
      setSnackbar({ message: 'Não foi possível carregar os exames', error: true });
    } finally {
      setLoading(false);
    }
  };

  // ── Upload CSV ──────────────────────────────────────────────────────────
  // Parser de linha CSV que respeita campos entre aspas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Ler o conteúdo do ficheiro (web: File; mobile: uri)
  const readFileContent = async (asset: any): Promise<string> => {
    if (asset.file) {
      return await asset.file.text();
    }
    const res = await fetch(asset.uri);
    return await res.text();
  };

  const handlePickCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets && result.assets[0];
      if (!asset) return;

      const content = await readFileContent(asset);
      await handleImportCSV(content, asset.name || 'exame.csv');
    } catch (error) {
      console.error('Erro ao selecionar CSV:', error);
      setSnackbar({ message: 'Não foi possível ler o ficheiro CSV', error: true });
    }
  };

  const handleImportCSV = async (content: string, fileName: string) => {
    try {
      setCsvImporting(true);
      setCsvProgress({ saved: 0, total: 0 });

      const lines = content.split('\n');
      const headerIndex = lines.findIndex(line => line.trim().startsWith('institution'));
      if (headerIndex === -1) {
        setSnackbar({ message: 'CSV inválido: cabeçalho "institution" não encontrado', error: true });
        return;
      }

      const headers = parseCSVLine(lines[headerIndex]);
      const dataLines = lines.slice(headerIndex + 1).filter(line => line.trim() && !line.trim().startsWith('#'));

      // Agrupar questões por exame (instituição + disciplina + ano)
      const examsMap = new Map<string, any>();
      dataLines.forEach(line => {
        const values = parseCSVLine(line);
        const q: any = {};
        headers.forEach((header, index) => { q[header] = values[index] || ''; });

        if (!q.institution || !q.question_text) return;

        const key = `${q.institution}-${q.subject}-${q.year}`;
        if (!examsMap.has(key)) {
          examsMap.set(key, {
            institution: q.institution.trim(),
            subject: q.subject.trim(),
            year: parseInt(q.year) || new Date().getFullYear(),
            duration: parseInt(q.duration) || 90,
            status: q.status || 'pending',
            questions: [],
          });
        }
        const exam = examsMap.get(key)!;
        exam.questions.push({
          type: 'question',
          text: q.question_text.trim(),
          options: [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter((o: string) => o && o.trim()),
          correctOption: parseInt(q.correct_option) || 0,
          explanation: q.explanation || '',
          correctFeedback: q.correct_feedback || 'Resposta correta!',
          incorrectFeedback: q.incorrect_feedback || 'Resposta incorreta.',
          topic: q.topic || q.subject,
          learnMoreUrl: q.learn_more_url || '',
          isOfficial: false,
        });
      });

      if (examsMap.size === 0) {
        setSnackbar({ message: 'Nenhuma questão válida encontrada no CSV', error: true });
        return;
      }

      // Importar cada exame
      let imported = 0;
      let skipped = 0;
      const total = examsMap.size;
      setCsvProgress({ saved: 0, total });

      for (const examData of examsMap.values()) {
        try {
          // Verificar duplicados (instituição + disciplina + ano)
          const existsQuery = query(
            collection(db, 'exams'),
            where('institution', '==', examData.institution),
            where('subject', '==', examData.subject),
            where('year', '==', examData.year)
          );
          const existsSnap = await getDocs(existsQuery);
          if (!existsSnap.empty) {
            console.log(`⏭️ Exame já existe: ${examData.institution} - ${examData.subject} (${examData.year})`);
            skipped++;
            setCsvProgress({ saved: imported, total });
            continue;
          }

          const examRef = await addDoc(collection(db, 'exams'), {
            institution: examData.institution,
            subject: examData.subject,
            year: examData.year,
            duration: examData.duration,
            status: 'pending',
            questionsCount: examData.questions.length,
            source: fileName,
            usageRights: 'Público',
            verificationStatus: 'unverified',
            uploadedBy: user?.id || '',
            uploadedByName: user?.name || '',
            uploadedByRole: user?.role || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          for (let i = 0; i < examData.questions.length; i++) {
            await addDoc(collection(db, 'exams', examRef.id, 'questions'), {
              ...examData.questions[i],
              order: i,
              createdAt: serverTimestamp(),
            });
          }

          auditService.log({
            actorId: user?.id || '',
            actorName: user?.name || '',
            actorRole: user?.role || '',
            action: 'exam_created_pending',
            entity: 'exam',
            entityId: examRef.id,
            description: `Importou via CSV o exame "${examData.subject} - ${examData.institution} (${examData.year})" com ${examData.questions.length} questões`,
          });

          imported++;
        } catch (e) {
          console.error('Erro ao importar exame do CSV:', e);
          skipped++;
        }
        setCsvProgress({ saved: imported, total });
      }

      setSnackbar({ message: `CSV importado: ${imported} exame(s) criado(s)${skipped > 0 ? `, ${skipped} com erro` : ''}` });
      loadExams();
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      setSnackbar({ message: 'Não foi possível importar o CSV', error: true });
    } finally {
      setCsvImporting(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedExam) return;

    try {
      await deleteDoc(doc(db, 'exams', selectedExam.id));
      auditService.log({
        actorId: user?.id || '',
        actorName: user?.name || '',
        actorRole: user?.role || '',
        action: 'exam_deleted',
        entity: 'exam',
        entityId: selectedExam.id,
        description: `Excluiu o exame "${selectedExam.subject} - ${selectedExam.institution} (${selectedExam.year})"`,
      });
      setSnackbar({ message: 'Exame excluído com sucesso' });
      setShowDeleteModal(false);
      setSelectedExam(null);
      loadExams();
    } catch (error) {
      console.error('Erro ao excluir exame:', error);
      setSnackbar({ message: 'Não foi possível excluir o exame', error: true });
    }
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

  const handleApproveExam = async (exam: any) => {
    try {
      // Se o exame tem fonte/origem confirmada, marca como verificado e questões como oficiais
      const hasSource = !!(exam.source && exam.source.trim());
      await updateDoc(doc(db, 'exams', exam.id), {
        status: 'approved',
        verificationStatus: hasSource ? 'verified' : 'unverified',
        updatedAt: new Date(),
      });

      if (hasSource) {
        const questionsSnapshot = await getDocs(collection(db, 'exams', exam.id, 'questions'));
        const updatePromises = questionsSnapshot.docs
          .filter(qDoc => qDoc.data().type !== 'text')
          .map(qDoc =>
            updateDoc(doc(db, 'exams', exam.id, 'questions', qDoc.id), {
              isOfficial: true,
            })
          );
        await Promise.all(updatePromises);
      }

      auditService.log({
        actorId: user?.id || '',
        actorName: user?.name || '',
        actorRole: user?.role || '',
        action: 'exam_approved',
        entity: 'exam',
        entityId: exam.id,
        description: `Aprovou o exame "${exam.subject} - ${exam.institution} (${exam.year})"`,
      });
      setSnackbar({ message: `Exame "${exam.subject}" aprovado e disponível para os estudantes!` });
      setShowViewModal(false);
      loadExams();
    } catch (error) {
      console.error('Erro ao aprovar exame:', error);
      setSnackbar({ message: 'Não foi possível aprovar o exame', error: true });
    }
  };

  const handleRejectExam = (exam: any) => {
    setConfirmAction({
      title: 'Rejeitar Exame',
      message: `Tem certeza que deseja rejeitar o exame "${exam.subject} - ${exam.institution} (${exam.year})"?`,
      confirmLabel: 'Rejeitar',
      destructive: true,
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, 'exams', exam.id), {
            status: 'rejected',
            updatedAt: new Date(),
          });
          auditService.log({
            actorId: user?.id || '',
            actorName: user?.name || '',
            actorRole: user?.role || '',
            action: 'exam_rejected',
            entity: 'exam',
            entityId: exam.id,
            description: `Rejeitou o exame "${exam.subject} - ${exam.institution} (${exam.year})"`,
          });
          setSnackbar({ message: 'Exame rejeitado' });
          setShowViewModal(false);
          loadExams();
        } catch (error) {
          console.error('Erro ao rejeitar exame:', error);
          setSnackbar({ message: 'Não foi possível rejeitar o exame', error: true });
        }
      },
    });
  };

  const getExamStatusInfo = (status: string) => {
    switch (status) {
      case 'approved': return { label: 'Aprovado', color: '#10b981', bg: '#ecfdf5' };
      case 'rejected': return { label: 'Rejeitado', color: '#ef4444', bg: '#fef2f2' };
      case 'pending_validation': return { label: 'Pendente', color: '#f97316', bg: '#fff7ed' };
      case 'draft': return { label: 'Rascunho', color: '#8b5cf6', bg: '#f5f3ff' };
      default: return { label: 'Pendente', color: '#f59e0b', bg: '#fef3c7' };
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
            disabled={csvImporting}
          >
            Adicionar Exame
          </Button>
        </View>

        {csvImporting && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f5f3ff', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <ActivityIndicator size="small" color="#7c3aed" />
            <Text style={{ fontSize: 13, color: '#5b21b6', flex: 1 }}>
              Importando CSV... {csvProgress.saved}/{csvProgress.total} exame(s)
            </Text>
          </View>
        )}

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
                    {exam.uploadedByName ? (
                      <Text style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 6 }}>
                        Cadastrado por: {exam.uploadedByName}
                      </Text>
                    ) : null}
                    <View style={styles.examMeta}>
                      <Chip
                        style={[styles.metaChip, { backgroundColor: getExamStatusInfo(exam.status).bg }]}
                        textStyle={[styles.metaChipText, { color: getExamStatusInfo(exam.status).color }]}
                      >
                        {getExamStatusInfo(exam.status).label}
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
                  {(exam.status === 'draft' || exam.status === 'pending' || exam.status === 'pending_validation') && (
                    <IconButton
                      icon="pencil"
                      size={18}
                      iconColor="#8b5cf6"
                      style={styles.examActionButton}
                      onPress={() => (navigation as any).navigate('CreateExamManual', { examId: exam.id })}
                    />
                  )}
                  {exam.status !== 'approved' && (
                    <IconButton
                      icon="check"
                      size={18}
                      iconColor="#10b981"
                      style={styles.examActionButton}
                      onPress={() => handleApproveExam(exam)}
                    />
                  )}
                  <IconButton
                    icon="eye"
                    size={18}
                    iconColor="#4f46e5"
                    style={styles.examActionButton}
                    onPress={() => openQuestionsModal(exam)}
                  />
                  <IconButton
                    icon="delete"
                    size={18}
                    iconColor="#ef4444"
                    style={styles.examActionButton}
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
                handlePickCSV();
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

      {/* Modal de Revisão de Questões */}
      <Modal
        visible={showViewModal}
        onDismiss={() => setShowViewModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={{ maxHeight: 600 }}>
          <Card.Content>
            <Text style={styles.modalTitle}>Revisão de Questões</Text>
            <Text style={styles.modalSubtitle}>
              {selectedExam?.subject} • {selectedExam?.institution} • {selectedExam?.year}
            </Text>

            {loadingQuestions ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 12, color: colors.textSecondary }}>Carregando questões...</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={true}>
                {viewQuestions.length === 0 ? (
                  <Text style={{ color: colors.textSecondary, fontStyle: 'italic', paddingVertical: 20 }}>
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
                  onPress={() => handleApproveExam(selectedExam)}
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
                  onPress={() => handleRejectExam(selectedExam)}
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
          </Card.Content>
        </Card>
      </Modal>

      {/* Modal de Confirmação (Alert.alert não funciona no web) */}
      <Modal
        visible={!!confirmAction}
        onDismiss={() => setConfirmAction(null)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Content>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#111827' }}>
              {confirmAction?.title}
            </Text>
            <Text style={{ color: '#6b7280', marginBottom: 20, lineHeight: 20 }}>
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
          </Card.Content>
        </Card>
      </Modal>

      {/* Feedback de ações (sucesso/erro) */}
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar(null)}
        duration={3500}
        style={snackbar?.error ? { backgroundColor: '#ef4444' } : { backgroundColor: '#10b981' }}
      >
        {snackbar?.message || ''}
      </Snackbar>
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
    flexDirection: 'column',
    gap: spacing.sm,
  },
  examInfo: {
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
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs,
  },
  examActionButton: {
    margin: 0,
    width: 36,
    height: 36,
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
  questionReviewItem: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  questionReviewNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  questionReviewText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  questionReviewImage: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.md,
    backgroundColor: colors.grayLight,
    marginBottom: spacing.sm,
  },
  optionReviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  optionReviewRowCorrect: {
    backgroundColor: '#ecfdf5',
  },
  optionReviewLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 18,
  },
  optionReviewLetterCorrect: {
    color: '#10b981',
  },
  optionReviewText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  optionReviewTextCorrect: {
    color: '#065f46',
    fontWeight: '600',
  },
  questionReviewExplanation: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 16,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  reviewActionButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  textBlockReviewItem: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fffbeb',
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  textBlockReviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textBlockReviewText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
