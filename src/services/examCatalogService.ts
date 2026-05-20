import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exam, ExamCatalogItem, Question } from '../types';
import { AVAILABLE_PDF_EXAMS, MOCK_EXAMS } from '../data/mockData';
import { examService } from './firebaseService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const EXAM_CATALOG_KEY = 'eduprep_exam_catalog_v2';

export interface ExamCatalogFilters {
  institution?: string;
  subject?: string;
  status?: 'approved' | 'pending_validation' | 'rejected';
  year?: number;
}

export interface UploadedExamPayload {
  title: string;
  subject: string;
  institution: string;
  fileName: string;
  size?: string;
  pdfUrl?: string;
  description?: string;
  year?: number;
  aiProcessed?: boolean;
  duration?: number;
}

let cachedCatalog: ExamCatalogItem[] | null = null;

const buildSeedCatalog = (): ExamCatalogItem[] => {
  const now = new Date();
  return MOCK_EXAMS.map((exam) => {
    const pdfMeta = AVAILABLE_PDF_EXAMS.find((item) => item.filename === exam.pdfUrl);
    const referenceDate = exam.year ? new Date(`${exam.year}-01-01T00:00:00Z`) : now;

    return {
      id: exam.id,
      title: `${exam.subject} ${exam.year ?? now.getFullYear()} - ${exam.institution}`,
      subject: exam.subject,
      institution: exam.institution,
      year: exam.year ?? now.getFullYear(),
      fileName: exam.pdfUrl || `${exam.subject}.pdf`,
      pdfUrl: exam.pdfUrl,
      size: pdfMeta?.size,
      description: `Exame oficial ${exam.institution} ${exam.year ?? ''}`.trim(),
      duration: exam.duration,
      status: (exam.status as ExamCatalogItem['status']) ?? 'approved',
      uploadSource: 'pdf',
      aiProcessed: !!exam.aiGenerated,
      createdAt: referenceDate.toISOString(),
      updatedAt: referenceDate.toISOString(),
    };
  });
};

const sortCatalog = (catalog: ExamCatalogItem[]) =>
  [...catalog].sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

const persistCatalog = async (catalog: ExamCatalogItem[]) => {
  cachedCatalog = catalog;
  await AsyncStorage.setItem(EXAM_CATALOG_KEY, JSON.stringify(catalog));
};

