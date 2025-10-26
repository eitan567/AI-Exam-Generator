import type { Part } from "@google/genai";

export type QuestionType = 'single-choice' | 'multiple-choice' | 'open-ended';

export interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  points: number;
  options?: AnswerOption[];
  correctAnswer?: string; // For open-ended questions
  imageUrl?: string;
}

export interface Exam {
  id: string;
  title: string;
  sourceFileNames?: string[];
  duration: number; // in minutes
  questions: Question[];
  status: 'טיוטה' | 'פורסם';
  creationDate: string;
  accessCodes?: Record<string, string>; // studentId -> accessCode
}

export interface ExamFormData {
  id?: string;
  title: string;
  files: File[];
  duration: string;
  numSingleChoice: string;
  numMultipleChoice: string;
  numOpenEnded: string;
}

export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Student {
  id: string; // This will be their unique student ID number
  name: string;
  password: string;
  class: string; // e.g., "כיתה י' 1"
  imageUrl?: string; // URL to a profile picture
  subjects: string[];
}

export type StudentAnswer = string | string[];

export interface Submission {
  examId: string;
  studentId: string;
  answers: Record<string, StudentAnswer>; // question.id -> answer
  score: number;
  totalQuestions: number;
  submittedAt: string; // End time
  startTime: string; // Start time
  completionStatus: 'completed' | 'time_out' | 'quit';
  gradedAnswers?: Record<string, { score: number; feedback: string; }>; // For open-ended questions
}

export interface AppSettings {
  closeChatOnSuggestion: boolean;
  chatPosition: 'left' | 'right';
  isChatFloating: boolean;
  isChatPinned: boolean;
  isChatCollapsed: boolean;
  aiModel: string;
  generateImages: boolean; // Kept for potential future use in questions
  theme: 'light' | 'dark' | 'system';
  _previousChatSettings?: {
    isChatFloating: boolean;
    closeChatOnSuggestion: boolean;
  } | null;
}


export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}