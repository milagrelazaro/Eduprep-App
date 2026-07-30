import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, TextInput, Button, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { colors, borderRadius, spacing, shadows } from '../theme/colors';

const ISSUE_TYPES = [
  { id: 'question_error', label: 'Erro na Questão', icon: '❌', desc: 'Resposta incorreta ou enunciado confuso' },
  { id: 'typo', label: 'Erro de Digitação', icon: '✏️', desc: 'Erros ortográficos ou gramaticais' },
  { id: 'outdated', label: 'Conteúdo Desatualizado', icon: '📅', desc: 'Informação antiga ou obsoleta' },
  { id: 'suggestion', label: 'Sugestão de Melhoria', icon: '💡', desc: 'Ideias para melhorar o conteúdo' },
  { id: 'other', label: 'Outro', icon: '📝', desc: 'Outro tipo de problema' },
];

export default function ReportIssueScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [issueType, setIssueType] = useState('question_error');
  const [description, setDescription] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, descreva o problema');
      return;
    }

    setLoading(true);
    
    // Simular envio
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Obrigado!',
        'Seu relato foi enviado com sucesso. Nossa equipe irá analisar e tomar as medidas necessárias.',
        [
          {
            text: 'OK',
            onPress: () => {
              setDescription('');
              setQuestionId('');
              navigation.goBack();
            }
          }
        ]
      );
    }, 1500);
  };

  const selectedType = ISSUE_TYPES.find(t => t.id === issueType);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Melhorar Conteúdo</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Reporte problemas ou sugestões</Text>
        </View>
      </View>

      <Card style={[styles.infoCard, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}>
        <Card.Content style={styles.infoContent}>
          <Text style={styles.infoEmoji}>🙏</Text>
          <Text style={[styles.infoText, { color: colors.info }]}>
            Sua contribuição ajuda a melhorar a qualidade do SimulaPass para todos!
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tipo de Problema</Text>
          
          <RadioButton.Group onValueChange={setIssueType} value={issueType}>
            {ISSUE_TYPES.map(type => (
              <TouchableOpacity 
                key={type.id}
                style={[
                  styles.typeOption,
                  { borderColor: issueType === type.id ? colors.primary : colors.borderLight }
                ]}
                onPress={() => setIssueType(type.id)}
              >
                <View style={styles.typeLeft}><View style={[styles.typeIcon, { backgroundColor: issueType === type.id ? colors.primaryLight : colors.grayLight }]}><Text style={styles.typeEmoji}>{type.icon}</Text></View><View style={styles.typeInfo}><Text style={[styles.typeLabel, { color: colors.textPrimary }]}>{type.label}</Text><Text style={[styles.typeDesc, { color: colors.textSecondary }]}>{type.desc}</Text></View></View>
                <RadioButton value={type.id} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Detalhes</Text>
          
          {(issueType === 'question_error' || issueType === 'typo') && (
            <TextInput
              label="ID da Questão (opcional)"
              value={questionId}
              onChangeText={setQuestionId}
              mode="outlined"
              style={styles.input}
              placeholder="Ex: Q-2024-MAT-001"
            />
          )}

          <TextInput
            label="Descrição do Problema"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={6}
            style={styles.textArea}
            placeholder={`Descreva o ${selectedType?.label.toLowerCase()} em detalhes...`}
          />

          <View style={styles.userInfo}>
            <Text style={[styles.userInfoLabel, { color: colors.textSecondary }]}>Enviado por:</Text>
            <Text style={[styles.userInfoValue, { color: colors.textPrimary }]}>{user?.name || 'Utilizador'}</Text>
            <Text style={[styles.userInfoEmail, { color: colors.textTertiary }]}>{user?.email}</Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={[styles.submitButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
        contentStyle={styles.submitButtonContent}
      >
        {loading ? 'Enviando...' : 'Enviar Relato'}
      </Button>

      <Card style={[styles.tipsCard, { backgroundColor: colors.warningLight, borderRadius: borderRadius.md }]}>
        <Card.Content>
          <Text style={[styles.tipsTitle, { color: colors.warning }]}>💡 Dicas para um bom relato:</Text>
          <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Seja específico e claro</Text>
          <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Inclua o ID da questão se possível</Text>
          <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Descreva o que está errado e o que deveria ser</Text>
          <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Adicione contexto relevante</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backButton: { marginRight: spacing.md },
  backIcon: { fontSize: 28, color: colors.textPrimary },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  headerSubtitle: { fontSize: 13, fontWeight: '400' },
  infoCard: { marginBottom: spacing.lg },
  infoContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoEmoji: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 13, fontWeight: '500' },
  card: { marginBottom: spacing.lg },
  cardContent: { padding: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  typeOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  typeLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  typeIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  typeEmoji: { fontSize: 20 },
  typeInfo: { flex: 1 },
  typeLabel: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  typeDesc: { fontSize: 12 },
  input: { marginBottom: spacing.md },
  textArea: { marginBottom: spacing.md, minHeight: 120 },
  userInfo: { paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight },
  userInfoLabel: { fontSize: 11, marginBottom: 4 },
  userInfoValue: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  userInfoEmail: { fontSize: 12 },
  submitButton: { marginBottom: spacing.lg },
  submitButtonContent: { paddingVertical: spacing.sm },
  tipsCard: { marginBottom: spacing.lg },
  tipsTitle: { fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  tipItem: { fontSize: 12, marginBottom: 4 },
});
