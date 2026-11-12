import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';
import {
  EDITAL_UNIVERSITIES,
  getCoursesBySchool,
  type University,
  type School,
  type Course,
} from '../data/editalData';

export default function AcademicSetupScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();

  // Seleções hierárquicas
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(user?.competingDisciplines || []);
  const [saving, setSaving] = useState(false);

  // Restaurar seleção anterior (se existir)
  useEffect(() => {
    if (user?.intendedInstitution) {
      const uni = EDITAL_UNIVERSITIES.find(u => u.name === user.intendedInstitution || u.shortName === user.intendedInstitution);
      if (uni) {
        setSelectedUniversity(uni);
        if ((user as any).intendedSchool) {
          const school = uni.schools.find(s => s.name === (user as any).intendedSchool);
          if (school) {
            setSelectedSchool(school);
            if (user.intendedCourse) {
              const course = school.courses.find(c => c.name === user.intendedCourse);
              if (course) setSelectedCourse(course);
            }
          }
        }
      }
    }
  }, []);

  const handleSelectUniversity = (uni: University) => {
    setSelectedUniversity(uni);
    setSelectedSchool(null);
    setSelectedCourse(null);
    setSelectedSubjects([]);
  };

  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school);
    setSelectedCourse(null);
    setSelectedSubjects([]);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    // Auto-preencher disciplinas do edital
    setSelectedSubjects(course.examSubjects);
  };

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleSave = async () => {
    if (!selectedUniversity) {
      Alert.alert('Atenção', 'Selecione a universidade');
      return;
    }
    if (!selectedSchool) {
      Alert.alert('Atenção', 'Selecione a escola/faculdade');
      return;
    }
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
        intendedInstitution: selectedUniversity.name,
        intendedSchool: selectedSchool.name,
        intendedCourse: selectedCourse.name,
        competingDisciplines: selectedSubjects,
      } as any);

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

      {/* Universidade */}
      <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 24, marginRight: spacing.sm }}>🏛️</Text>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Universidade</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Selecione a universidade para o exame de admissão
          </Text>
          <View style={styles.chipsContainer}>
            {EDITAL_UNIVERSITIES.map((uni) => (
              <Chip
                key={uni.name}
                selected={selectedUniversity?.name === uni.name}
                onPress={() => handleSelectUniversity(uni)}
                style={[
                  styles.chip,
                  selectedUniversity?.name === uni.name && { backgroundColor: colors.secondary, borderColor: colors.primary }
                ]}
                textStyle={selectedUniversity?.name === uni.name ? { color: colors.primary, fontWeight: '700' } : { color: colors.textSecondary, fontWeight: '600' }}
              >
                {uni.shortName}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Escola/Faculdade */}
      {selectedUniversity && (
        <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>🏫</Text>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Escola/Faculdade</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Selecione a escola ou faculdade dentro de {selectedUniversity.shortName}
            </Text>
            <View style={styles.chipsContainer}>
              {selectedUniversity.schools.map((school) => (
                <Chip
                  key={school.name}
                  selected={selectedSchool?.name === school.name}
                  onPress={() => handleSelectSchool(school)}
                  style={[
                    styles.chip,
                    selectedSchool?.name === school.name && { backgroundColor: colors.secondary, borderColor: colors.primary }
                  ]}
                  textStyle={selectedSchool?.name === school.name ? { color: colors.primary, fontWeight: '700' } : { color: colors.textSecondary, fontWeight: '600' }}
                >
                  {school.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Curso */}
      {selectedSchool && selectedUniversity && (
        <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>🎓</Text>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Curso Pretendido</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Selecione o curso — as disciplinas do exame serão preenchidas automaticamente
            </Text>
            <View style={styles.chipsContainer}>
              {getCoursesBySchool(selectedUniversity.name, selectedSchool.name).map((course) => (
                <Chip
                  key={course.name}
                  selected={selectedCourse?.name === course.name}
                  onPress={() => handleSelectCourse(course)}
                  style={[
                    styles.chip,
                    selectedCourse?.name === course.name && { backgroundColor: colors.secondary, borderColor: colors.primary }
                  ]}
                  textStyle={selectedCourse?.name === course.name ? { color: colors.primary, fontWeight: '700' } : { color: colors.textSecondary, fontWeight: '600' }}
                >
                  {course.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Disciplinas */}
      {selectedCourse && (
        <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>📚</Text>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Disciplinas de Exame</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Disciplinas do edital para o teu curso ({selectedSubjects.length} selecionadas)
            </Text>
            <View style={styles.chipsContainer}>
              {selectedCourse.examSubjects.map((subject) => (
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
      )}

      {/* Resumo */}
      {selectedUniversity && selectedSchool && selectedCourse && selectedSubjects.length > 0 && (
        <Card style={[styles.card, { backgroundColor: colors.successLight, borderColor: colors.success, borderRadius: borderRadius.xl }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={{ fontSize: 24, marginRight: spacing.sm }}>✅</Text>
              <Text style={[styles.sectionTitle, { color: colors.success }]}>Configuração Atual</Text>
            </View>
            <Text style={{ color: colors.success, marginBottom: spacing.xs }}>
              <Text style={{ fontWeight: '700' }}>Universidade:</Text> {selectedUniversity.shortName}
            </Text>
            <Text style={{ color: colors.success, marginBottom: spacing.xs }}>
              <Text style={{ fontWeight: '700' }}>Escola:</Text> {selectedSchool.name}
            </Text>
            <Text style={{ color: colors.success, marginBottom: spacing.xs }}>
              <Text style={{ fontWeight: '700' }}>Curso:</Text> {selectedCourse.name}
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
        disabled={saving || !selectedUniversity || !selectedSchool || !selectedCourse || selectedSubjects.length === 0}
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
