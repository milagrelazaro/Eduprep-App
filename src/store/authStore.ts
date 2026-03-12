import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
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

  login: async (email: string, name: string, role: UserRole) => {
    let finalRole = role;
    if (email.toLowerCase() === 'admin@eduprep.com') {
      finalRole = UserRole.ADMIN;
    }

    const newUser: User = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name: name || (email ? email.split('@')[0] : (finalRole === UserRole.ADMIN ? 'Administrador' : 'Utilizador')),
      email: email || (finalRole === UserRole.ADMIN ? 'admin@eduprep.com' : 'teste@eduprep.com'),
      role: finalRole,
      status: 'active',
      avatar: finalRole === UserRole.ADMIN
        ? 'https://ui-avatars.com/api/?name=Admin&background=1f2937&color=fff'
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=4f46e5&color=fff`,
    };

    // Manage tutors persistence
    const savedTutors = await AsyncStorage.getItem('eduprep_all_tutors');
    let allTutors = savedTutors ? JSON.parse(savedTutors) : INITIAL_TUTORS;

    if (finalRole === UserRole.TUTOR) {
      const existing = allTutors.find((t: any) => t.email.toLowerCase() === newUser.email.toLowerCase());
      if (!existing) {
        allTutors.push({
          id: newUser.id,
          name: newUser.name,
          subject: 'Nova Especialidade',
          status: 'pending',
          email: newUser.email,
          avatar: newUser.avatar,
          price: 450,
          rating: '0.0',
          reviews: 0,
        });
      }
    }

    await AsyncStorage.setItem('eduprep_all_tutors', JSON.stringify(allTutors));
    await AsyncStorage.setItem('eduprep_user', JSON.stringify(newUser));
    set({ user: newUser });
  },

  logout: async () => {
    await AsyncStorage.removeItem('eduprep_user');
    set({ user: null });
  },

  loadUser: async () => {
    try {
      const saved = await AsyncStorage.getItem('eduprep_user');
      if (saved) {
        set({ user: JSON.parse(saved), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  switchRole: async (newRole: UserRole) => {
    const currentUser = await AsyncStorage.getItem('eduprep_user');
    if (!currentUser) return;

    const user: User = JSON.parse(currentUser);
    const updatedUser = { ...user, role: newRole };

    // If switching to tutor, add to tutors list
    if (newRole === UserRole.TUTOR) {
      const savedTutors = await AsyncStorage.getItem('eduprep_all_tutors');
      let allTutors = savedTutors ? JSON.parse(savedTutors) : INITIAL_TUTORS;
      const existing = allTutors.find((t: any) => t.email.toLowerCase() === user.email.toLowerCase());
      
      if (!existing) {
        allTutors.push({
          id: user.id,
          name: user.name,
          subject: 'Nova Especialidade',
          status: 'pending',
          email: user.email,
          avatar: user.avatar,
          price: 450,
          rating: '0.0',
          reviews: 0,
        });
        await AsyncStorage.setItem('eduprep_all_tutors', JSON.stringify(allTutors));
      }
    }

    await AsyncStorage.setItem('eduprep_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  updateUser: async (updates: Partial<User>) => {
    const currentUser = await AsyncStorage.getItem('eduprep_user');
    if (!currentUser) return;

    const user: User = JSON.parse(currentUser);
    const updatedUser = { ...user, ...updates };

    await AsyncStorage.setItem('eduprep_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));
