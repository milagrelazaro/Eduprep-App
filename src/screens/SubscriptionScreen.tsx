import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Portal, Modal, TextInput, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { paymentService } from '../services/paymentService';
import { SubscriptionPlan, PaymentMethod, AccessLevel } from '../types';
import { ACCESS_PACKAGES, AccessPackage } from '../data/accessPackages';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SubscriptionScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel>('course');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!user?.id) return;
    try {
      const isActive = await paymentService.hasActiveSubscription(user.id);
      setHasActiveSubscription(isActive);
      
      if (isActive) {
        const subscription = await paymentService.getUserSubscription(user.id);
        setCurrentSubscription(subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Precisas de estar logado para subscrever');
      return;
    }

    if (selectedMethod === 'mpesa' || selectedMethod === 'emola') {
      if (!phoneNumber || phoneNumber.length < 9) {
        Alert.alert('Erro', 'Por favor, insere um número de telefone válido');
        return;
      }
    }

    if (selectedMethod === 'card') {
      if (!receiptNumber) {
        Alert.alert('Erro', 'Por favor, insere o número do recibo');
        return;
      }
    }

    try {
      setLoading(true);
      const plan = paymentService.pricingPlans.find(p => p.id === selectedPlan);
      
      if (!plan) {
        Alert.alert('Erro', 'Plano inválido');
        return;
      }

      if (selectedMethod === 'mpesa') {
        await paymentService.processMpesaPayment(user.id, phoneNumber, plan.price, selectedPlan);
        Alert.alert('Sucesso', 'Pagamento M-Pesa iniciado! Verifica o teu telefone para confirmar.');
      } else if (selectedMethod === 'emola') {
        await paymentService.processEmolaPayment(user.id, phoneNumber, plan.price, selectedPlan);
        Alert.alert('Sucesso', 'Pagamento eMola iniciado! Verifica o teu telefone para confirmar.');
      } else if (selectedMethod === 'card') {
        await paymentService.processCashPayment(user.id, plan.price, selectedPlan, receiptNumber);
        Alert.alert('Sucesso', 'Pagamento registado! Aguarda verificação do administrador.');
      }

      // Guardar accessLevel no perfil do utilizador
      const { updateUser } = useAuthStore.getState();
      await updateUser({ accessLevel: selectedAccessLevel });

      setShowPaymentModal(false);
      setPhoneNumber('');
      setReceiptNumber('');
      checkSubscription();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar o pagamento');
    } finally {
      setLoading(false);
    }
  };

  const PlanCard = ({ plan }: { plan: any }) => {
    const isSelected = selectedPlan === plan.id;
    const isPopular = plan.popular;

    return (
      <TouchableOpacity
        onPress={() => setSelectedPlan(plan.id as SubscriptionPlan)}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          isPopular && styles.popularPlanCard,
        ]}
      >
        {isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Mais Popular</Text>
          </View>
        )}
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planPrice}>{plan.price} MZN</Text>
        <Text style={styles.planDuration}>{plan.duration}</Text>
        {plan.savings && (
          <Text style={styles.planSavings}>{plan.savings}</Text>
        )}
        <View style={styles.planFeatures}>
          {plan.features.map((feature: string, index: number) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  if (hasActiveSubscription && currentSubscription) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
          <View style={styles.headerContent}><Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Subscrição Ativa</Text></View>
        </View>

        <Card style={styles.activeCard}>
          <Card.Content>
            <View style={styles.activeHeader}>
              <Text style={{ fontSize: 48 }}>🎉</Text>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ fontWeight: '800', fontSize: 20, color: '#111827' }}>
                  Plano {currentSubscription.plan === 'monthly' ? 'Mensal' : currentSubscription.plan === 'yearly' ? 'Anual' : 'Vitalício'}
                </Text>
                <Text style={{ color: '#6b7280', marginTop: 4 }}>
                  {currentSubscription.plan === 'lifetime' 
                    ? 'Acesso vitalício' 
                    : `Expira em ${currentSubscription.expiresAt?.toLocaleDateString('pt-PT') || 'N/A'}`
                  }
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={{ fontWeight: '700', fontSize: 16, color: '#111827', marginBottom: 12 }}>
              Benefícios Ativos
            </Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Acesso ilimitado a simulados</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Questões explicadas</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Histórico completo</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Suporte prioritário</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Escolhe o Teu Plano
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Desbloqueia todo o potencial do EduPrep
          </Text>
        </View>
      </View>

      {/* Pacotes de Acesso */}
      <Card style={[styles.methodCard, { marginBottom: spacing.lg }]}>
        <Card.Content>
          <Text style={{ fontWeight: '700', fontSize: 16, color: '#111827', marginBottom: 4 }}>
            Escolhe o teu Pacote de Acesso
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
            Define o nível de conteúdo a que terás acesso
          </Text>

          {ACCESS_PACKAGES.map((pkg) => {
            const isSelected = selectedAccessLevel === pkg.accessLevel;
            return (
              <TouchableOpacity
                key={pkg.id}
                onPress={() => setSelectedAccessLevel(pkg.accessLevel)}
                style={[
                  styles.planCard,
                  isSelected && styles.selectedPlanCard,
                  pkg.popular && styles.popularPlanCard,
                  { marginBottom: spacing.sm },
                ]}
              >
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>Recomendado</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.planName}>{pkg.name}</Text>
                  <Text style={styles.planPrice}>{pkg.price} MZN</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{pkg.description}</Text>
                <View style={styles.planFeatures}>
                  {pkg.features.slice(0, 3).map((feature: string, index: number) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.featureBullet}>✓</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card.Content>
      </Card>

      {/* Planos de Duração */}
      <Text style={{ fontWeight: '700', fontSize: 16, color: '#111827', marginBottom: 12, marginTop: spacing.sm }}>
        Duração da Subscrição
      </Text>
      <View style={styles.plansContainer}>
        {paymentService.pricingPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </View>

      <Card style={styles.methodCard}>
        <Card.Content>
          <Text style={{ fontWeight: '700', fontSize: 16, color: '#111827', marginBottom: 16 }}>
            Método de Pagamento
          </Text>

          <RadioButton.Group onValueChange={(value) => setSelectedMethod(value as PaymentMethod)} value={selectedMethod}>
            <View style={styles.methodItem}>
              <RadioButton value="mpesa" />
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>M-Pesa</Text>
                <Text style={styles.methodDesc}>Pagamento instantâneo via M-Pesa</Text>
              </View>
            </View>

            <View style={styles.methodItem}>
              <RadioButton value="emola" />
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>eMola</Text>
                <Text style={styles.methodDesc}>Pagamento via eMola</Text>
              </View>
            </View>

            <View style={styles.methodItem}>
              <RadioButton value="card" />
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>Numerário</Text>
                <Text style={styles.methodDesc}>Pagamento em dinheiro (verificação manual)</Text>
              </View>
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => setShowPaymentModal(true)}
        style={styles.subscribeButton}
        contentStyle={styles.subscribeButtonContent}
        disabled={loading}
      >
        {loading ? 'Processando...' : 'Subscrever Agora'}
      </Button>

      <Portal>
        <Modal
          visible={showPaymentModal}
          onDismiss={() => setShowPaymentModal(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.white, borderRadius: borderRadius.xl }]}
        >
          <Card style={{ backgroundColor: colors.transparent }}>
            <Card.Content style={styles.cardContent}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Confirmar Pagamento
              </Text>

              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                Plano: {paymentService.pricingPlans.find(p => p.id === selectedPlan)?.name}
              </Text>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                Valor: {paymentService.pricingPlans.find(p => p.id === selectedPlan)?.price} MZN
              </Text>

              {(selectedMethod === 'mpesa' || selectedMethod === 'emola') && (
                <TextInput
                  mode="outlined"
                  label="Número de Telefone"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  style={{ marginBottom: spacing.md }}
                  placeholder="+258 84 XXX XXXX"
                />
              )}

              {selectedMethod === 'card' && (
                <TextInput
                  mode="outlined"
                  label="Número do Recibo"
                  value={receiptNumber}
                  onChangeText={setReceiptNumber}
                  style={{ marginBottom: spacing.md }}
                  placeholder="REC-XXXXX"
                />
              )}

              <Button
                mode="contained"
                onPress={handleSubscribe}
                style={[styles.modalButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md, marginBottom: spacing.sm }]}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowPaymentModal(false)}
                style={{ borderColor: colors.borderLight }}
                textColor={colors.textSecondary}
              >
                Cancelar
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  headerSubtitle: { fontSize: 12, fontWeight: '400' },
  cardContent: { padding: spacing.md },
  plansContainer: { flexDirection: 'column', gap: spacing.md, marginBottom: spacing.xl },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  selectedPlanCard: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  popularPlanCard: {
    borderColor: colors.warning,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  popularBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  planName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  planPrice: { fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: spacing.sm },
  planDuration: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  planSavings: { fontSize: 12, color: colors.success, fontWeight: '600', marginTop: spacing.xs },
  planFeatures: { marginTop: spacing.md },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  featureBullet: { fontSize: 16, marginRight: spacing.sm, color: colors.success },
  featureText: { fontSize: 13, color: colors.textPrimary },
  methodCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.borderLight },
  methodItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  methodInfo: { marginLeft: spacing.sm, flex: 1 },
  methodName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  methodDesc: { fontSize: 12, color: colors.textSecondary },
  subscribeButton: { backgroundColor: colors.primary, borderRadius: borderRadius.md },
  subscribeButtonContent: { paddingVertical: spacing.sm },
  modalContainer: { padding: spacing.lg, margin: spacing.lg },
  modalTitle: { fontWeight: '700', fontSize: 20, marginBottom: spacing.md },
  modalText: { fontSize: 14, marginBottom: spacing.md },
  modalButton: {},
  activeCard: { backgroundColor: colors.successLight, borderRadius: borderRadius.xl, marginBottom: spacing.xl },
  activeHeader: { flexDirection: 'row', alignItems: 'center' },
  infoCard: { backgroundColor: colors.white, borderRadius: borderRadius.xl },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  benefitIcon: { fontSize: 18, marginRight: spacing.md, color: colors.success },
  benefitText: { fontSize: 15, color: colors.textPrimary },
});
