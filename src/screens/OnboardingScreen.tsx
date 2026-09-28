import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const INSTITUTIONS = ['UEM', 'UP', 'UCM', 'ISCTEM', 'Unilúrio', 'Universidade Zambeze'];
const COURSES = ['Medicina', 'Engenharia', 'Direito', 'Economia', 'Arquitetura', 'Farmácia', 'Veterinária', 'Psicologia'];
const SUBJECTS = ['Matemática', 'Física', 'Química', 'Biologia', 'Português', 'Inglês', 'História', 'Geografia'];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { updateUser, user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [examDate, setExamDate] = useState('');
  const [saving, setSaving] = useState(false);
  const totalSteps = 4;

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2 && selectedCourse) {
      setStep(3);
    } else if (step === 3 && selectedSubjects.length > 0) {
      setStep(4);
    } else if (step === 4 && examDate) {
      // Salvar dados no perfil do usuário
      setSaving(true);
      try {
        await updateUser({
          intendedCourse: selectedCourse,
          intendedInstitution: selectedInstitution,
          competingDisciplines: selectedSubjects,
        });

        // Salvar data do exame no AsyncStorage
        await AsyncStorage.setItem('user_exam_date', examDate);

        // Navegar para o Main (Dashboard)
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível salvar as configurações');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={{ fontSize: 64, marginBottom: 20 }}>🎓</Text>
      <Text variant="headlineMedium" style={styles.stepTitle}>Bem-vindo ao EduPrep!</Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>
        Vamos personalizar a tua experiência para te ajudar a preparar o teu exame de admissão.
      </Text>
      <View style={styles.welcomeFeatures}><View style={styles.featureItem}><Text style={styles.featureIcon}>📚</Text><Text style={styles.featureText}>Simulados realistas</Text></View><View style={styles.featureItem}><Text style={styles.featureIcon}>🎯</Text><Text style={styles.featureText}>Questões explicadas</Text></View><View style={styles.featureItem}><Text style={styles.featureIcon}>📊</Text><Text style={styles.featureText}>Acompanhamento de progresso</Text></View></View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text variant="titleLarge" style={styles.stepTitle}>Passo 2 de 4</Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>Selecione o curso que pretende fazer</Text>
      <View style={styles.chipsContainer}>
        {COURSES.map((course) => (
          <Chip
            key={course}
            selected={selectedCourse === course}
            onPress={() => setSelectedCourse(course)}
            style={styles.chip}
            textStyle={selectedCourse === course ? styles.chipTextSelected : styles.chipText}
          >
            {course}
          </Chip>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text variant="titleLarge" style={styles.stepTitle}>Passo 3 de 4</Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>Selecione as disciplinas do seu exame ({selectedSubjects.length} selecionadas)</Text>
      <View style={styles.chipsContainer}>
        {SUBJECTS.map((subject) => (
          <Chip
            key={subject}
            selected={selectedSubjects.includes(subject)}
            onPress={() => toggleSubject(subject)}
            style={styles.chip}
            textStyle={selectedSubjects.includes(subject) ? styles.chipTextSelected : styles.chipText}
          >
            {subject}
          </Chip>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text variant="titleLarge" style={styles.stepTitle}>Passo 4 de 4</Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>Quando é o seu exame de admissão?</Text>
      <View style={styles.dateOptions}>
        {['Janeiro 2027', 'Fevereiro 2027', 'Março 2027', 'Abril 2027', 'Maio 2027', 'Junho 2027'].map((date) => (
          <TouchableOpacity
            key={date}
            style={[styles.dateOption, examDate === date && styles.dateOptionSelected]}
            onPress={() => setExamDate(date)}
          >
            <Text style={[styles.dateText, examDate === date && styles.dateTextSelected]}>{date}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={{ fontSize: 40 }}>🎓</Text>
        </View>
      </View>

      <Text variant="headlineLarge" style={styles.title}>Bem-vindo ao EduPrep!</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Vamos personalizar sua experiência
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{step}/{totalSteps}</Text>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      <View style={styles.buttonContainer}>
        {step > 1 && (
          <Button mode="outlined" onPress={handleBack} style={styles.button}>
            Voltar
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          loading={saving}
          disabled={
            (step === 2 && !selectedCourse) ||
            (step === 3 && selectedSubjects.length === 0) ||
            (step === 4 && !examDate)
          }
        >
          {step === 4 ? 'Concluir' : 'Próximo'}
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={{ color: '#9ca3af', textAlign: 'center' }}>Configure seu perfil para ter acesso aos simulados personalizados</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#FFC629',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFC629',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  stepContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  stepTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: '#6b7280',
    marginBottom: 20,
  },
  welcomeFeatures: {
    marginTop: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  chipText: {
    color: '#6b7280',
  },
  chipTextSelected: {
    color: '#E6B21F',
  },
  dateOptions: {
    flexDirection: 'column',
    gap: 8,
  },
  dateOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  dateOptionSelected: {
    borderColor: '#FFC629',
    backgroundColor: '#FFF8E1',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  dateTextSelected: {
    color: '#E6B21F',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 400,
  },
  button: {
    flex: 1,
  },
  footer: {
    marginTop: 32,
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  optionDesc: {
    color: '#6b7280',
  },
});
