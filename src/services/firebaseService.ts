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
        } as User;
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
        ...updates,
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
      })) as User[];
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  },
};

// Exam Services
export const examService = {
  // Create exam
  async createExam(examData: any) {
    try {
      const docRef = await addDoc(collection(db, EXAMS_COLLECTION), {
        ...examData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...examData };
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

// Exam Results Services
export const examResultService = {
  // Save exam result
  async saveExamResult(resultData: any) {
    try {
      const docRef = await addDoc(collection(db, EXAM_RESULTS_COLLECTION), {
        ...resultData,
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
      const q = query(
        collection(db, EXAM_RESULTS_COLLECTION),
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting results by student:', error);
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
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));
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
  async signUp(email: string, password: string, name: string, role: UserRole) {
    try {
      // This would use Firebase Auth - for now keeping the existing logic
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // const user = userCredential.user;
      
      // Create user document in Firestore
      const userData = await userService.createUser({
        name,
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`,
        status: 'active',
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
      // This would use Firebase Auth
      // const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user from Firestore
      const users = await getDocs(
        query(collection(db, USERS_COLLECTION), where('email', '==', email))
      );
      
      if (!users.empty) {
        const userDoc = users.docs[0];
        return {
          id: userDoc.id,
          ...userDoc.data(),
          createdAt: userDoc.data().createdAt?.toDate(),
          updatedAt: userDoc.data().updatedAt?.toDate(),
        } as User;
      }
      
      throw new Error('User not found');
    } catch (error) {
      console.error('Error signing in:', error);
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
};
