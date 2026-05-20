import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Subscription, Payment, SubscriptionPlan, PaymentMethod } from '../types';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const PAYMENTS_COLLECTION = 'payments';
const USERS_COLLECTION = 'users';

// ==================== PRICING ====================
export const PRICING = {
  monthly: {
    id: 'monthly' as SubscriptionPlan,
    name: 'Premium Mensal',
    price: 500,
    duration: '1 mês',
    features: [
      'Acesso completo a todos os exames',
      'Aulas online ilimitadas',
      'Simulados completos (20+ questões)',
      'Estatísticas avançadas',
      'Suporte prioritário',
    ],
  },
  yearly: {
    id: 'yearly' as SubscriptionPlan,
    name: 'Premium Anual',
    price: 4800,
    duration: '12 meses',
    features: [
      'Todos os benefícios do mensal',
      'Economize 1.200 MT (20%)',
      'Certificados de conclusão',
      'Conteúdo exclusivo',
      'Suporte prioritário',
    ],
    popular: true,
    savings: 'Economize 20%',
  },
  lifetime: {
    id: 'lifetime' as SubscriptionPlan,
    name: 'Premium Vitalício',
    price: 15000,
    duration: 'Para sempre',
    features: [
      'Acesso permanente',
      'Todos os benefícios premium',
      'Atualizações futuras grátis',
      'Suporte VIP',
      'Melhor custo-benefício',
    ],
    savings: 'Melhor valor!',
  },
};

// ==================== SUBSCRIPTION SERVICE ====================
export const subscriptionService = {
  /**
   * Criar nova assinatura
   */
  async createSubscription(data: {
    userId: string;
    plan: SubscriptionPlan;
    paymentMethod: PaymentMethod;
    phoneNumber?: string;
  }): Promise<string> {
    const pricing = PRICING[data.plan];
    const now = new Date();
    
    // Calcular data de expiração
    let expiresAt: Date | undefined;
    if (data.plan === 'monthly') {
      expiresAt = new Date(now.setMonth(now.getMonth() + 1));
    } else if (data.plan === 'yearly') {
      expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
    }
    // lifetime não tem expiração
    
    const subscription = {
      userId: data.userId,
      plan: data.plan,
      status: 'pending',
      startDate: serverTimestamp(),
      expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
      price: pricing.price,
      paymentMethod: data.paymentMethod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, SUBSCRIPTIONS_COLLECTION), subscription);
    return docRef.id;
  },

  /**
   * Ativar assinatura após pagamento confirmado
   */
  async activateSubscription(subscriptionId: string, transactionId: string): Promise<void> {
    const subscriptionRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      throw new Error('Assinatura não encontrada');
    }
    
    const subscriptionData = subscriptionDoc.data();
    
    // Atualizar assinatura
    await updateDoc(subscriptionRef, {
      status: 'active',
      transactionId,
      updatedAt: serverTimestamp(),
    });
    
    // Atualizar usuário
    const userRef = doc(db, USERS_COLLECTION, subscriptionData.userId);
    await updateDoc(userRef, {
      isPremium: true,
      premiumExpiresAt: subscriptionData.expiresAt,
      subscriptionType: subscriptionData.plan,
      subscriptionId,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscriptionRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
    await updateDoc(subscriptionRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Buscar assinatura do usuário
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const q = query(
      collection(db, SUBSCRIPTIONS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Subscription;
  },
};

// ==================== PAYMENT SERVICE ====================
export const paymentService = {
  /**
   * Criar pagamento
   */
  async createPayment(data: {
    userId: string;
    type: 'subscription' | 'lesson';
    subscriptionId?: string;
    lessonId?: string;
    amount: number;
    method: PaymentMethod;
    phoneNumber?: string;
  }): Promise<string> {
    const payment = {
      userId: data.userId,
      type: data.type,
      subscriptionId: data.subscriptionId,
      lessonId: data.lessonId,
      amount: data.amount,
      method: data.method,
      status: 'pending',
      phoneNumber: data.phoneNumber,
      reference: `EDUPREP-${Date.now()}`,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), payment);
    return docRef.id;
  },

  /**
   * Processar pagamento (SIMULADO - Substituir por API real)
   */
  async processPayment(paymentId: string, phoneNumber: string): Promise<{
    success: boolean;
    transactionId?: string;
    message: string;
  }> {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (!paymentDoc.exists()) {
      return { success: false, message: 'Pagamento não encontrado' };
    }
    
    const paymentData = paymentDoc.data();
    
    // ⚠️ SIMULAÇÃO - Substituir por chamada real à API
    // TODO: Integrar com M-Pesa, E-Mola ou Gateway de cartão
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular sucesso (em produção, verificar resposta da API)
    const transactionId = `TXN-${Date.now()}`;
    
    // Atualizar pagamento
    await updateDoc(paymentRef, {
      status: 'completed',
      transactionId,
      completedAt: serverTimestamp(),
    });
    
    // Se for assinatura, ativar
    if (paymentData.type === 'subscription' && paymentData.subscriptionId) {
      await subscriptionService.activateSubscription(
        paymentData.subscriptionId,
        transactionId
      );
    }
    
    return {
      success: true,
      transactionId,
      message: 'Pagamento processado com sucesso!',
    };
  },

  /**
   * Buscar histórico de pagamentos do usuário
   */
  async getUserPayments(userId: string): Promise<Payment[]> {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Payment[];
  },
};

// ==================== PAYMENT INTEGRATION (Para APIs reais) ====================

/**
 * 🔌 INTEGRAÇÃO M-PESA
 * Substitua esta função pela integração real
 */
export const mpesaIntegration = {
  async initiatePayment(phoneNumber: string, amount: number, reference: string) {
    // TODO: Adicionar API Key e Secret
    const API_KEY = process.env.MPESA_API_KEY || 'YOUR_MPESA_API_KEY';
    const API_SECRET = process.env.MPESA_API_SECRET || 'YOUR_MPESA_SECRET';
    
    // TODO: Implementar chamada real à API M-Pesa
    // const response = await fetch('https://api.mpesa.vm.co.mz/...', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     phoneNumber,
    //     amount,
    //     reference,
    //   }),
    // });
    
    console.log('M-Pesa Integration - Simulado');
    return { success: true, transactionId: `MPESA-${Date.now()}` };
  },
};

/**
 * 🔌 INTEGRAÇÃO E-MOLA
 * Substitua esta função pela integração real
 */
export const emolaIntegration = {
  async initiatePayment(phoneNumber: string, amount: number, reference: string) {
    // TODO: Adicionar API Key
    const API_KEY = process.env.EMOLA_API_KEY || 'YOUR_EMOLA_API_KEY';
    
    // TODO: Implementar chamada real à API E-Mola
    console.log('E-Mola Integration - Simulado');
    return { success: true, transactionId: `EMOLA-${Date.now()}` };
  },
};

/**
 * 🔌 INTEGRAÇÃO CARTÃO
 * Substitua esta função pela integração real (PayGate, DPO, etc)
 */
export const cardIntegration = {
  async initiatePayment(cardData: any, amount: number, reference: string) {
    // TODO: Adicionar credenciais do gateway
    const MERCHANT_ID = process.env.PAYGATE_MERCHANT_ID || 'YOUR_MERCHANT_ID';
    const MERCHANT_KEY = process.env.PAYGATE_MERCHANT_KEY || 'YOUR_MERCHANT_KEY';
    
    // TODO: Implementar chamada real ao gateway
    console.log('Card Gateway Integration - Simulado');
    return { success: true, transactionId: `CARD-${Date.now()}` };
  },
};
