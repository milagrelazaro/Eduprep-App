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
  arrayUnion 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const RATINGS_COLLECTION = 'ratings';
const ACHIEVEMENTS_COLLECTION = 'achievements';
const USER_ACHIEVEMENTS_COLLECTION = 'userAchievements';

export interface Rating {
  id: string;
  userId: string;
  examId?: string;
  tutorId?: string;
  type: 'exam' | 'tutor' | 'app';
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'first_win' | 'master_capturer' | 'strategist' | 'perfectionist' | 'streak' | 'completion';
  criteria: {
    type: 'score' | 'count' | 'streak';
    value: number;
  };
  points: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

export const ratingService = {
  // Submit rating
  async submitRating(ratingData: Omit<Rating, 'id' | 'createdAt'>): Promise<Rating> {
    try {
      const docRef = await addDoc(collection(db, RATINGS_COLLECTION), {
        ...ratingData,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...ratingData, createdAt: new Date() };
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  },

  // Get user ratings
  async getUserRatings(userId: string): Promise<Rating[]> {
    try {
      const q = query(
        collection(db, RATINGS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Rating;
      });
    } catch (error) {
      console.error('Error getting user ratings:', error);
      throw error;
    }
  },

  // Get average rating for exam
  async getExamRating(examId: string): Promise<{ average: number; count: number }> {
    try {
      const q = query(
        collection(db, RATINGS_COLLECTION),
        where('examId', '==', examId),
        where('type', '==', 'exam')
      );
      const querySnapshot = await getDocs(q);
      
      const ratings = querySnapshot.docs.map(doc => doc.data().rating);
      const count = ratings.length;
      const average = count > 0 ? ratings.reduce((sum, r) => sum + r, 0) / count : 0;
      
      return { average, count };
    } catch (error) {
      console.error('Error getting exam rating:', error);
      return { average: 0, count: 0 };
    }
  },

  // Get average rating for tutor
  async getTutorRating(tutorId: string): Promise<{ average: number; count: number }> {
    try {
      const q = query(
        collection(db, RATINGS_COLLECTION),
        where('tutorId', '==', tutorId),
        where('type', '==', 'tutor')
      );
      const querySnapshot = await getDocs(q);
      
      const ratings = querySnapshot.docs.map(doc => doc.data().rating);
      const count = ratings.length;
      const average = count > 0 ? ratings.reduce((sum, r) => sum + r, 0) / count : 0;
      
      return { average, count };
    } catch (error) {
      console.error('Error getting tutor rating:', error);
      return { average: 0, count: 0 };
    }
  },

  // Get app rating
  async getAppRating(): Promise<{ average: number; count: number }> {
    try {
      const q = query(
        collection(db, RATINGS_COLLECTION),
        where('type', '==', 'app')
      );
      const querySnapshot = await getDocs(q);
      
      const ratings = querySnapshot.docs.map(doc => doc.data().rating);
      const count = ratings.length;
      const average = count > 0 ? ratings.reduce((sum, r) => sum + r, 0) / count : 0;
      
      return { average, count };
    } catch (error) {
      console.error('Error getting app rating:', error);
      return { average: 0, count: 0 };
    }
  },

  // Achievements
  achievements: [
    {
      id: 'first_win',
      name: 'Primeira Vitória',
      description: 'Completa o teu primeiro simulado com sucesso',
      icon: '🏆',
      type: 'first_win' as const,
      criteria: { type: 'count' as const, value: 1 },
      points: 50,
    },
    {
      id: 'master_capturer',
      name: 'Captura Mestre',
      description: 'Acerta 20+ questões num único simulado',
      icon: '🎯',
      type: 'score' as const,
      criteria: { type: 'score' as const, value: 80 },
      points: 100,
    },
    {
      id: 'strategist',
      name: 'Estrategista',
      description: 'Completa 10 simulados sem perder',
      icon: '🧠',
      type: 'completion' as const,
      criteria: { type: 'count' as const, value: 10 },
      points: 150,
    },
    {
      id: 'perfectionist',
      name: 'Perfeccionista',
      description: 'Completa um simulado com menos de 20 jogadas',
      icon: '⭐',
      type: 'score' as const,
      criteria: { type: 'score' as const, value: 100 },
      points: 200,
    },
    {
      id: 'streak_7',
      name: 'Sequência de 7 Dias',
      description: 'Estuda durante 7 dias consecutivos',
      icon: '🔥',
      type: 'streak' as const,
      criteria: { type: 'streak' as const, value: 7 },
      points: 100,
    },
    {
      id: 'streak_30',
      name: 'Sequência de 30 Dias',
      description: 'Estuda durante 30 dias consecutivos',
      icon: '💪',
      type: 'streak' as const,
      criteria: { type: 'streak' as const, value: 30 },
      points: 300,
    },
    {
      id: 'completion_50',
      name: '50 Simulados',
      description: 'Completa 50 simulados',
      icon: '📚',
      type: 'completion' as const,
      criteria: { type: 'count' as const, value: 50 },
      points: 250,
    },
    {
      id: 'completion_100',
      name: '100 Simulados',
      description: 'Completa 100 simulados',
      icon: '🎓',
      type: 'completion' as const,
      criteria: { type: 'count' as const, value: 100 },
      points: 500,
    },
  ],

  // Check and unlock achievements
  async checkAchievements(userId: string, stats: {
    totalExams: number;
    averageScore: number;
    currentStreak: number;
    lastExamScore?: number;
  }): Promise<Achievement[]> {
    try {
      const unlockedAchievements = await this.getUserAchievements(userId);
      const unlockedIds = new Set(unlockedAchievements.map(ua => ua.achievementId));
      const newlyUnlocked: Achievement[] = [];

      for (const achievement of this.achievements) {
        if (unlockedIds.has(achievement.id)) continue;

        let shouldUnlock = false;

        switch (achievement.criteria.type) {
          case 'count':
            shouldUnlock = stats.totalExams >= achievement.criteria.value;
            break;
          case 'score':
            shouldUnlock = (stats.lastExamScore || 0) >= achievement.criteria.value;
            break;
          case 'streak':
            shouldUnlock = stats.currentStreak >= achievement.criteria.value;
            break;
        }

        if (shouldUnlock) {
          await this.unlockAchievement(userId, achievement.id);
          newlyUnlocked.push(achievement);
        }
      }

      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  },

  // Unlock achievement
  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      await addDoc(collection(db, USER_ACHIEVEMENTS_COLLECTION), {
        userId,
        achievementId,
        unlockedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  },

  // Get user achievements
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const q = query(
        collection(db, USER_ACHIEVEMENTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('unlockedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          unlockedAt: data.unlockedAt?.toDate() || new Date(),
        } as UserAchievement;
      });
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  },

  // Get user points
  async getUserPoints(userId: string): Promise<number> {
    try {
      const achievements = await this.getUserAchievements(userId);
      return achievements.reduce((total, ua) => {
        const achievement = this.achievements.find(a => a.id === ua.achievementId);
        return total + (achievement?.points || 0);
      }, 0);
    } catch (error) {
      console.error('Error getting user points:', error);
      return 0;
    }
  },

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<Array<{ userId: string; points: number; rank: number }>> {
    try {
      const allUsers = await getDocs(collection(db, 'users'));
      const leaderboard = [];

      for (const userDoc of allUsers.docs) {
        const userId = userDoc.id;
        const points = await this.getUserPoints(userId);
        leaderboard.push({ userId, points });
      }

      leaderboard.sort((a, b) => b.points - a.points);
      return leaderboard.slice(0, limit).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  },
};

export default ratingService;
