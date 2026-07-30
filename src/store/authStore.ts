import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';
import { authService, userService } from '../services/firebaseService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole, intendedCourse?: string, competingDisciplines?: string[], referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const INITIAL_TUTORS = [
  { id: '1', name: 'Pedro Sambo', subject: 'Matemática', status: 'pending', email: 'pedro@gmail.com', avatar: '' },
  { id: '2', name: 'Ana Vilanculos', subject: 'Português', status: 'pending', email: 'ana@gmail.com', avatar: '' },
  { id: '3', name: 'Mário Langa', subject: 'Física', status: 'active', email: 'mario@gmail.com', avatar: '' },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      // Login apenas - não cria novo usuário
      const userData = await authService.signIn(normalizedEmail, password);

      // Persist locally for offline use
      await AsyncStorage.setItem('eduprep_user', JSON.stringify(userData));

      set({ user: userData, isLoading: false });
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    intendedCourse?: string,
    competingDisciplines?: string[],
    referralCode?: string
  ) => {
    set({ isLoading: true });

    try {
      const normalizedEmail = email.trim().toLowerCase();
      let finalRole = role;

      // Admin override
      if (normalizedEmail === 'admin@eduprep.co.mz' || normalizedEmail === 'admin@eduprep.com') {
        finalRole = UserRole.ADMIN;
      }

      const displayName = name?.trim() || normalizedEmail.split('@')[0];

      // Criar novo usuário
      const userData = await authService.signUp(normalizedEmail, password, displayName, finalRole, {
        intendedCourse,
        competingDisciplines,
        referralCode,
      });

      // Persist locally for offline use
      await AsyncStorage.setItem('eduprep_user', JSON.stringify(userData));

      set({ user: userData, isLoading: false });
    } catch (error) {
      console.error('Register error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    console.log('logout function chamada');
    try {
      console.log('Chamando authService.signOut()');
      await authService.signOut();
      console.log('authService.signOut() concluído');
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }
    console.log('Removendo item do AsyncStorage');
    await AsyncStorage.removeItem('eduprep_user');
    console.log('Definindo user como null');
    set({ user: null });
    console.log('Logout concluído');
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const saved = await AsyncStorage.getItem('eduprep_user');
      if (saved) {
        const localUser: User = JSON.parse(saved);
        set({ user: localUser });

        try {
          const refreshed = await userService.getUserById(localUser.id);
          if (refreshed) {
            set({ user: refreshed });
            await AsyncStorage.setItem('eduprep_user', JSON.stringify(refreshed));
          }
        } catch (error) {
          console.error('Error refreshing user from Firestore:', error);
          // If refresh fails, keep local user
        }
      }
    } catch (error) {
      console.error('Error loading user from AsyncStorage:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: async (updates: Partial<User>) => {
    const currentUserJson = await AsyncStorage.getItem('eduprep_user');
    if (!currentUserJson) return;

    const user: User = JSON.parse(currentUserJson);
    const updatedUser = { ...user, ...updates };

    try {
      await userService.updateUser(user.id, updates);
    } catch {
      // ignore
    }

    await AsyncStorage.setItem('eduprep_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));
