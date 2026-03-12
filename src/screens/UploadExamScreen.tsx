import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, IconButton, Button, TextInput, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBJECTS = ['Matemática', 'Física', 'Química', 'Biologia', 'Português', 'Inglês'];
const INSTITUTIONS = ['UEM', 'UP', 'UCM', 'Unilúrio', 'ISRI', 'ISCTEM'];

export default function UploadExamScreen() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [examTitle, setExamTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isPremium, setIsPremium] = useState(true); // Mock - seria verificado via backend

  const pickDocument = async () => {
    // Mock file selection for demo purposes
    // In production, this would use expo-document-picker or react-native-document-picker
    const mockFile = {
      name: 'Exame_UEM_Matematica_2024.pdf',
      size: 2458624, // ~2.4 MB
      uri: 'mock://file/path',
      mimeType: 'application/pdf',
    };
    setSelectedFile(mockFile);
  };

  const processWithAI = async () => {
    if (!selectedFile || !examTitle || !selectedSubject || !selectedInstitution) {
      Alert.alert('Atenção', 'Preencha todos os campos e selecione um ficheiro.');
      return;
    }

    setIsProcessing(true);

    // Simular processamento IA (em produção seria chamada ao backend com Gemini/GPT)
    setTimeout(async () => {
      const uploadedExam = {
        id: Date.now().toString(),
        title: examTitle,
        subject: selectedSubject,
        institution: selectedInstitution,
        fileName: selectedFile.name,
        uploadDate: new Date().toLocaleDateString(),
        status: 'pending_validation',
        aiProcessed: true,
        questionsGenerated: Math.floor(Math.random() * 10) + 15,
      };

      const saved = await AsyncStorage.getItem('eduprep_uploaded_exams');
      const exams = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem('eduprep_uploaded_exams', JSON.stringify([uploadedExam, ...exams]));

      setIsProcessing(false);
      setUploadSuccess(true);
    }, 3000);
  };

  if (!isPremium) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.premiumBlock}>
            <View style={styles.premiumIcon}>
              <IconButton icon="crown" iconColor="#eab308" size={48} />
            </View>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
              Funcionalidade Premium
            </Text>
            <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24, maxWidth: 320 }}>
              O upload de exames com processamento IA está disponível apenas para utilizadores Premium.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <View style={styles.featureItem}>
                <IconButton icon="robot" iconColor="#4f46e5" size={20} style={{ margin: 0 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' }}>IA Avançada</Text>
              </View>
              <View style={styles.featureItem}>
                <IconButton icon="upload" iconColor="#10b981" size={20} style={{ margin: 0 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' }}>Upload Ilimitado</Text>
              </View>
              <View style={styles.featureItem}>
                <IconButton icon="check-decagram" iconColor="#f97316" size={20} style={{ margin: 0 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' }}>Validação Rápida</Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={() => {}}
              style={{ backgroundColor: '#eab308', borderRadius: 16, width: '100%' }}
              labelStyle={{ fontWeight: '800', color: '#fff', fontSize: 15 }}
              contentStyle={{ paddingVertical: 10 }}
              icon="crown"
            >
              Activar Premium - 500 MT/mês
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (uploadSuccess) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <IconButton icon="check-circle" iconColor="#10b981" size={56} />
            </View>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827', marginBottom: 8 }}>
              Exame Enviado com Sucesso!
            </Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280', textAlign: 'center', marginBottom: 8 }}>
              A IA processou o exame e gerou as questões automaticamente.
            </Text>
            <Text variant="bodySmall" style={{ color: '#9ca3af', textAlign: 'center', marginBottom: 32, maxWidth: 300 }}>
              O exame está agora em validação pela equipa administrativa. Receberá uma notificação quando for aprovado.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Button
                mode="outlined"
                onPress={() => { setUploadSuccess(false); setSelectedFile(null); setExamTitle(''); }}
                style={{ flex: 1, borderColor: '#e5e7eb', borderRadius: 16 }}
                labelStyle={{ fontWeight: '700', color: '#374151' }}
              >
                Enviar Outro
              </Button>
              <Button
                mode="contained"
                onPress={() => {}}
                style={{ flex: 1, backgroundColor: '#4f46e5', borderRadius: 16 }}
                labelStyle={{ fontWeight: '800', color: '#fff' }}
              >
                Ver Status
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <IconButton icon="crown" iconColor="#eab308" size={20} style={{ margin: 0 }} />
          <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Upload de Exames</Text>
        </View>
        <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Envie exames para processamento com IA.</Text>
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <IconButton icon="information" iconColor="#3b82f6" size={20} style={{ margin: 0 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 13, color: '#111827', marginBottom: 2 }}>Como funciona?</Text>
              <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18 }}>
                1. Faça upload do exame em PDF ou imagem{'\n'}
                2. A IA processa e gera questões automaticamente{'\n'}
                3. A equipa valida antes de publicar na plataforma
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <TextInput
        label="Título do Exame"
        value={examTitle}
        onChangeText={setExamTitle}
        mode="outlined"
        style={styles.input}
        outlineStyle={{ borderRadius: 16 }}
        placeholder="Ex: Exame de Admissão UEM 2024"
      />

      <Text style={styles.sectionLabel}>Disciplina</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {SUBJECTS.map(subj => (
          <Chip
            key={subj}
            selected={selectedSubject === subj}
            onPress={() => setSelectedSubject(subj)}
            style={[styles.chip, selectedSubject === subj && styles.chipSelected]}
            textStyle={{ fontSize: 12, fontWeight: '700', color: selectedSubject === subj ? '#fff' : '#374151' }}
          >
            {subj}
          </Chip>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Instituição</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {INSTITUTIONS.map(inst => (
            <Chip
              key={inst}
              selected={selectedInstitution === inst}
              onPress={() => setSelectedInstitution(inst)}
              style={[styles.chip, selectedInstitution === inst && styles.chipSelected]}
              textStyle={{ fontSize: 12, fontWeight: '700', color: selectedInstitution === inst ? '#fff' : '#374151' }}
            >
              {inst}
            </Chip>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity onPress={pickDocument} activeOpacity={0.7}>
        <Card style={[styles.uploadCard, selectedFile && { borderColor: '#10b981', backgroundColor: '#ecfdf5' }]}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 32 }}>
            <View style={[styles.uploadIcon, selectedFile && { backgroundColor: '#10b981' }]}>
              <IconButton icon={selectedFile ? 'check' : 'upload'} iconColor={selectedFile ? '#fff' : '#9ca3af'} size={32} />
            </View>
            <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827', marginTop: 12 }}>
              {selectedFile ? selectedFile.name : 'Selecionar Ficheiro'}
            </Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : 'PDF ou Imagem (máx 10MB)'}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <Button
        mode="contained"
        onPress={processWithAI}
        loading={isProcessing}
        disabled={!selectedFile || !examTitle || !selectedSubject || !selectedInstitution || isProcessing}
        style={[styles.submitBtn, (!selectedFile || !examTitle || !selectedSubject || !selectedInstitution) && { opacity: 0.5 }]}
        labelStyle={{ fontWeight: '800', color: '#fff', fontSize: 15 }}
        contentStyle={{ paddingVertical: 10 }}
        icon="robot"
      >
        {isProcessing ? 'Processando com IA...' : 'Processar com IA'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20 },
  infoCard: { backgroundColor: '#eff6ff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#dbeafe', marginBottom: 20 },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  chip: { backgroundColor: '#f3f4f6', borderRadius: 12 },
  chipSelected: { backgroundColor: '#4f46e5' },
  uploadCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 2, borderColor: '#f3f4f6', borderStyle: 'dashed', marginBottom: 20 },
  uploadIcon: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  submitBtn: { backgroundColor: '#4f46e5', borderRadius: 16, elevation: 4 },
  premiumBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  premiumIcon: { width: 96, height: 96, backgroundColor: '#fef3c7', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  featureItem: { flex: 1, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon: { width: 96, height: 96, backgroundColor: '#ecfdf5', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
});
