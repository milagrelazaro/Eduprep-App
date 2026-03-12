import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { authService } from '../services/firebaseService';

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

export const useFirebaseAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,

      setUser: (user) => set({ user, isLoading: false }),

      login: async (email: string, name: string, role: UserRole) => {
        try {
          set({ isLoading: true });
          
          // Try to sign in or create user
          let userData: User;
          try {
            userData = await authService.signIn(email, 'password'); // For now, using dummy password
          } catch (error) {
            // User doesn't exist, create new user
            userData = await authService.signUp(email, 'password', name, role);
          }
          
          set({ user: userData, isLoading: false });
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          // Firebase auth logout would go here
          set({ user: null, isLoading: false });
        } catch (error) {
          console.error('Logout error:', error);
          set({ isLoading: false });
        }
      },

      loadUser: async () => {
        try {
          set({ isLoading: true });
          
          // For now, we'll load from persisted storage
          // In real implementation, we'd check Firebase Auth state
          const persisted = get().user;
          
          if (persisted) {
            // Refresh user data from Firestore
            const refreshedUser = await authService.userService?.getUserById(persisted.id);
            if (refreshedUser) {
              set({ user: refreshedUser });
            }
          }
          
          set({ isLoading: false });
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
          
          await authService.userService?.updateUser(user.id, { role: newRole });
          
          set({ 
            user: { ...user, role: newRole }, 
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
          await authService.userService?.updateUser(user.id, updates);
          
          set({ 
            user: { ...user, ...updates } 
          });
        } catch (error) {
          console.error('Update user error:', error);
        }
      },
    }),
    {
      name: 'firebase-auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Export as default to match existing import pattern
export default useFirebaseAuthStore;
