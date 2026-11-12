import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const AUDIT_LOGS_COLLECTION = 'auditLogs';

export interface AuditLogEntry {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Registro de auditoria: quem fez o quê, quando e sobre qual entidade.
 * Os registos são gravados na coleção `auditLogs` do Firestore.
 */
export const auditService = {
  async log(entry: AuditLogEntry) {
    try {
      await addDoc(collection(db, AUDIT_LOGS_COLLECTION), {
        ...entry,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      // Auditoria nunca deve bloquear a operação principal
      console.error('Erro ao registar auditoria:', error);
    }
  },

  async getRecentLogs(maxResults: number = 20) {
    try {
      const q = query(
        collection(db, AUDIT_LOGS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || null,
      }));
    } catch (error) {
      console.error('Erro ao carregar auditoria:', error);
      return [];
    }
  },
};

export default auditService;