const loadCatalog = async (): Promise<ExamCatalogItem[]> => {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  // Try loading from Firebase first (silently fail if not authenticated)
  try {
    const firebaseExams = await examService.getApprovedExams();
    if (firebaseExams && firebaseExams.length > 0) {
      const catalog = firebaseExams.map((exam: any) => ({
        id: exam.id,
        title: exam.title || `${exam.subject} ${exam.year} - ${exam.institution}`,
        subject: exam.subject,
        institution: exam.institution,
        year: exam.year || new Date().getFullYear(),
        fileName: exam.fileName || `${exam.subject}.pdf`,
        pdfUrl: exam.pdfUrl,
        size: exam.size,
        description: exam.description || '',
        duration: exam.duration || 90,
        status: exam.status || 'approved',
        uploadSource: exam.uploadSource || 'pdf',
        aiProcessed: exam.aiProcessed || false,
        createdAt: exam.createdAt ? new Date(exam.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: exam.updatedAt ? new Date(exam.updatedAt).toISOString() : new Date().toISOString(),
      }));
      
      const sorted = sortCatalog(catalog);
      await persistCatalog(sorted);
      return sorted;
    }
  } catch (error) {
    console.log('Firebase unavailable, using local cache:', error);
  }

  // Fallback to AsyncStorage cache
  const saved = await AsyncStorage.getItem(EXAM_CATALOG_KEY);
  if (saved) {
    const parsed: ExamCatalogItem[] = JSON.parse(saved);
    cachedCatalog = parsed;
    return parsed;
  }

  // Last resort: seed with local data
  const seed = sortCatalog(buildSeedCatalog());
  await persistCatalog(seed);
  return seed;
};

const applyFilters = (catalog: ExamCatalogItem[], filters?: ExamCatalogFilters) => {
  if (!filters) return catalog;

  return catalog.filter((item) => {
    const matchesInstitution = filters.institution ? item.institution === filters.institution : true;
    const matchesSubject = filters.subject ? item.subject === filters.subject : true;
    const matchesStatus = filters.status ? item.status === filters.status : true;
    const matchesYear = filters.year ? item.year === filters.year : true;
    return matchesInstitution && matchesSubject && matchesStatus && matchesYear;
  });
};

const findExamData = (examId: string): Exam | null => {
  return MOCK_EXAMS.find((exam) => exam.id === examId) ?? null;
};

export const examCatalogService = {
  async seedCatalogIfNeeded() {
    await loadCatalog();
  },

  async syncWithFirebase() {
    try {
      const firebaseExams = await examService.getApprovedExams();
      if (firebaseExams && firebaseExams.length > 0) {
        const catalog = firebaseExams.map((exam: any) => ({
          id: exam.id,
          title: exam.title || `${exam.subject} ${exam.year} - ${exam.institution}`,
          subject: exam.subject,
          institution: exam.institution,
          year: exam.year || new Date().getFullYear(),
          fileName: exam.fileName || `${exam.subject}.pdf`,
          pdfUrl: exam.pdfUrl,
          size: exam.size,
          description: exam.description || '',
          duration: exam.duration || 90,
          status: exam.status || 'approved',
          uploadSource: exam.uploadSource || 'pdf',
          aiProcessed: exam.aiProcessed || false,
          createdAt: exam.createdAt ? new Date(exam.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: exam.updatedAt ? new Date(exam.updatedAt).toISOString() : new Date().toISOString(),
        }));
        
        const sorted = sortCatalog(catalog);
        await persistCatalog(sorted);
        return sorted;
      }
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
      throw error;
    }
  },

  async resetCatalog() {
    cachedCatalog = null;
    await AsyncStorage.removeItem(EXAM_CATALOG_KEY);
  },

  async getCatalog(filters?: ExamCatalogFilters): Promise<ExamCatalogItem[]> {
    const catalog = await loadCatalog();
    return applyFilters(sortCatalog(catalog), filters);
  },

  async getExamById(examId: string): Promise<ExamCatalogItem | null> {
    const catalog = await loadCatalog();
    return catalog.find((item) => item.id === examId) ?? null;
  },

  async getExamDataForSimulation(examId: string): Promise<Exam | null> {
    // Try to load from Firebase first
    try {
      const questionsSnapshot = await getDocs(collection(db, 'exams', examId, 'questions'));
      
      if (!questionsSnapshot.empty) {
        const questions: Question[] = questionsSnapshot.docs.map((doc, index) => ({
          id: doc.id,
          text: doc.data().text,
          options: doc.data().options,
          correctOption: doc.data().correctOption,
          explanation: doc.data().explanation,
          correctFeedback: doc.data().correctFeedback,
          incorrectFeedback: doc.data().incorrectFeedback,
          topic: doc.data().topic,
        }));

        // Get exam metadata
        const examItem = await this.getExamById(examId);
        if (examItem) {
          return {
            id: examItem.id,
            institution: examItem.institution,
            subject: examItem.subject,
            duration: examItem.duration || 90,
            year: examItem.year,
            difficulty: 'medium',
            topics: [examItem.subject],
            status: examItem.status === 'pending_validation' ? 'pending' : examItem.status as 'approved' | 'rejected',
            pdfUrl: examItem.pdfUrl,
            questions,
          };
        }
      }
    } catch (error) {
      console.log('Firebase questions unavailable, using local data:', error);
    }

    // Fallback to local mock data
    return findExamData(examId);
  },

  async addUploadedExam(payload: UploadedExamPayload): Promise<ExamCatalogItem> {
    const catalog = await loadCatalog();
    const now = new Date();

    const newItem: ExamCatalogItem = {
      id: `upload-${Date.now()}`,
      title: payload.title,
      subject: payload.subject,
      institution: payload.institution,
      year: payload.year ?? now.getFullYear(),
      fileName: payload.fileName,
      pdfUrl: payload.pdfUrl,
      size: payload.size,
      description: payload.description ?? 'Exame enviado pela comunidade para validação.',
      duration: payload.duration ?? 90,
      status: 'pending_validation',
      uploadSource: 'upload',
      aiProcessed: payload.aiProcessed ?? true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Save to Firebase first
    try {
      const firebaseExam = await examService.createExam({
        title: newItem.title,
        subject: newItem.subject,
        institution: newItem.institution,
        year: newItem.year,
        fileName: newItem.fileName,
        pdfUrl: newItem.pdfUrl,
        size: newItem.size,
        description: newItem.description,
        duration: newItem.duration,
        status: newItem.status,
        uploadSource: newItem.uploadSource,
        aiProcessed: newItem.aiProcessed,
      });
      newItem.id = firebaseExam.id; // Use Firebase ID
    } catch (error) {
      console.log('Firebase unavailable, saving locally only:', error);
    }

    // Save to local cache
    const updatedCatalog = sortCatalog([newItem, ...catalog]);
    await persistCatalog(updatedCatalog);
    return newItem;
  },

  async updateExamStatus(examId: string, status: ExamCatalogItem['status']) {
    const catalog = await loadCatalog();
    const updatedCatalog = catalog.map((item) => {
      if (item.id === examId) {
        return { ...item, status, updatedAt: new Date().toISOString() };
      }
      return item;
    });

    await persistCatalog(sortCatalog(updatedCatalog));
    return updatedCatalog.find((item) => item.id === examId) ?? null;
  },

  async getAvailableInstitutions(): Promise<string[]> {
    const catalog = await loadCatalog();
    return Array.from(new Set(catalog.map((item) => item.institution))).sort();
  },

  async getAvailableSubjects(): Promise<string[]> {
    const catalog = await loadCatalog();
    return Array.from(new Set(catalog.map((item) => item.subject))).sort();
  },
};
