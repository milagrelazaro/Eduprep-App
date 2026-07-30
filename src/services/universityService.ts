import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface University {
  id: string;
  name: string;
  fullName: string;
  location: string;
  icon: string;
  active: boolean;
  createdAt: Date;
}

const UNIVERSITIES_COLLECTION = 'universities';

export const universityService = {
  // Get all active universities
  async getUniversities(): Promise<University[]> {
    try {
      const q = query(
        collection(db, UNIVERSITIES_COLLECTION),
        where('active', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('Nenhuma universidade encontrada no Firebase, usando fallback local');
        return this.getLocalUniversities();
      }
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as University));
    } catch (error) {
      console.error('Error getting universities from Firebase, using fallback:', error);
      return this.getLocalUniversities();
    }
  },

  // Fallback local de universidades
  getLocalUniversities(): University[] {
    return [
      { id: '1', name: 'UEM', fullName: 'Universidade Eduardo Mondlane', location: 'Maputo', icon: '🎓', active: true, createdAt: new Date() },
      { id: '2', name: 'UP', fullName: 'Universidade Pedagógica', location: 'Maputo', icon: '📚', active: true, createdAt: new Date() },
      { id: '3', name: 'ISRI', fullName: 'Instituto Superior de Relações Internacionais', location: 'Maputo', icon: '🌍', active: true, createdAt: new Date() },
      { id: '4', name: 'UCM', fullName: 'Universidade Católica de Moçambique', location: 'Beira', icon: '⛪', active: true, createdAt: new Date() },
      { id: '5', name: 'UniLúrio', fullName: 'Universidade Lúrio', location: 'Nampula', icon: '🏛️', active: true, createdAt: new Date() },
      { id: '6', name: 'UniZambeze', fullName: 'Universidade Zambeze', location: 'Beira', icon: '🌊', active: true, createdAt: new Date() },
      { id: '7', name: 'ISCTEM', fullName: 'Instituto Superior de Ciências e Tecnologia', location: 'Maputo', icon: '💻', active: true, createdAt: new Date() },
    ];
  },

  // Create university (admin only)
  async createUniversity(data: Omit<University, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, UNIVERSITIES_COLLECTION), {
        ...data,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating university:', error);
      throw error;
    }
  },

  // Update university (admin only)
  async updateUniversity(id: string, data: Partial<University>): Promise<void> {
    try {
      const docRef = doc(db, UNIVERSITIES_COLLECTION, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating university:', error);
      throw error;
    }
  },
};
