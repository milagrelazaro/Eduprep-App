export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  PROMOTER = 'promoter',
}

export enum LessonStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  ESCROW = 'escrow',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'pending' | 'suspended';
  firebaseUid?: string;
  // Profile data
  intendedCourse?: string;
  intendedInstitution?: string;
  competingDisciplines?: string[];
  focus?: 'exams' | 'tutoring' | 'both';

  // Referral system
  referralCode?: string;
  referredBy?: string; // Promoter code if user was referred

  // Tutor-specific fields
  subject?: string;
  price?: number;
  rating?: string;
  reviews?: number;

  // Premium/Subscription fields
  isPremium?: boolean;
  premiumExpiresAt?: Date;
  subscriptionType?: 'monthly' | 'yearly' | 'lifetime';
  subscriptionId?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TutorProfile {
  userId: string;
  bio: string;
  subjects: string[];
  level: string;
  verified: boolean;
  rating: number;
  pricePerHour: number;
  availability: string[];
  examExpert: boolean;
}

export interface Lesson {
  id: string;
  tutorId: string;
  studentId: string;
  tutorName: string;
  studentName: string;
  date: string;
  type: 'online' | 'presencial';
  status: LessonStatus;
  price: number;
  subject: string;
  paymentStatus: PaymentStatus;
  review?: LessonReview;
  startedAt?: string;
  completedAt?: string;
}

export interface LessonReview {
  id: string;
  lessonId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  institution: string;
  subject: string;
  duration: number;
  questions: Question[];
  topics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  year?: number;
  uploadedBy?: string;
  status?: 'pending' | 'approved' | 'rejected';
  aiGenerated?: boolean;
  pdfUrl?: string; // Referência ao arquivo PDF do exame
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
  learnMoreUrl?: string;
  topic?: string;
}

export interface ExamResult {
  id: string;
  examId?: string;
  studentId: string;
  score: number;
  date: string | Date;
  analysis: string;
  examName?: string;
  subject?: string;
  totalQuestions?: number;
  correctAnswers?: number;
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: UserRole;
  content: string;
  image?: string;
  createdAt: string;
  likes: string[];
  comments: FeedComment[];
  shares: string[];
  type: 'news' | 'achievement' | 'announcement';
  achievementData?: {
    examName: string;
    score: number;
    institution: string;
  };
}

export interface FeedComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: string[];
}

export interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  senderId: string;
  senderName: string;
  time: string;
  read: boolean;
}

export type ExamUploadSource = 'pdf' | 'upload';

export interface ExamCatalogItem {
  id: string;
  title: string;
  subject: string;
  institution: string;
  year: number;
  fileName: string;
  pdfUrl?: string;
  size?: string;
  description?: string;
  duration?: number;
  status: 'approved' | 'pending_validation' | 'rejected';
  uploadSource: ExamUploadSource;
  aiProcessed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlan = 'monthly' | 'yearly' | 'lifetime';
export type PaymentMethod = 'mpesa' | 'emola' | 'card';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  expiresAt?: Date;
  price: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  type: 'subscription' | 'lesson';
  subscriptionId?: string;
  lessonId?: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  phoneNumber?: string;
  reference?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

// Referral System Types
export interface Promoter {
  id: string;
  userId: string;
  name: string;
  email: string;
  referralCode: string;
  commissionRate: number; // Percentage (e.g., 10 for 10%)
  totalLeads: number;
  activeLeads: number;
  pendingCommission: number;
  paidCommission: number;
  status: 'active' | 'suspended' | 'inactive';
  paymentData?: {
    mpesaNumber?: string;
    bankAccount?: string;
    bankName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralLead {
  id: string;
  promoterId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  imei: string;
  deviceFingerprint: string;
  activationDate: Date;
  status: 'pending' | 'confirmed' | 'fraud' | 'paid';
  commissionAmount: number;
  paymentDate?: Date;
  fraudReason?: string;
}

export interface ReferralValidation {
  isValid: boolean;
  reason?: string;
  existingLead?: ReferralLead;
}

// Anti-Fraud Types
export interface DeviceFingerprint {
  imei: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  timezone: string;
  createdAt: Date;
}

export interface FraudAlert {
  id: string;
  type: 'duplicate_imei' | 'duplicate_email' | 'duplicate_phone' | 'suspicious_activity';
  userId: string;
  promoterId?: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  createdAt: Date;
}

// Promo Code Types
export interface PromoCode {
  id: string;
  code: string;
  type: 'referral' | 'promotional';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  currentUses: number;
  validFrom: Date;
  validUntil: Date;
  createdBy: string; // Admin ID
  promoterId?: string; // If referral code
  status: 'active' | 'expired' | 'disabled';
}
