import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, IconButton, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

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
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          iconColor="#4f46e5"
        />
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={styles.title}>Configuração Acadêmica</Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Configure seu curso e disciplinas para simulados personalizados
          </Text>
        </View>
      </View>

      {/* Curso Pretendido */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="school" iconColor="#4f46e5" size={24} style={{ margin: 0 }} />
            <Text variant="titleMedium" style={styles.sectionTitle}>Curso Pretendido</Text>
          </View>
          <Text variant="bodySmall" style={styles.sectionDesc}>
            Selecione o curso que pretende ingressar
          </Text>
          
          <View style={styles.chipsContainer}>
            {COURSES.map((course) => (
              <Chip
                key={course}
                selected={selectedCourse === course}
                onPress={() => setSelectedCourse(course)}
                style={[
                  styles.chip,
                  selectedCourse === course && styles.chipSelected
                ]}
                textStyle={selectedCourse === course ? styles.chipTextSelected : styles.chipText}
              >
                {course}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Disciplinas */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="book-open-variant" iconColor="#10b981" size={24} style={{ margin: 0 }} />
            <Text variant="titleMedium" style={styles.sectionTitle}>Disciplinas de Exame</Text>
          </View>
          <Text variant="bodySmall" style={styles.sectionDesc}>
            Selecione as disciplinas que cairão no seu exame ({selectedSubjects.length} selecionadas)
          </Text>
          
          <View style={styles.chipsContainer}>
            {SUBJECTS.map((subject) => (
              <Chip
                key={subject}
                selected={selectedSubjects.includes(subject)}
                onPress={() => toggleSubject(subject)}
                style={[
                  styles.chip,
                  selectedSubjects.includes(subject) && styles.chipSelectedSubject
                ]}
                textStyle={selectedSubjects.includes(subject) ? styles.chipTextSelected : styles.chipText}
              >
                {subject}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Resumo */}
      {selectedCourse && selectedSubjects.length > 0 && (
        <Card style={[styles.card, { backgroundColor: '#f0fdf4', borderColor: '#10b981' }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <IconButton icon="check-circle" iconColor="#10b981" size={24} style={{ margin: 0 }} />
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: '#10b981' }]}>
                Configuração Atual
              </Text>
            </View>
            <Text style={{ color: '#166534', marginBottom: 8 }}>
              <Text style={{ fontWeight: '700' }}>Curso:</Text> {selectedCourse}
            </Text>
            <Text style={{ color: '#166534' }}>
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
        style={styles.saveButton}
        labelStyle={styles.saveButtonLabel}
        contentStyle={{ paddingVertical: 8 }}
      >
        Salvar Configuração
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    margin: 0,
  },
  title: {
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  sectionDesc: {
    color: '#6b7280',
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipSelected: {
    backgroundColor: '#eef2ff',
    borderColor: '#4f46e5',
  },
  chipSelectedSubject: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  chipText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#111827',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    marginTop: 8,
  },
  saveButtonLabel: {
    fontWeight: '800',
    fontSize: 16,
  },
});
