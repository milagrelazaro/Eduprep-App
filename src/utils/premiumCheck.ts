import { User, UserRole } from '../types';

/**
 * Verifica se o usuário tem acesso premium
 */
export const isPremiumUser = (user: User | null): boolean => {
  if (!user) return false;
  
  // Admin sempre tem acesso premium
  if (user.role === UserRole.ADMIN) return true;
  
  // Verificar se é premium e não expirou
  if (user.isPremium) {
    // Se não tem data de expiração, é vitalício
    if (!user.premiumExpiresAt) return true;
    
    // Verificar se não expirou
    const now = new Date();
    const expiresAt = new Date(user.premiumExpiresAt);
    return now < expiresAt;
  }
  
  return false;
};

/**
 * Verifica se pode acessar exame completo
 */
export const canAccessFullExam = (user: User | null): boolean => {
  return isPremiumUser(user);
};

/**
 * Verifica se pode marcar aula
 */
export const canBookLesson = (user: User | null): boolean => {
  return isPremiumUser(user);
};

/**
 * Retorna o status da assinatura
 */
export const getSubscriptionStatus = (user: User | null): 'free' | 'premium' | 'expired' => {
  if (!user) return 'free';
  
  if (user.role === UserRole.ADMIN) return 'premium';
  
  if (user.isPremium) {
    if (!user.premiumExpiresAt) return 'premium'; // Vitalício
    
    const now = new Date();
    const expiresAt = new Date(user.premiumExpiresAt);
    
    if (now < expiresAt) return 'premium';
    return 'expired';
  }
  
  return 'free';
};

/**
 * Retorna dias restantes da assinatura
 */
export const getDaysRemaining = (user: User | null): number | null => {
  if (!user || !user.isPremium || !user.premiumExpiresAt) return null;
  
  const now = new Date();
  const expiresAt = new Date(user.premiumExpiresAt);
  const diff = expiresAt.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  return days > 0 ? days : 0;
};
