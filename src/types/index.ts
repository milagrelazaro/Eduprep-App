export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
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
  competingDisciplines?: string[];
  focus?: 'exams' | 'tutoring' | 'both';
  
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
