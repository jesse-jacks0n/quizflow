/**
 * Type definitions for the Educational Assessment Platform
 */

// ─── Question Types ──────────────────────────────────────────
export type QuestionType = 'multiple-choice' | 'text-input';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  correctAnswer: string; // For MC: option id, for text-input: accepted answer string
  points: number;
  order: number;
}

// ─── Subject & Quiz ──────────────────────────────────────────
export interface Subject {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
  quizCount: number;
}

export interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  accessCode: string;
  questions: Question[];
  published: boolean;
  allowRetry: boolean;
  showFeedback: boolean;
  timeLimit?: number;
  createdAt: number;
  updatedAt: number;
}

// ─── Student & Results ───────────────────────────────────────
export interface StudentAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  subjectId: string;
  studentName: string;
  answers: StudentAnswer[];
  score: number;
  totalPoints: number;
  percentage: number;
  submittedAt: number;
}

// ─── Dashboard Stats ─────────────────────────────────────────
export interface DashboardStats {
  totalSubjects: number;
  totalQuizzes: number;
  totalStudents: number;
  totalSubmissions: number;
  averageScore: number;
  recentResults: QuizResult[];
}

// ─── Helper types ────────────────────────────────────────────
export type NewSubject = Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'quizCount'>;
export type NewQuiz = Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>;
