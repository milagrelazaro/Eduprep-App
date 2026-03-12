import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

const UNIVERSITIES = [
  'Universidade Eduardo Mondlane (UEM)',
  'Universidade Pedagógica (UP)',
  'Instituto Superior de Ciências e Tecnologia de Moçambique (ISCTEM)',
  'Universidade Católica de Moçambique (UCM)',
  'Instituto Superior Politécnico de Gaza (ISPG)',
  'Universidade Zambeze',
  'Universidade Lúrio',
  'Instituto Superior de Relações Internacionais (ISRI)',
  'Universidade São Tomás de Moçambique',
  'Outra',
];

const COURSES = [
  'Medicina',
  'Engenharia Civil',
  'Engenharia Informática',
  'Direito',
  'Economia',
  'Gestão de Empresas',
  'Arquitetura',
  'Psicologia',
  'Enfermagem',
  'Agronomia',
  'Veterinária',
  'Farmácia',
  'Contabilidade',
  'Marketing',
  'Jornalismo',
  'Relações Internacionais',
  'Educação Física',
  'Biologia',
  'Química',
  'Física',
  'Matemática',
  'História',
  'Geografia',
  'Letras',
  'Outro',
];

const DISCIPLINES = [
  'Português',
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Inglês',
  'Francês',
  'Filosofia',
  'Desenho',
];

export default function AcademicSetupScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  const [targetUniversity, setTargetUniversity] = useState('');
  const [intendedCourse, setIntendedCourse] = useState('');
  const [customCourse, setCustomCourse] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [academicGoals, setAcademicGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDiscipline = (discipline: string) => {
    if (selectedDisciplines.includes(discipline)) {
      setSelectedDisciplines(selectedDisciplines.filter(d => d !== discipline));
    } else {
      setSelectedDisciplines([...selectedDisciplines, discipline]);
    }
  };

  const handleSubmit = async () => {
    if (!targetUniversity) {
      Alert.alert('Erro', 'Por favor, selecione a universidade pretendida.');
      return;
    }

    if (!intendedCourse && !customCourse) {
      Alert.alert('Erro', 'Por favor, selecione ou digite o curso pretendido.');
      return;
    }

    if (selectedDisciplines.length === 0) {
      Alert.alert('Erro', 'Por favor, selecione pelo menos uma disciplina.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalCourse = intendedCourse === 'Outro' ? customCourse : intendedCourse;

      await updateUser({
        targetUniversity,
        intendedCourse: finalCourse,
        competingDisciplines: selectedDisciplines,
        academicGoals: academicGoals.trim() || undefined,
      });

      Alert.alert(
        '✅ Configuração Completa',
        'Seu perfil acadêmico foi configurado com sucesso!',
        [{ text: 'OK', onPress: () => navigation.navigate('Main' as never) }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as configurações. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Pular Configuração',
      'Você pode configurar seu perfil acadêmico depois nas configurações. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Pular', onPress: () => navigation.navigate('Main' as never) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <IconButton 
              icon="arrow-left" 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            />
            <Text variant="headlineMedium" style={styles.title}>
              Configure Seu Perfil Acadêmico
            </Text>
            <View style={styles.placeholder} />
          </View>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Isso nos ajudará a personalizar sua experiência e recomendar os melhores tutores.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🎓 Universidade Pretendida
          </Text>
          <View style={styles.chipContainer}>
            {UNIVERSITIES.map((uni) => (
              <Chip
                key={uni}
                selected={targetUniversity === uni}
                onPress={() => setTargetUniversity(uni)}
                style={[
                  styles.chip,
                  targetUniversity === uni && styles.chipSelected,
                ]}
                textStyle={targetUniversity === uni && styles.chipTextSelected}
              >
                {uni}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            📚 Curso Pretendido
          </Text>
          <View style={styles.chipContainer}>
            {COURSES.map((course) => (
              <Chip
                key={course}
                selected={intendedCourse === course}
                onPress={() => setIntendedCourse(course)}
                style={[
                  styles.chip,
                  intendedCourse === course && styles.chipSelected,
                ]}
                textStyle={intendedCourse === course && styles.chipTextSelected}
              >
                {course}
              </Chip>
            ))}
          </View>

          {intendedCourse === 'Outro' && (
            <TextInput
              mode="outlined"
              label="Digite o nome do curso"
              value={customCourse}
              onChangeText={setCustomCourse}
              style={styles.input}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            ✏️ Disciplinas de Concorrência
          </Text>
          <Text variant="bodySmall" style={styles.sectionDesc}>
            Selecione as disciplinas que você precisará para o exame de admissão
          </Text>
          <View style={styles.chipContainer}>
            {DISCIPLINES.map((discipline) => (
              <Chip
                key={discipline}
                selected={selectedDisciplines.includes(discipline)}
                onPress={() => toggleDiscipline(discipline)}
                style={[
                  styles.chip,
                  selectedDisciplines.includes(discipline) && styles.chipSelected,
                ]}
                textStyle={selectedDisciplines.includes(discipline) && styles.chipTextSelected}
              >
                {discipline}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🎯 Objetivos Acadêmicos (Opcional)
          </Text>
          <TextInput
            mode="outlined"
            label="Descreva seus objetivos e metas"
            value={academicGoals}
            onChangeText={setAcademicGoals}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            placeholder="Ex: Quero passar em Medicina na UEM com nota acima de 15 valores..."
          />
        </View>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            Salvar e Continuar
          </Button>
          <Button mode="text" onPress={handleSkip} disabled={isSubmitting}>
            Pular por Agora
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    margin: 0,
  },
  placeholder: {
    width: 48, // Same width as back button for centering
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDesc: {
    color: '#6b7280',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipSelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  chipTextSelected: {
    color: '#fff',
  },
  input: {
    marginTop: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    marginTop: 8,
    backgroundColor: '#fff',
  },
  actions: {
    marginTop: 16,
    gap: 12,
  },
  submitButton: {
    paddingVertical: 6,
  },
});
