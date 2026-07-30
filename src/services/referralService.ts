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
import { 
  Promoter, 
  ReferralLead, 
  ReferralValidation, 
  DeviceFingerprint, 
  FraudAlert,
  PromoCode 
} from '../types';

const PROMOTERS_COLLECTION = 'promoters';
const REFERRAL_LEADS_COLLECTION = 'referralLeads';
const DEVICE_FINGERPRINTS_COLLECTION = 'deviceFingerprints';
const FRAUD_ALERTS_COLLECTION = 'fraudAlerts';
const PROMO_CODES_COLLECTION = 'promoCodes';

export const referralService = {
  // Generate unique referral code
  generateReferralCode(name: string): string {
    const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${cleanName}-${randomSuffix}`;
  },

  // Create promoter
  async createPromoter(promoterData: Omit<Promoter, 'id' | 'referralCode' | 'totalLeads' | 'activeLeads' | 'pendingCommission' | 'paidCommission' | 'createdAt' | 'updatedAt'>) {
    try {
      const referralCode = this.generateReferralCode(promoterData.name);
      
      const docRef = await addDoc(collection(db, PROMOTERS_COLLECTION), {
        ...promoterData,
        referralCode,
        totalLeads: 0,
        activeLeads: 0,
        pendingCommission: 0,
        paidCommission: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return { id: docRef.id, referralCode, ...promoterData };
    } catch (error) {
      console.error('Error creating promoter:', error);
      throw error;
    }
  },

  // Get promoter by user ID
  async getPromoterByUserId(userId: string): Promise<Promoter | null> {
    try {
      const q = query(
        collection(db, PROMOTERS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Promoter;
      }
      return null;
    } catch (error) {
      console.error('Error getting promoter:', error);
      throw error;
    }
  },

  // Get promoter by referral code
  async getPromoterByCode(referralCode: string): Promise<Promoter | null> {
    try {
      const q = query(
        collection(db, PROMOTERS_COLLECTION),
        where('referralCode', '==', referralCode),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Promoter;
      }
      return null;
    } catch (error) {
      console.error('Error getting promoter by code:', error);
      throw error;
    }
  },

  // Validate referral code with anti-fraud checks
  async validateReferralCode(
    referralCode: string,
    userId: string,
    userEmail: string,
    userPhone: string,
    deviceFingerprint: DeviceFingerprint
  ): Promise<ReferralValidation> {
    try {
      // Check if referral code exists and is active
      const promoter = await this.getPromoterByCode(referralCode);
      if (!promoter) {
        return { isValid: false, reason: 'Código de referral inválido ou inativo' };
      }

      // Check for duplicate IMEI
      const imeiQuery = query(
        collection(db, REFERRAL_LEADS_COLLECTION),
        where('imei', '==', deviceFingerprint.imei)
      );
      const imeiSnapshot = await getDocs(imeiQuery);
      if (!imeiSnapshot.empty) {
        const existingLead = imeiSnapshot.docs[0].data() as ReferralLead;
        return { 
          isValid: false, 
          reason: 'Este dispositivo já foi usado para ativar um código referral',
          existingLead: existingLead
        };
      }

      // Check for duplicate email
      const emailQuery = query(
        collection(db, REFERRAL_LEADS_COLLECTION),
        where('userEmail', '==', userEmail.toLowerCase())
      );
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        const existingLead = emailSnapshot.docs[0].data() as ReferralLead;
        return { 
          isValid: false, 
          reason: 'Este email já foi usado para ativar um código referral',
          existingLead: existingLead
        };
      }

      // Check for duplicate phone
      const phoneQuery = query(
        collection(db, REFERRAL_LEADS_COLLECTION),
        where('userPhone', '==', userPhone)
      );
      const phoneSnapshot = await getDocs(phoneQuery);
      if (!phoneSnapshot.empty) {
        const existingLead = phoneSnapshot.docs[0].data() as ReferralLead;
        return { 
          isValid: false, 
          reason: 'Este número de telefone já foi usado para ativar um código referral',
          existingLead: existingLead
        };
      }

      // Check for device fingerprint similarity (anti-fraud)
      const fingerprintQuery = query(
        collection(db, DEVICE_FINGERPRINTS_COLLECTION),
        where('platform', '==', deviceFingerprint.platform),
        where('osVersion', '==', deviceFingerprint.osVersion),
        where('screenWidth', '==', deviceFingerprint.screenWidth),
        where('screenHeight', '==', deviceFingerprint.screenHeight)
      );
      const fingerprintSnapshot = await getDocs(fingerprintQuery);
      
      if (!fingerprintSnapshot.empty) {
        // Log suspicious activity but don't block yet
        await this.createFraudAlert({
          type: 'suspicious_activity',
          userId,
          promoterId: promoter.id,
          description: 'Device fingerprint similar to existing device',
          severity: 'medium',
        });
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating referral code:', error);
      throw error;
    }
  },

  // Activate referral code
  async activateReferralCode(
    referralCode: string,
    userId: string,
    userName: string,
    userEmail: string,
    userPhone: string,
    deviceFingerprint: DeviceFingerprint
  ): Promise<ReferralLead> {
    try {
      // Validate first
      const validation = await this.validateReferralCode(
        referralCode,
        userId,
        userEmail,
        userPhone,
        deviceFingerprint
      );

      if (!validation.isValid) {
        throw new Error(validation.reason);
      }

      const promoter = await this.getPromoterByCode(referralCode);
      if (!promoter) {
        throw new Error('Promotor não encontrado');
      }

      // Calculate commission (example: 10% of subscription price)
      const commissionAmount = 100; // Fixed amount for now, can be dynamic

      // Create referral lead
      const docRef = await addDoc(collection(db, REFERRAL_LEADS_COLLECTION), {
        promoterId: promoter.id,
        userId,
        userName,
        userEmail: userEmail.toLowerCase(),
        userPhone,
        imei: deviceFingerprint.imei,
        deviceFingerprint: JSON.stringify(deviceFingerprint),
        activationDate: serverTimestamp(),
        status: 'confirmed',
        commissionAmount,
      });

      // Store device fingerprint
      await addDoc(collection(db, DEVICE_FINGERPRINTS_COLLECTION), {
        ...deviceFingerprint,
        userId,
        createdAt: serverTimestamp(),
      });

      // Update promoter stats
      await updateDoc(doc(db, PROMOTERS_COLLECTION, promoter.id), {
        totalLeads: promoter.totalLeads + 1,
        activeLeads: promoter.activeLeads + 1,
        pendingCommission: promoter.pendingCommission + commissionAmount,
        updatedAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        promoterId: promoter.id,
        userId,
        userName,
        userEmail,
        userPhone,
        imei: deviceFingerprint.imei,
        deviceFingerprint: JSON.stringify(deviceFingerprint),
        activationDate: new Date(),
        status: 'confirmed',
        commissionAmount,
      };
    } catch (error) {
      console.error('Error activating referral code:', error);
      throw error;
    }
  },

  // Get leads for promoter
  async getPromoterLeads(promoterId: string): Promise<ReferralLead[]> {
    try {
      const q = query(
        collection(db, REFERRAL_LEADS_COLLECTION),
        where('promoterId', '==', promoterId)
      );
      const querySnapshot = await getDocs(q);
      
      const leads = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          activationDate: data.activationDate?.toDate() || new Date(),
          paymentDate: data.paymentDate?.toDate(),
        } as ReferralLead;
      });
      
      // Sort manually to avoid Firebase index requirement
      return leads.sort((a, b) => b.activationDate.getTime() - a.activationDate.getTime());
    } catch (error) {
      console.error('Error getting promoter leads:', error);
      throw error;
    }
  },

  // Get all promoters (for admin)
  async getAllPromoters(): Promise<Promoter[]> {
    try {
      const q = query(
        collection(db, PROMOTERS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Promoter;
      });
    } catch (error) {
      console.error('Error getting all promoters:', error);
      throw error;
    }
  },

  // Update promoter
  async updatePromoter(promoterId: string, updates: Partial<Promoter>) {
    try {
      const docRef = doc(db, PROMOTERS_COLLECTION, promoterId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating promoter:', error);
      throw error;
    }
  },

  // Mark lead as paid
  async markLeadAsPaid(leadId: string, promoterId: string, commissionAmount: number) {
    try {
      const promoter = await this.getPromoterByUserId(promoterId);
      if (!promoter) throw new Error('Promotor não encontrado');

      await updateDoc(doc(db, REFERRAL_LEADS_COLLECTION, leadId), {
        status: 'paid',
        paymentDate: serverTimestamp(),
      });

      await updateDoc(doc(db, PROMOTERS_COLLECTION, promoter.id), {
        pendingCommission: Math.max(0, promoter.pendingCommission - commissionAmount),
        paidCommission: promoter.paidCommission + commissionAmount,
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error('Error marking lead as paid:', error);
      throw error;
    }
  },

  // Create fraud alert
  async createFraudAlert(alertData: Omit<FraudAlert, 'id' | 'resolved' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, FRAUD_ALERTS_COLLECTION), {
        ...alertData,
        resolved: false,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...alertData };
    } catch (error) {
      console.error('Error creating fraud alert:', error);
      throw error;
    }
  },

  // Get fraud alerts (for admin)
  async getFraudAlerts(resolved: boolean = false) {
    try {
      const q = query(
        collection(db, FRAUD_ALERTS_COLLECTION),
        where('resolved', '==', resolved),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        } as FraudAlert;
      });
    } catch (error) {
      console.error('Error getting fraud alerts:', error);
      throw error;
    }
  },

  // Create promo code (admin only)
  async createPromoCode(promoData: Omit<PromoCode, 'id' | 'currentUses' | 'status'>) {
    try {
      const docRef = await addDoc(collection(db, PROMO_CODES_COLLECTION), {
        ...promoData,
        currentUses: 0,
        status: 'active',
      });
      return { id: docRef.id, ...promoData };
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw error;
    }
  },

  // Validate promo code
  async validatePromoCode(code: string): Promise<PromoCode | null> {
    try {
      const q = query(
        collection(db, PROMO_CODES_COLLECTION),
        where('code', '==', code.toUpperCase()),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        
        // Check if expired
        const now = new Date();
        const validFrom = data.validFrom?.toDate() || new Date();
        const validUntil = data.validUntil?.toDate();
        
        if (now < validFrom || (validUntil && now > validUntil)) {
          return null;
        }

        // Check max uses
        if (data.maxUses && data.currentUses >= data.maxUses) {
          return null;
        }

        return {
          id: doc.id,
          ...data,
          validFrom: validFrom,
          validUntil: validUntil,
        } as PromoCode;
      }
      return null;
    } catch (error) {
      console.error('Error validating promo code:', error);
      throw error;
    }
  },

  // Use promo code
  async usePromoCode(codeId: string) {
    try {
      const docRef = doc(db, PROMO_CODES_COLLECTION, codeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        await updateDoc(docRef, {
          currentUses: (data.currentUses || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Error using promo code:', error);
      throw error;
    }
  },
};

export default referralService;
