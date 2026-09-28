import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Text, Card, Button, TextInput, Modal, Portal } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { referralService } from '../services/referralService';
import { Promoter, ReferralLead } from '../types';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';

export default function PromoterPanelScreen() {
  const { user, logout } = useAuthStore();
  const [promoter, setPromoter] = useState<Promoter | null>(null);
  const [leads, setLeads] = useState<ReferralLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    loadPromoterData();
  }, [user?.id]);

  const loadPromoterData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const promoterData = await referralService.getPromoterByUserId(user.id);
      setPromoter(promoterData);

      if (promoterData) {
        const leadsData = await referralService.getPromoterLeads(promoterData.id);
        setLeads(leadsData);
      }
    } catch (error) {
      console.error('Error loading promoter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareCode = async () => {
    if (!promoter) return;

    const message = `🎓 Prepara-te para o exame de admissão com o SimulaPass!\n\nUsa o meu código de referral: ${promoter.referralCode}\n\nBaixa a app e começa a praticar agora!\n\n✅ Simulações ilimitadas\n✅ Questões atualizadas\n✅ Desconto exclusivo`;

    try {
      await Share.share({
        message,
        title: 'Código Referral SimulaPass',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleUpdatePaymentData = async () => {
    if (!promoter) return;

    try {
      await referralService.updatePromoter(promoter.id, {
        paymentData: {
          mpesaNumber,
          bankAccount,
          bankName,
        },
      });

      Alert.alert('Sucesso', 'Dados de pagamento atualizados!');
      setShowPaymentModal(false);
      loadPromoterData();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados de pagamento');
    }
  };

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'paid': return '#3b82f6';
      case 'fraud': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getLeadStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'paid': return 'Pago';
      case 'fraud': return 'Fraude';
      default: return 'Pendente';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!promoter) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Card style={styles.emptyCard}>
          <Card.Content style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📣</Text>
            <Text variant="titleLarge" style={{ fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
              Não és Promotor
            </Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280', textAlign: 'center' }}>
              Contacta o administrador para te tornares um promotor.
            </Text>
          </Card.Content>
        </Card>
        <Button
          mode="outlined"
          onPress={() => logout()}
          style={{ marginTop: 16, borderColor: '#ef4444' }}
          labelStyle={{ color: '#ef4444', fontWeight: '600' }}
        >
          🚪 Terminar Sessão
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header estilo Yango */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.profilePhoto, { backgroundColor: colors.secondary }]}>
            <Text style={styles.profileInitial}>
              {promoter.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{promoter.name}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{promoter.email}</Text>
            <View style={[styles.statusBadge, { backgroundColor: promoter.status === 'active' ? colors.successLight : colors.warningLight }]}>
              <Text style={[styles.statusText, { color: promoter.status === 'active' ? colors.success : colors.warning }]}>
                {promoter.status === 'active' ? '✅ Ativo' : '⚠️ Inativo'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Referral Code Card */}
      <Card style={[styles.referralCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.referralCardContent}>
          <Text style={[styles.referralTitle, { color: colors.textPrimary }]}>🎯 Meu Código Referral</Text>
          <View style={[styles.codeContainer, { backgroundColor: colors.grayLight }]}>
            <Text style={[styles.referralCode, { color: colors.textPrimary }]}>{promoter.referralCode}</Text>
          </View>
          <Button
            mode="contained"
            onPress={handleShareCode}
            style={styles.shareButton}
            icon="share-variant"
          >
            Partilhar Código
          </Button>
        </Card.Content>
      </Card>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={styles.statValue}>{promoter.totalLeads}</Text>
            <Text style={styles.statLabel}>Total Leads</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={styles.statValue}>{promoter.activeLeads}</Text>
            <Text style={styles.statLabel}>Leads Ativos</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={styles.statValue}>{promoter.pendingCommission} MZN</Text>
            <Text style={styles.statLabel}>Pendente</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={styles.statValue}>{promoter.paidCommission} MZN</Text>
            <Text style={styles.statLabel}>Recebido</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Payment Data Card */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              💳 Dados de Pagamento
            </Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(true)}>
              <Text style={{ color: '#E6B21F', fontWeight: '600' }}>Editar</Text>
            </TouchableOpacity>
          </View>
          {promoter.paymentData?.mpesaNumber ? (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>M-Pesa:</Text>
              <Text style={styles.paymentValue}>{promoter.paymentData.mpesaNumber}</Text>
            </View>
          ) : null}
          {promoter.paymentData?.bankAccount ? (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Conta:</Text>
              <Text style={styles.paymentValue}>{promoter.paymentData.bankAccount}</Text>
            </View>
          ) : null}
          {promoter.paymentData?.bankName ? (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Banco:</Text>
              <Text style={styles.paymentValue}>{promoter.paymentData.bankName}</Text>
            </View>
          ) : null}
          {!promoter.paymentData?.mpesaNumber && !promoter.paymentData?.bankAccount ? (
            <Text style={{ color: '#9ca3af', textAlign: 'center', paddingVertical: 16 }}>
              Sem dados de pagamento
            </Text>
          ) : null}
        </Card.Content>
      </Card>

      {/* Leads List */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 16 }}>
            📋 Meus Leads
          </Text>
          {leads.length === 0 ? (
            <Text style={{ color: '#9ca3af', textAlign: 'center', paddingVertical: 16 }}>
              Ainda não tens leads
            </Text>
          ) : (
            leads.map((lead) => (
              <View key={lead.id} style={styles.leadItem}>
                <View style={styles.leadInfo}>
                  <Text style={styles.leadName}>{lead.userName}</Text>
                  <Text style={styles.leadEmail}>{lead.userEmail}</Text>
                  <Text style={styles.leadDate}>
                    {new Date(lead.activationDate).toLocaleDateString('pt-PT')}
                  </Text>
                </View>
                <View style={styles.leadStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getLeadStatusColor(lead.status) }]} />
                  <Text style={[styles.statusText, { color: getLeadStatusColor(lead.status) }]}>
                    {getLeadStatusLabel(lead.status)}
                  </Text>
                  <Text style={styles.commissionText}>{lead.commissionAmount} MZN</Text>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Logout */}
      <Button
        mode="outlined"
        onPress={() => logout()}
        style={{ marginTop: 16, marginBottom: 32, borderColor: '#ef4444' }}
        labelStyle={{ color: '#ef4444', fontWeight: '600' }}
      >
        🚪 Terminar Sessão
      </Button>

      {/* Payment Data Modal */}
      <Portal>
        <Modal
          visible={showPaymentModal}
          onDismiss={() => setShowPaymentModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={{ fontWeight: '800', marginBottom: 20 }}>
            Editar Dados de Pagamento
          </Text>
          <TextInput
            label="Número M-Pesa"
            value={mpesaNumber}
            onChangeText={setMpesaNumber}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Conta Bancária"
            value={bankAccount}
            onChangeText={setBankAccount}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Nome do Banco"
            value={bankName}
            onChangeText={setBankName}
            mode="outlined"
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowPaymentModal(false)}
              style={{ flex: 1, marginRight: 8 }}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdatePaymentData}
              style={{ flex: 1 }}
            >
              Salvar
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCard: { backgroundColor: colors.white, borderRadius: borderRadius.xl, elevation: 0, borderWidth: 1, borderColor: colors.borderLight },
  
  // Header estilo Yango
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profilePhoto: { width: 60, height: 60, borderRadius: borderRadius.round, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 24, fontWeight: '700', color: colors.info },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 13, fontWeight: '400', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.md, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: '600' },
  
  // Referral Card
  referralCard: { marginBottom: spacing.lg },
  referralCardContent: { padding: spacing.lg },
  referralTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md },
  codeContainer: { padding: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center', marginBottom: spacing.md },
  referralCode: { fontSize: 24, fontWeight: '700', letterSpacing: 4, fontFamily: 'monospace' },
  shareButton: { backgroundColor: colors.primary },
  
  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.xl, elevation: 0, borderWidth: 1, borderColor: colors.borderLight, padding: spacing.md },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  
  // Section Card
  sectionCard: { backgroundColor: colors.white, borderRadius: borderRadius.xl, elevation: 0, borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.lg, padding: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  paymentLabel: { color: colors.textSecondary, fontSize: 14 },
  paymentValue: { fontWeight: '600', color: colors.textPrimary },
  
  // Lead Item
  leadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leadInfo: { flex: 1 },
  leadName: { fontWeight: '700', color: colors.textPrimary, fontSize: 14 },
  leadEmail: { color: colors.textSecondary, fontSize: 12 },
  leadDate: { color: colors.textTertiary, fontSize: 11 },
  leadStatus: { alignItems: 'flex-end' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  commissionText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  
  // Modal
  modal: { backgroundColor: colors.white, margin: spacing.lg, borderRadius: borderRadius.xl, padding: spacing.lg },
  input: { marginBottom: spacing.md },
  modalButtons: { flexDirection: 'row', marginTop: spacing.md },
});
