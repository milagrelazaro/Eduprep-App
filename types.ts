
export enum UserRole {
  STUDENT = 'student',
  TUTOR = 'tutor',
  ADMIN = 'admin'
}

export enum LessonStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'pending' | 'suspended';
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
  date: string;
  type: 'online' | 'presencial';
  status: LessonStatus;
  price: number;
  subject: string;
}

export interface Exam {
  id: string;
  institution: string;
  subject: string;
  duration: number; // in minutes
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  date: string;
  analysis: string;
}
