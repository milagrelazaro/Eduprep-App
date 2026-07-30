import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

const COURSES = [
  'Medicina',
  'Engenharia',
  'Direito',
  'Economia',
  'Gestão',
  'Informática',
  'Arquitetura',
  'Psicologia',
];

const SUBJECTS = [
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'Português',
  'Inglês',
  'História',
  'Geografia',
];

export default function AcademicSetupScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  
  const [selectedCourse, setSelectedCourse] = useState(user?.intendedCourse || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(user?.competingDisciplines || []);
  const [saving, setSaving] = useState(false);

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      Alert.alert('Atenção', 'Selecione o curso pretendido');
      return;
    }

    if (selectedSubjects.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos uma disciplina');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        intendedCourse: selectedCourse,
        competingDisciplines: selectedSubjects,
      });
      
      Alert.alert('Sucesso', 'Configuração acadêmica atualizada!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header estilo Yango */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Configuração Acadêmica</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Configure o teu curso e disciplinas
          </Text>
        </View>
      </View>

      {/* Curso Pretendido */}
      <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 24, marginRight: spacing.sm }}>🎓</Text>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Curso Pretendido</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Selecione o curso que pretendes ingressar
          </Text>
          <View style={styles.chipsContainer}>
            {COURSES.map((course) => (
              <Chip
                key={course}
                selected={selectedCourse === course}
                onPress={() => setSelectedCourse(course)}
                style={[
                  styles.chip,
                  selectedCourse === course && { backgroundColor: colors.secondary, borderColor: colors.primary }
                ]}
                textStyle={selectedCourse === course ? { color: colors.primary, fontWeight: '700' } : { color: colors.textSecondary, fontWeight: '600' }}
              >
                {course}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Disciplinas */}
      <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeader}><Text style={{ fontSize: 24, marginRight: spacing.sm }}>📚</Text><Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Disciplinas de Exame</Text></View>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Selecione as disciplinas que cairão no teu exame ({selectedSubjects.length} selecionadas)
          </Text>
          <View style={styles.chipsContainer}>
            {SUBJECTS.map((subject) => (
              <Chip
                key={subject}
                selected={selectedSubjects.includes(subject)}
                onPress={() => toggleSubject(subject)}
                style={[
                  styles.chip,
                  selectedSubjects.includes(subject) && { backgroundColor: colors.successLight, borderColor: colors.success }
                ]}
                textStyle={selectedSubjects.includes(subject) ? { color: colors.success, fontWeight: '700' } : { color: colors.textSecondary, fontWeight: '600' }}
              >
                {subject}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Resumo */}
      {selectedCourse && selectedSubjects.length > 0 && (
        <Card style={[styles.card, { backgroundColor: colors.successLight, borderColor: colors.success, borderRadius: borderRadius.xl }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>✅</Text>
              <Text style={[styles.sectionTitle, { color: colors.success }]}>
                Configuração Atual
              </Text>
            </View>
            <Text style={{ color: colors.success, marginBottom: spacing.sm }}>
              <Text style={{ fontWeight: '700' }}>Curso:</Text> {selectedCourse}
            </Text>
            <Text style={{ color: colors.success }}>
              <Text style={{ fontWeight: '700' }}>Disciplinas:</Text> {selectedSubjects.join(', ')}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Botão Salvar */}
      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving || !selectedCourse || selectedSubjects.length === 0}
        style={[styles.saveButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
        labelStyle={styles.saveButtonLabel}
        contentStyle={{ paddingVertical: spacing.sm }}
      >
        Salvar Configuração
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  // Header estilo Yango
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  
  // Cards
  card: {
    marginBottom: spacing.lg,
  },
  cardContent: {
    padding: spacing.lg,
  },
  
  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: spacing.md,
  },
  
  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.grayLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  
  // Save Button
  saveButton: {
    marginTop: spacing.lg,
  },
  saveButtonLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
});
