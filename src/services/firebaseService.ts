import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { User, UserRole } from '../types';

// Firestore collections
const USERS_COLLECTION = 'users';
const TUTORS_COLLECTION = 'tutors';
const EXAMS_COLLECTION = 'exams';
const LESSONS_COLLECTION = 'lessons';
const POSTS_COLLECTION = 'posts';
const EXAM_RESULTS_COLLECTION = 'examResults';
const NOTIFICATIONS_COLLECTION = 'notifications';

// User Services
export const userService = {
  // Create user
  async createUser(userData: Omit<User, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, USERS_COLLECTION), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as unknown as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(userId: string, updates: Partial<User>) {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(docRef, {
        ...Object.fromEntries(
          Object.entries(updates).filter(([_, value]) => value !== undefined)
        ),
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Get users by role
  async getUsersByRole(role: UserRole) {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('role', '==', role),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as unknown as User[];
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  },

  // Get all users
  async getAllUsers() {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as unknown as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },
};

// Exam Services
export const examService = {
  // Create exam
  async createExam(examData: any) {
    try {
      // Separar questões do resto dos dados
      const { questions, ...examMetadata } = examData;
      
      // Criar documento do exame
      const docRef = await addDoc(collection(db, EXAMS_COLLECTION), {
        ...examMetadata,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Adicionar questões como subcoleção
      if (questions && questions.length > 0) {
        const questionsCollection = collection(db, EXAMS_COLLECTION, docRef.id, 'questions');
        
        for (const question of questions) {
          await addDoc(questionsCollection, {
            text: question.text,
            options: question.options,
            correctOption: question.correctOption,
            explanation: question.explanation || '',
            correctFeedback: question.correctFeedback || 'Resposta correta!',
            incorrectFeedback: question.incorrectFeedback || 'Resposta incorreta.',
            topic: question.topic || examMetadata.subject,
            learnMoreUrl: question.learnMoreUrl || '',
            createdAt: serverTimestamp(),
          });
        }
      }
      
      return { id: docRef.id, ...examMetadata };
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  },

  // Get all approved exams
  async getApprovedExams() {
    try {
      const q = query(
        collection(db, EXAMS_COLLECTION),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting approved exams:', error);
      throw error;
    }
  },

  // Get exams by institution and subject
  async getExamsByFilters(institution?: string, subject?: string) {
    try {
      let q = query(collection(db, EXAMS_COLLECTION), where('status', '==', 'approved'));
      
      if (institution) {
        q = query(q, where('institution', '==', institution));
      }
      if (subject) {
        q = query(q, where('subject', '==', subject));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting exams by filters:', error);
      throw error;
    }
  },
};

// Payment Services
export const paymentService = {
  async createPayment(paymentData: any) {
    try {
      const docRef = await addDoc(collection(db, 'payments'), {
        ...paymentData,
        status: paymentData.status ?? 'escrow',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...paymentData };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  async updatePayment(paymentId: string, updates: any) {
    try {
      const docRef = doc(db, 'payments', paymentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  async getPaymentsByUser(userId: string) {
    try {
      const q = query(
        collection(db, 'payments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          lessonId: data.lessonId || undefined,
          userId: data.userId || '',
          tutorId: data.tutorId || '',
          amount: data.amount || 0,
          status: data.status || 'pending',
          escrowReleaseDate: data.escrowReleaseDate || undefined,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
      });
    } catch (error) {
      console.error('Error getting payments by user:', error);
      throw error;
    }
  },

  async getPaymentsByLesson(lessonId: string) {
    try {
      const q = query(
        collection(db, 'payments'),
        where('lessonId', '==', lessonId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          lessonId: data.lessonId || undefined,
          userId: data.userId || '',
          tutorId: data.tutorId || '',
          amount: data.amount || 0,
          status: data.status || 'pending',
          escrowReleaseDate: data.escrowReleaseDate || undefined,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
      });
    } catch (error) {
      console.error('Error getting payments by lesson:', error);
      throw error;
    }
  },
};

// Exam Results Services
export const examResultService = {
  // Save exam result
  async saveExamResult(resultData: any) {
    try {
      const docRef = await addDoc(collection(db, EXAM_RESULTS_COLLECTION), {
        ...resultData,
        date: resultData.date ?? serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...resultData };
    } catch (error) {
      console.error('Error saving exam result:', error);
      throw error;
    }
  },

  // Get results by student
  async getResultsByStudent(studentId: string) {
    try {
      // Removido orderBy para evitar necessidade de índice composto
      const q = query(
        collection(db, EXAM_RESULTS_COLLECTION),
        where('userId', '==', studentId)
      );
      const querySnapshot = await getDocs(q);

      const parseTimestamp = (value: any) => {
        if (!value) return null;
        if (typeof value?.toDate === 'function') return value.toDate();
        if (typeof value === 'string') return new Date(value);
        return null;
      };
      
      const results = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          examId: data.examId || undefined,
          studentId: data.studentId || '',
          score: data.score || 0,
          date: parseTimestamp(data.date) || new Date(),
          analysis: data.analysis || '',
          examName: data.examName || undefined,
          subject: data.subject || undefined,
          totalQuestions: data.totalQuestions || undefined,
          correctAnswers: data.correctAnswers || undefined,
          duration: data.duration || 0,
        };
      });
      
      // Ordenar por data (mais recente primeiro) no código
      return results.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : 0;
        const dateB = b.date instanceof Date ? b.date.getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting results by student:', error);
      throw error;
    }
  },

  // Get all results (for ranking)
  async getAllResults() {
    try {
      const q = query(
        collection(db, EXAM_RESULTS_COLLECTION),
        orderBy('score', 'desc'),
        limit(500) // Limitar para performance
      );
      const querySnapshot = await getDocs(q);

      const parseTimestamp = (value: any) => {
        if (!value) return null;
        if (typeof value?.toDate === 'function') return value.toDate();
        if (typeof value === 'string') return new Date(value);
        return null;
      };
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || data.studentId || '',
          userName: data.userName || data.studentName || 'Usuário',
          userAvatar: data.userAvatar || '',
          score: data.score || 0,
          subject: data.subject || 'Geral',
          date: parseTimestamp(data.date) || new Date(),
        };
      });
    } catch (error) {
      console.error('Error getting all results:', error);
      throw error;
    }
  },
};

// Posts Services
export const postService = {
  // Create post
  async createPost(postData: any) {
    try {
      const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...postData };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Get all posts
  async getAllPosts() {
    try {
      const q = query(
        collection(db, POSTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          authorId: data.authorId || '',
          authorName: data.authorName || '',
          authorAvatar: data.authorAvatar || '',
          content: data.content || '',
          image: data.image || undefined,
          likes: data.likes || [],
          comments: data.comments || [],
          shares: data.shares || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error('Error getting all posts:', error);
      throw error;
    }
  },

  // Update post
  async updatePost(postId: string, updates: any) {
    try {
      const docRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete post
  async deletePost(postId: string) {
    try {
      await deleteDoc(doc(db, POSTS_COLLECTION, postId));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },
};

// Storage Services
export const storageService = {
  // Upload image
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Delete image
  async deleteImage(path: string): Promise<boolean> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },
};

// Auth Services
export const authService = {
  // Sign up with email and password
  async signUp(
    email: string,
    password: string,
    name: string,
    role: UserRole,
    metadata?: Partial<User>
  ) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const userData = await userService.createUser({
        name,
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`,
        status: 'active',
        firebaseUid: firebaseUser.uid,
        ...(metadata && Object.fromEntries(
          Object.entries(metadata).filter(([_, value]) => value !== undefined)
        )),
      });

      return userData;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Try to find the corresponding user document by Firebase UID
      const usersByUid = await getDocs(
        query(collection(db, USERS_COLLECTION), where('firebaseUid', '==', firebaseUser.uid))
      );

      if (!usersByUid.empty) {
        const userDoc = usersByUid.docs[0];
        return {
          id: userDoc.id,
          ...userDoc.data(),
          createdAt: userDoc.data().createdAt?.toDate(),
          updatedAt: userDoc.data().updatedAt?.toDate(),
        } as unknown as User;
      }

      // Fallback: if the user doc doesn't have firebaseUid yet, try matching by email.
      const usersByEmail = await getDocs(
        query(collection(db, USERS_COLLECTION), where('email', '==', email))
      );

      if (!usersByEmail.empty) {
        const userDoc = usersByEmail.docs[0];
        // Persist the firebaseUid for future logins.
        await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), {
          firebaseUid: firebaseUser.uid,
          updatedAt: serverTimestamp(),
        });

        return {
          id: userDoc.id,
          ...userDoc.data(),
          firebaseUid: firebaseUser.uid,
          createdAt: userDoc.data().createdAt?.toDate(),
          updatedAt: userDoc.data().updatedAt?.toDate(),
        } as unknown as User;
      }

      throw new Error('User not found');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign out current user
  async signOut() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Listen for auth state changes (optional helper)
  onAuthStateChanged(callback: (user: any) => void) {
    return onAuthStateChanged(auth, callback);
  },
};

// Tutor Services
export const tutorService = {
  // Get tutor settings
  async getTutorSettings(tutorId: string) {
    try {
      const docRef = doc(db, TUTORS_COLLECTION, tutorId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting tutor settings:', error);
      throw error;
    }
  },

  // Update tutor settings
  async updateTutorSettings(tutorId: string, settings: any) {
    try {
      const docRef = doc(db, TUTORS_COLLECTION, tutorId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          ...settings,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, TUTORS_COLLECTION), {
          tutorId,
          ...settings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating tutor settings:', error);
      throw error;
    }
  },

  // Get all active tutors
  async getActiveTutors() {
    try {
      const q = query(
        collection(db, TUTORS_COLLECTION),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting tutors:', error);
      throw error;
    }
  },
};

// Lesson Services
export const lessonService = {
  // Create lesson booking
  async createLesson(lessonData: any) {
    try {
      const docRef = await addDoc(collection(db, LESSONS_COLLECTION), {
        ...lessonData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...lessonData };
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  },

  // Get lessons for user (student or tutor)
  async getLessonsForUser(userId: string, role: 'student' | 'tutor') {
    try {
      const field = role === 'student' ? 'studentId' : 'tutorId';
      const q = query(
        collection(db, LESSONS_COLLECTION),
        where(field, '==', userId),
        orderBy('scheduledDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting lessons:', error);
      throw error;
    }
  },

  // Update lesson status
  async updateLessonStatus(lessonId: string, status: string) {
    try {
      const docRef = doc(db, LESSONS_COLLECTION, lessonId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating lesson status:', error);
      throw error;
    }
  },

  // Get tutor earnings
  async getTutorEarnings(tutorId: string) {
    try {
      const q = query(
        collection(db, LESSONS_COLLECTION),
        where('tutorId', '==', tutorId),
        where('status', '==', 'completed')
      );
      const querySnapshot = await getDocs(q);
      
      let totalEarnings = 0;
      let completedLessons = 0;
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalEarnings += data.price || 0;
        completedLessons++;
      });
      
      return { totalEarnings, completedLessons };
    } catch (error) {
      console.error('Error getting tutor earnings:', error);
      throw error;
    }
  },
};

// Notification Services
export const notificationService = {
  // Create notification
  async createNotification(notificationData: any) {
    try {
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notificationData,
        read: false,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get notifications for user
  async getNotificationsForUser(userId: string) {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
};

export default {
  userService,
  examService,
  examResultService,
  postService,
  storageService,
  authService,
  tutorService,
  lessonService,
  notificationService,
};
