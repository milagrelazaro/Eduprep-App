import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exam, Question } from '../types';

const OFFLINE_EXAMS_KEY = 'eduprep_offline_exams';
const OFFLINE_QUESTIONS_KEY = 'eduprep_offline_questions';
const OFFLINE_RESULTS_KEY = 'eduprep_offline_results';
const SYNC_QUEUE_KEY = 'eduprep_sync_queue';

interface SyncQueueItem {
  type: 'exam_result' | 'user_update';
  data: any;
  timestamp: number;
}

export const offlineService = {
  // Check network status (simplified - assumes online by default)
  async isOnline(): Promise<boolean> {
    // In a real implementation, you would use a network library
    // For now, we assume online to allow sync attempts
    // The actual sync will fail if offline
    return true;
  },

  // Save exam for offline use
  async saveExamForOffline(exam: Exam): Promise<void> {
    try {
      const offlineExams = await this.getOfflineExams();
      const existingIndex = offlineExams.findIndex(e => e.id === exam.id);
      
      if (existingIndex >= 0) {
        offlineExams[existingIndex] = exam;
      } else {
        offlineExams.push(exam);
      }
      
      await AsyncStorage.setItem(OFFLINE_EXAMS_KEY, JSON.stringify(offlineExams));
    } catch (error) {
      console.error('Error saving exam for offline:', error);
    }
  },

  // Get all offline exams
  async getOfflineExams(): Promise<Exam[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_EXAMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline exams:', error);
      return [];
    }
  },

  // Save questions for offline use
  async saveQuestionsForOffline(questions: Question[]): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_QUESTIONS_KEY, JSON.stringify(questions));
    } catch (error) {
      console.error('Error saving questions for offline:', error);
    }
  },

  // Get offline questions
  async getOfflineQuestions(): Promise<Question[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_QUESTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline questions:', error);
      return [];
    }
  },

  // Save exam result for offline
  async saveExamResult(result: any): Promise<void> {
    try {
      const offlineResults = await this.getOfflineResults();
      offlineResults.push(result);
      await AsyncStorage.setItem(OFFLINE_RESULTS_KEY, JSON.stringify(offlineResults));
      
      // Add to sync queue
      await this.addToSyncQueue({
        type: 'exam_result',
        data: result,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error saving exam result offline:', error);
    }
  },

  // Get offline results
  async getOfflineResults(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_RESULTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline results:', error);
      return [];
    }
  },

  // Add item to sync queue
  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      queue.push(item);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  },

  // Get sync queue
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  },

  // Clear sync queue
  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  },

  // Sync offline data with server
  async syncWithServer(syncFunctions: {
    syncExamResult: (result: any) => Promise<void>;
    syncUserUpdate: (data: any) => Promise<void>;
  }): Promise<{ synced: number; failed: number }> {
    const isOnline = await this.isOnline();
    if (!isOnline) {
      return { synced: 0, failed: 0 };
    }

    try {
      const queue = await this.getSyncQueue();
      let synced = 0;
      let failed = 0;

      for (const item of queue) {
        try {
          if (item.type === 'exam_result') {
            await syncFunctions.syncExamResult(item.data);
          } else if (item.type === 'user_update') {
            await syncFunctions.syncUserUpdate(item.data);
          }
          synced++;
        } catch (error) {
          console.error('Error syncing item:', error);
          failed++;
        }
      }

      // Clear synced items from queue
      if (synced > 0) {
        await this.clearSyncQueue();
      }

      return { synced, failed };
    } catch (error) {
      console.error('Error syncing with server:', error);
      return { synced: 0, failed: 0 };
    }
  },

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        OFFLINE_EXAMS_KEY,
        OFFLINE_QUESTIONS_KEY,
        OFFLINE_RESULTS_KEY,
        SYNC_QUEUE_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  },

  // Get offline storage size
  async getOfflineStorageSize(): Promise<number> {
    try {
      const keys = [OFFLINE_EXAMS_KEY, OFFLINE_QUESTIONS_KEY, OFFLINE_RESULTS_KEY, SYNC_QUEUE_KEY];
      let totalSize = 0;

      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }

      return totalSize; // Size in bytes
    } catch (error) {
      console.error('Error getting offline storage size:', error);
      return 0;
    }
  },

  // Check if exam is available offline
  async isExamAvailableOffline(examId: string): Promise<boolean> {
    try {
      const offlineExams = await this.getOfflineExams();
      return offlineExams.some(e => e.id === examId);
    } catch (error) {
      console.error('Error checking exam availability:', error);
      return false;
    }
  },

  // Download exam for offline use
  async downloadExam(exam: Exam, questions: Question[]): Promise<void> {
    try {
      await this.saveExamForOffline(exam);
      await this.saveQuestionsForOffline(questions);
    } catch (error) {
      console.error('Error downloading exam:', error);
      throw error;
    }
  },

  // Remove exam from offline storage
  async removeExamFromOffline(examId: string): Promise<void> {
    try {
      const offlineExams = await this.getOfflineExams();
      const filteredExams = offlineExams.filter(e => e.id !== examId);
      await AsyncStorage.setItem(OFFLINE_EXAMS_KEY, JSON.stringify(filteredExams));
    } catch (error) {
      console.error('Error removing exam from offline:', error);
    }
  },

  // Get offline statistics
  async getOfflineStats(): Promise<{
    examsCount: number;
    questionsCount: number;
    resultsCount: number;
    storageSize: number;
  }> {
    try {
      const exams = await this.getOfflineExams();
      const questions = await this.getOfflineQuestions();
      const results = await this.getOfflineResults();
      const storageSize = await this.getOfflineStorageSize();

      return {
        examsCount: exams.length,
        questionsCount: questions.length,
        resultsCount: results.length,
        storageSize,
      };
    } catch (error) {
      console.error('Error getting offline stats:', error);
      return {
        examsCount: 0,
        questionsCount: 0,
        resultsCount: 0,
        storageSize: 0,
      };
    }
  },
};

export default offlineService;
