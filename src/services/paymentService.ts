import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Payment, Subscription, SubscriptionPlan, PaymentMethod } from '../types';

const PAYMENTS_COLLECTION = 'payments';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

export const paymentService = {
  // Pricing plans
  pricingPlans: [
    {
      id: 'monthly',
      name: 'Mensal',
      price: 500,
      duration: '1 mês',
      features: [
        'Acesso ilimitado a simulados',
        'Questões explicadas',
        'Histórico completo',
        'Suporte por email',
      ],
      popular: false,
    },
    {
      id: 'yearly',
      name: 'Anual',
      price: 4000,
      duration: '12 meses',
      features: [
        'Tudo do plano mensal',
        '33% de desconto',
        'Prioridade no suporte',
        'Acesso antecipado a novos recursos',
      ],
      popular: true,
      savings: 'Economiza 2000 MZN',
    },
    {
      id: 'lifetime',
      name: 'Vitalício',
      price: 15000,
      duration: 'Para sempre',
      features: [
        'Acesso vitalício completo',
        'Tudo do plano anual',
        'Suporte prioritário 24/7',
        'Acesso a tutorias exclusivas',
      ],
      popular: false,
    },
  ],

  // Create payment
  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'completedAt'>) {
    try {
      const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
        ...paymentData,
        createdAt: serverTimestamp(),
        completedAt: null,
      });
      return { id: docRef.id, ...paymentData };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Process M-Pesa payment
  async processMpesaPayment(
    userId: string,
    phoneNumber: string,
    amount: number,
    plan: SubscriptionPlan
  ) {
    try {
      // In production, integrate with M-Pesa API
      // For now, simulate payment processing
      const transactionId = 'MPESA-' + Date.now();
      
      const payment = await this.createPayment({
        userId,
        type: 'subscription',
        amount,
        method: 'mpesa',
        status: 'processing',
        transactionId,
        phoneNumber,
        reference: plan,
      });

      // Simulate payment completion after 2 seconds
      setTimeout(async () => {
        await this.completePayment(payment.id, transactionId);
        await this.createSubscription(userId, plan, 'mpesa', amount, transactionId);
      }, 2000);

      return payment;
    } catch (error) {
      console.error('Error processing M-Pesa payment:', error);
      throw error;
    }
  },

  // Process eMola payment
  async processEmolaPayment(
    userId: string,
    phoneNumber: string,
    amount: number,
    plan: SubscriptionPlan
  ) {
    try {
      // In production, integrate with eMola API
      const transactionId = 'EMOLA-' + Date.now();
      
      const payment = await this.createPayment({
        userId,
        type: 'subscription',
        amount,
        method: 'emola',
        status: 'processing',
        transactionId,
        phoneNumber,
        reference: plan,
      });

      // Simulate payment completion
      setTimeout(async () => {
        await this.completePayment(payment.id, transactionId);
        await this.createSubscription(userId, plan, 'emola', amount, transactionId);
      }, 2000);

      return payment;
    } catch (error) {
      console.error('Error processing eMola payment:', error);
      throw error;
    }
  },

  // Process cash payment (numerário)
  async processCashPayment(
    userId: string,
    amount: number,
    plan: SubscriptionPlan,
    receiptNumber?: string
  ) {
    try {
      const transactionId = 'CASH-' + Date.now();
      
      const payment = await this.createPayment({
        userId,
        type: 'subscription',
        amount,
        method: 'card', // Using 'card' as generic for cash
        status: 'pending',
        transactionId,
        reference: plan,
      });

      // Cash payments need manual verification
      // Admin will need to verify and complete the payment
      return payment;
    } catch (error) {
      console.error('Error processing cash payment:', error);
      throw error;
    }
  },

  // Complete payment
  async completePayment(paymentId: string, transactionId: string) {
    try {
      const docRef = doc(db, PAYMENTS_COLLECTION, paymentId);
      await updateDoc(docRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error completing payment:', error);
      throw error;
    }
  },

  // Create subscription
  async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    paymentMethod: PaymentMethod,
    amount: number,
    transactionId: string
  ) {
    try {
      const now = new Date();
      let expiresAt: Date | undefined;

      if (plan === 'monthly') {
        expiresAt = new Date(now.setMonth(now.getMonth() + 1));
      } else if (plan === 'yearly') {
        expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
      }
      // lifetime has no expiration

      const docRef = await addDoc(collection(db, SUBSCRIPTIONS_COLLECTION), {
        userId,
        plan,
        status: 'active',
        startDate: serverTimestamp(),
        expiresAt: expiresAt ? serverTimestamp() : null,
        price: amount,
        paymentMethod,
        transactionId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { id: docRef.id, userId, plan, expiresAt };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Get user subscription
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const q = query(
        collection(db, SUBSCRIPTIONS_COLLECTION),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Subscription;
      }
      return null;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  },

  // Get user payment history
  async getUserPayments(userId: string): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, PAYMENTS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Payment;
      });
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw error;
    }
  },

  // Get all payments (for admin)
  async getAllPayments(): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, PAYMENTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Payment;
      });
    } catch (error) {
      console.error('Error getting all payments:', error);
      throw error;
    }
  },

  // Verify pending cash payment (admin only)
  async verifyCashPayment(paymentId: string) {
    try {
      const docRef = doc(db, PAYMENTS_COLLECTION, paymentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        await this.completePayment(paymentId, data.transactionId);
        
        if (data.reference) {
          await this.createSubscription(
            data.userId,
            data.reference as SubscriptionPlan,
            'card',
            data.amount,
            data.transactionId
          );
        }
      }
    } catch (error) {
      console.error('Error verifying cash payment:', error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    try {
      const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;
      
      if (subscription.plan === 'lifetime') return true;
      
      if (subscription.expiresAt) {
        const now = new Date();
        return now < subscription.expiresAt;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  },
};

export default paymentService;
