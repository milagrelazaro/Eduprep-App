import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, IconButton, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const INSTITUTIONS = ['UEM', 'UP', 'UCM', 'ISCTEM', 'Unilúrio', 'Universidade Zambeze'];
const COURSES = ['Medicina', 'Engenharia', 'Direito', 'Economia', 'Arquitetura', 'Farmácia', 'Veterinária', 'Psicologia'];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState(1);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [examDate, setExamDate] = useState('');

  const handleNext = async () => {
    if (step === 1 && selectedInstitution) {
      setStep(2);
    } else if (step === 2 && selectedCourse) {
      setStep(3);
    } else if (step === 3 && examDate) {
      // Salvar dados e navegar
      await AsyncStorage.setItem('onboarding_completed', 'true');
      await AsyncStorage.setItem('user_institution', selectedInstitution);
      await AsyncStorage.setItem('user_course', selectedCourse);
      await AsyncStorage.setItem('user_exam_date', examDate);
      navigation.navigate('Login');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text variant="titleLarge" style={styles.stepTitle}>Passo 1 de 3</Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>Selecione a universidade onde pretende ingressar</Text>
      <View style={styles.chipsContainer}>
        {INSTITUTIONS.map((inst) => (
          <Chip
            key={inst}
            selected={selectedInstitution === inst}
            onPress={() => setSelectedInstitution(inst)}
            style={styles.chip}
            textStyle={selectedInstitution === inst ? styles.chipTextSelected : styles.chipText}
          >
            {inst}
          </Chip>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text variant="titleLarge" style={styles.stepTitle}>Passo 2 de 3</Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>Selecione o curso pretendido</Text>
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
      <Text variant="titleLarge" style={styles.stepTitle}>Passo 3 de 3</Text>
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
          <IconButton icon="school" iconColor="#fff" size={40} />
        </View>
      </View>

      <Text variant="headlineLarge" style={styles.title}>Bem-vindo ao EduPrep!</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Vamos personalizar sua experiência
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{step}/3</Text>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

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
          disabled={
            (step === 1 && !selectedInstitution) ||
            (step === 2 && !selectedCourse) ||
            (step === 3 && !examDate)
          }
        >
          {step === 3 ? 'Concluir' : 'Próximo'}
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={{ color: '#9ca3af' }}>Já tem uma conta? </Text>
        <Button
          mode="text"
          compact
          onPress={() => navigation.navigate('Login')}
          labelStyle={{ color: '#4f46e5', fontWeight: '700' }}
        >
          Fazer Login
        </Button>
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
    backgroundColor: '#4f46e5',
    borderRadius: 16,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  stepContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  stepTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: '#6b7280',
    marginBottom: 16,
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
    color: '#374151',
  },
  chipTextSelected: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  dateOptions: {
    gap: 8,
  },
  dateOption: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateOptionSelected: {
    backgroundColor: '#eef2ff',
    borderColor: '#4f46e5',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  dateTextSelected: {
    color: '#4f46e5',
  },
  progressContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 400,
    marginBottom: 16,
  },
  button: {
    flex: 1,
  },
});
