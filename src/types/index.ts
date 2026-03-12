export enum UserRole {
  STUDENT = 'student',
  TUTOR = 'tutor',
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
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'pending' | 'suspended';
  intendedCourse?: string;
  targetUniversity?: string;
  competingDisciplines?: string[];
  academicGoals?: string;
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
  examId: string;
  examName: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  date: string;
  duration: number;
  analysis: string;
  subjectBreakdown?: { [subject: string]: { correct: number; total: number } };
  weakTopics?: string[];
  recommendedTutors?: string[];
  answers?: { questionId: string; selectedOption: number; correct: boolean }[];
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
