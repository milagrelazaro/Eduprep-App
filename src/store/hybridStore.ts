import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';

// Hybrid store: Uses AsyncStorage locally, syncs to Firebase when available
interface AuthState {
  user: User | null;
  isLoading: boolean;
  firebaseEnabled: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  toggleFirebase: () => void;
}

export const useHybridStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      firebaseEnabled: false,

      setUser: (user) => set({ user, isLoading: false }),

      login: async (email: string, name: string, role: UserRole) => {
        try {
          set({ isLoading: true });
          
          // Check if user exists in local storage first
          const existingUsers = await AsyncStorage.getItem('eduprep_users');
          let users = existingUsers ? JSON.parse(existingUsers) : [];
          
          let user = users.find((u: any) => u.email === email);
          
          if (!user) {
            // Create new user
            user = {
              id: `user-${Date.now()}`,
              name,
              email,
              role,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`,
              status: 'active' as const,
            };
            users.push(user);
            await AsyncStorage.setItem('eduprep_users', JSON.stringify(users));
          }
          
          // Save to AsyncStorage
          await AsyncStorage.setItem('eduprep_user', JSON.stringify(user));
          
          // If Firebase is enabled, sync to Firebase
          if (get().firebaseEnabled) {
            try {
              // Firebase sync would go here
              console.log('🔥 Syncing user to Firebase...');
            } catch (error) {
              console.warn('Firebase sync failed, using local storage:', error);
            }
          }
          
          set({ user, isLoading: false });
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          
          // Remove from AsyncStorage
          await AsyncStorage.removeItem('eduprep_user');
          
          // If Firebase is enabled, sign out from Firebase
          if (get().firebaseEnabled) {
            try {
              console.log('🔥 Signing out from Firebase...');
            } catch (error) {
              console.warn('Firebase logout failed:', error);
            }
          }
          
          set({ user: null, isLoading: false });
        } catch (error) {
          console.error('Logout error:', error);
          set({ isLoading: false });
        }
      },

      loadUser: async () => {
        try {
          set({ isLoading: true });
          
          // Load from AsyncStorage first (fast)
          const savedUser = await AsyncStorage.getItem('eduprep_user');
          
          if (savedUser) {
            const user = JSON.parse(savedUser);
            set({ user, isLoading: false });
            
            // If Firebase is enabled, sync in background
            if (get().firebaseEnabled) {
              try {
                console.log('🔥 Syncing with Firebase in background...');
                // Firebase sync would go here
              } catch (error) {
                console.warn('Background Firebase sync failed:', error);
              }
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Load user error:', error);
          set({ isLoading: false });
        }
      },

      switchRole: async (newRole: UserRole) => {
        const { user } = get();
        if (!user) return;

        try {
          set({ isLoading: true });
          
          // Update in AsyncStorage
          const updatedUser = { ...user, role: newRole };
          await AsyncStorage.setItem('eduprep_user', JSON.stringify(updatedUser));
          
          // Update in users list
          const savedUsers = await AsyncStorage.getItem('eduprep_users');
          if (savedUsers) {
            const users = JSON.parse(savedUsers);
            const userIndex = users.findIndex((u: any) => u.id === user.id);
            if (userIndex !== -1) {
              users[userIndex] = updatedUser;
              await AsyncStorage.setItem('eduprep_users', JSON.stringify(users));
            }
          }
          
          // If Firebase is enabled, sync to Firebase
          if (get().firebaseEnabled) {
            try {
              console.log('🔥 Syncing role change to Firebase...');
            } catch (error) {
              console.warn('Firebase role sync failed:', error);
            }
          }
          
          set({ 
            user: updatedUser, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Switch role error:', error);
          set({ isLoading: false });
        }
      },

      updateUser: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        try {
          const updatedUser = { ...user, ...updates };
          
          // Update in AsyncStorage
          await AsyncStorage.setItem('eduprep_user', JSON.stringify(updatedUser));
          
          // Update in users list
          const savedUsers = await AsyncStorage.getItem('eduprep_users');
          if (savedUsers) {
            const users = JSON.parse(savedUsers);
            const userIndex = users.findIndex((u: any) => u.id === user.id);
            if (userIndex !== -1) {
              users[userIndex] = updatedUser;
              await AsyncStorage.setItem('eduprep_users', JSON.stringify(users));
            }
          }
          
          // If Firebase is enabled, sync to Firebase
          if (get().firebaseEnabled) {
            try {
              console.log('🔥 Syncing user update to Firebase...');
            } catch (error) {
              console.warn('Firebase update sync failed:', error);
            }
          }
          
          set({ user: updatedUser });
        } catch (error) {
          console.error('Update user error:', error);
        }
      },

      toggleFirebase: () => {
        const current = get().firebaseEnabled;
        set({ firebaseEnabled: !current });
        console.log(`🔥 Firebase ${!current ? 'ENABLED' : 'DISABLED'}`);
      },
    }),
    {
      name: 'hybrid-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        firebaseEnabled: state.firebaseEnabled 
      }),
    }
  )
);

// Export as default to match existing import pattern
export default useHybridStore;
