import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text, Card, Searchbar, TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, spacing, shadows } from '../theme/colors';

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'Como funciona o simulador?',
    answer: 'O simulador replica o formato real dos exames de admissão. Você escolhe a universidade e disciplinas, e o sistema gera questões baseadas em exames anteriores.',
    category: 'Simulador',
  },
  {
    id: '2',
    question: 'Como usar um código de referral?',
    answer: 'Vá em Perfil > Descontos e Bônus, insira o código do promotor e ative. Você receberá desconto na subscrição premium.',
    category: 'Referral',
  },
  {
    id: '3',
    question: 'Quais são os planos disponíveis?',
    answer: 'Temos o plano Gratuito (5 simulações/mês) e Premium (simulações ilimitadas, questões exclusivas e suporte prioritário).',
    category: 'Subscrição',
  },
  {
    id: '4',
    question: 'Como me tornar promotor?',
    answer: 'Entre em contato com o administrador através do email suporte@simulapass.co.mz para solicitar uma conta de promotor.',
    category: 'Promotor',
  },
  {
    id: '5',
    question: 'Posso usar offline?',
    answer: 'Em breve! Estamos desenvolvendo o modo offline para você baixar questões e estudar sem internet.',
    category: 'App',
  },
];

const CONTACT_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬', value: '+258 84 123 4567', action: 'whatsapp' },
  { id: 'email', label: 'Email', icon: '📧', value: 'suporte@simulapass.co.mz', action: 'email' },
  { id: 'phone', label: 'Telefone', icon: '📞', value: '+258 84 123 4567', action: 'phone' },
];

export default function SupportScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');

  const filteredFAQ = FAQ_ITEMS.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContact = (option: typeof CONTACT_OPTIONS[0]) => {
    switch (option.action) {
      case 'whatsapp':
        Linking.openURL(`whatsapp://send?phone=${option.value.replace(/\s/g, '')}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${option.value}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${option.value.replace(/\s/g, '')}`);
        break;
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      Alert.alert('Erro', 'Por favor, escreva sua mensagem');
      return;
    }
    Alert.alert('Mensagem Enviada', 'Entraremos em contato em breve!');
    setMessage('');
    setShowContactForm(false);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Suporte e Ajuda</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Estamos aqui para ajudar</Text>
        </View>
      </View>

      <Searchbar
        placeholder="Pesquisar dúvidas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: colors.white, borderRadius: borderRadius.md }]}
      />

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Perguntas Frequentes</Text>
      
      {filteredFAQ.map(item => (
        <Card key={item.id} style={[styles.faqCard, { backgroundColor: colors.white, borderRadius: borderRadius.md, ...shadows.small }]}>
          <TouchableOpacity onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}>
            <Card.Content style={styles.faqContent}>
              <View style={styles.faqHeader}>
                <View style={styles.faqLeft}>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.categoryText, { color: colors.info }]}>{item.category}</Text>
                  </View>
                  <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{item.question}</Text>
                </View>
                <Text style={[styles.expandIcon, { color: colors.textTertiary }]}>
                  {expandedId === item.id ? '−' : '+'}
                </Text>
              </View>
              {expandedId === item.id && (
                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.answer}</Text>
              )}
            </Card.Content>
          </TouchableOpacity>
        </Card>
      ))}

      {filteredFAQ.length === 0 && (
        <Card style={[styles.emptyCard, { backgroundColor: colors.white, borderRadius: borderRadius.md }]}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma pergunta encontrada</Text>
          </Card.Content>
        </Card>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Fale Conosco</Text>

      {CONTACT_OPTIONS.map(option => (
        <Card key={option.id} style={[styles.contactCard, { backgroundColor: colors.white, borderRadius: borderRadius.md, ...shadows.small }]}>
          <TouchableOpacity onPress={() => handleContact(option)}>
            <Card.Content style={styles.contactContent}>
              <View style={styles.contactLeft}>
                <View style={[styles.contactIcon, { backgroundColor: colors.grayLight }]}>
                  <Text style={styles.contactEmoji}>{option.icon}</Text>
                </View>
                <View>
                  <Text style={[styles.contactLabel, { color: colors.textPrimary }]}>{option.label}</Text>
                  <Text style={[styles.contactValue, { color: colors.textSecondary }]}>{option.value}</Text>
                </View>
              </View>
              <Text style={[styles.arrow, { color: colors.textTertiary }]}>›</Text>
            </Card.Content>
          </TouchableOpacity>
        </Card>
      ))}

      <Button
        mode="contained"
        onPress={() => setShowContactForm(!showContactForm)}
        style={[styles.formButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
        icon="message-text"
      >
        {showContactForm ? 'Fechar Formulário' : 'Enviar Mensagem'}
      </Button>

      {showContactForm && (
        <Card style={[styles.formCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
          <Card.Content style={styles.formContent}>
            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Envie sua Mensagem</Text>
            <TextInput
              label="Sua mensagem"
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              multiline
              numberOfLines={5}
              style={styles.messageInput}
              placeholder="Descreva sua dúvida ou problema..."
            />
            <Button
              mode="contained"
              onPress={handleSendMessage}
              style={[styles.sendButton, { backgroundColor: colors.success, borderRadius: borderRadius.md }]}
            >
              Enviar
            </Button>
          </Card.Content>
        </Card>
      )}

      <Card style={[styles.infoCard, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}>
        <Card.Content>
          <Text style={[styles.infoTitle, { color: colors.info }]}>⏰ Horário de Atendimento</Text>
          <Text style={[styles.infoText, { color: colors.info }]}>Segunda a Sexta: 8h - 18h</Text>
          <Text style={[styles.infoText, { color: colors.info }]}>Sábado: 9h - 13h</Text>
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
  searchBar: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md, marginTop: spacing.sm },
  faqCard: { marginBottom: spacing.sm },
  faqContent: { padding: spacing.md },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  faqLeft: { flex: 1, marginRight: spacing.md },
  categoryBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm, alignSelf: 'flex-start', marginBottom: spacing.sm },
  categoryText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  faqQuestion: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  faqAnswer: { fontSize: 13, marginTop: spacing.md, lineHeight: 20 },
  expandIcon: { fontSize: 24, fontWeight: '300' },
  emptyCard: { marginBottom: spacing.lg },
  emptyContent: { alignItems: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: 14 },
  contactCard: { marginBottom: spacing.sm },
  contactContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  contactLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  contactIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  contactEmoji: { fontSize: 20 },
  contactLabel: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  contactValue: { fontSize: 12 },
  arrow: { fontSize: 24, fontWeight: '300' },
  formButton: { marginVertical: spacing.lg },
  formCard: { marginBottom: spacing.lg },
  formContent: { padding: spacing.lg },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  messageInput: { marginBottom: spacing.md },
  sendButton: {},
  infoCard: { marginTop: spacing.md },
  infoTitle: { fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  infoText: { fontSize: 12, marginBottom: 2 },
});
