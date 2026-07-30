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
  serverTimestamp,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  // Create notification
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    try {
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false,
      });
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get user notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        } as Notification;
      });
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  },

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(docRef, { read: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read for user
  async markAllAsRead(userId: string) {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      const batch = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(batch);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Smart notification helpers
  async sendExamReminder(userId: string, examDate: Date, subject: string) {
    const daysUntilExam = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    let message = '';
    let title = '';
    
    if (daysUntilExam <= 7) {
      title = '⚠️ Exame em breve!';
      message = `O teu exame de ${subject} é em ${daysUntilExam} dia${daysUntilExam > 1 ? 's' : ''}. Hora de intensificar os simulados!`;
    } else if (daysUntilExam <= 30) {
      title = '📅 Exame aproximando-se';
      message = `Faltam ${daysUntilExam} dias para o exame de ${subject}. Mantém o ritmo!`;
    } else {
      title = '📚 Preparação em curso';
      message = `Continua a preparar-te para o exame de ${subject}. Estás no caminho certo!`;
    }

    return this.createNotification({
      userId,
      type: 'exam_reminder',
      title,
      message,
      data: { examDate: examDate.toISOString(), subject },
    });
  },

  async sendPerformanceAlert(userId: string, score: number, subject: string) {
    let title = '';
    let message = '';
    let type: 'performance_good' | 'performance_warning' | 'performance_alert' = 'performance_good';

    if (score >= 80) {
      title = '🎉 Excelente resultado!';
      message = `Parabéns! Obtiveste ${score}% no simulado de ${subject}. Continua assim!`;
      type = 'performance_good';
    } else if (score >= 60) {
      title = '👍 Bom resultado';
      message = `Obtiveste ${score}% no simulado de ${subject}. Com mais prática, vais melhorar!`;
      type = 'performance_good';
    } else if (score >= 40) {
      title = '⚠️ Precisas de melhorar';
      message = `Obtiveste ${score}% no simulado de ${subject}. Revê as matérias e tenta novamente.`;
      type = 'performance_warning';
    } else {
      title = '📉 Resultado abaixo do esperado';
      message = `Obtiveste ${score}% no simulado de ${subject}. Recomendamos que revises os conteúdos e faças mais simulados.`;
      type = 'performance_alert';
    }

    return this.createNotification({
      userId,
      type,
      title,
      message,
      data: { score, subject },
    });
  },

  async sendStreakReminder(userId: string, streakDays: number) {
    let title = '';
    let message = '';

    if (streakDays === 0) {
      title = '🔥 Perdeste a sequência!';
      message = 'Não fizeste simulados há algum tempo. Volta a estudar para recuperar o teu ritmo!';
    } else if (streakDays >= 7) {
      title = '🔥 Sequência impressionante!';
      message = `Estás há ${streakDays} dias consecutivos a estudar! Continua assim!`;
    } else if (streakDays >= 3) {
      title = '🔥 Boa sequência!';
      message = `Estás há ${streakDays} dias consecutivos a estudar. Mantém o ritmo!`;
    } else {
      title = '📅 Continua a estudar';
      message = `Estás há ${streakDays} dia${streakDays > 1 ? 's' : ''} a estudar. Faz mais um simulado hoje!`;
    }

    return this.createNotification({
      userId,
      type: 'streak_reminder',
      title,
      message,
      data: { streakDays },
    });
  },

  async sendSubscriptionReminder(userId: string, daysUntilExpiry: number) {
    let title = '';
    let message = '';

    if (daysUntilExpiry <= 3) {
      title = '⚠️ Subscrição a expirar!';
      message = `A tua subscrição expira em ${daysUntilExpiry} dia${daysUntilExpiry > 1 ? 's' : ''}. Renova agora para não perderes o acesso!`;
    } else if (daysUntilExpiry <= 7) {
      title = '📅 Subscrição a expirar em breve';
      message = `A tua subscrição expira em ${daysUntilExpiry} dias. Renova para continuares a ter acesso a todos os recursos.`;
    } else {
      return null; // Don't send notification if expiry is far
    }

    return this.createNotification({
      userId,
      type: 'subscription_reminder',
      title,
      message,
      data: { daysUntilExpiry },
    });
  },

  async sendReferralBonus(userId: string, amount: number, referrerName: string) {
    return this.createNotification({
      userId,
      type: 'referral_bonus',
      title: '🎁 Bónus de Referral!',
      message: `Ganhaste ${amount} MZN pelo referral de ${referrerName}. Parabéns!`,
      data: { amount, referrerName },
    });
  },

  async sendNewContentAlert(userId: string, contentType: string, title: string) {
    return this.createNotification({
      userId,
      type: 'new_content',
      title: '🆕 Novo conteúdo disponível!',
      message: `Novo ${contentType}: ${title}. Vai conferir!`,
      data: { contentType, title },
    });
  },

  async sendPromoterCommissionAlert(promoterId: string, amount: number, leadName: string) {
    return this.createNotification({
      userId: promoterId,
      type: 'commission_earned',
      title: '💰 Nova comissão ganha!',
      message: `Ganhaste ${amount} MZN pelo lead de ${leadName}. Parabéns!`,
      data: { amount, leadName },
    });
  },

  // Batch send notification to multiple users
  async sendBulkNotification(userIds: string[], notificationData: Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>) {
    try {
      const promises = userIds.map(userId =>
        this.createNotification({ ...notificationData, userId })
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      throw error;
    }
  },

  // Get all notifications (for admin)
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        } as Notification;
      });
    } catch (error) {
      console.error('Error getting all notifications:', error);
      throw error;
    }
  },
};

export default notificationService;
