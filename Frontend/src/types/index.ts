export type ObjectId = string;

export interface User {
  _id: ObjectId;
  username: string;
  email: string;
  globalScore: number;
  dailyStreak: number;
  lastActiveDate: string;
  role: "user" | "admin";
  selectedLanguageId?: ObjectId | null;
  languageProgress: {
    [key: string]: {
      completedLessonIds: ObjectId[];
      lastVisitedLessonId: ObjectId | null;
    };
  };
  achievements: string[];
  lastDailyQuestionAnswered?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Language {
  _id: ObjectId;
  name: string;
  displayName?: string;
  iconUrl?: string;
  description?: string;
  code?: string;
  flagEmoji?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseExercise {
  _id?: ObjectId;
  type: "text" | "multipleChoice" | "fillInTheBlanks";
  question: string;
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface TextExercise extends BaseExercise {
  type: "text";
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: "multipleChoice";
  options: string[];
}

export interface FillInTheBlanksExercise extends BaseExercise {
  type: "fillInTheBlanks";
}

export type Exercise =
  | TextExercise
  | MultipleChoiceExercise
  | FillInTheBlanksExercise;

// --- Ders Tipleri ---
export interface Lesson {
  _id: ObjectId;
  title: string;
  description?: string;
  language: Language;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  order: number;
  content?: string;
  exercises?: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  lessonId?: string;
  type?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  token?: string;
  data?: T;
}

export interface UserProfileResponse {
  success: boolean;
  message?: string;
  user: User;
}

export interface LessonsResponse {
  success: boolean;
  lessons: Lesson[];
}

export interface LessonResponse {
  success: boolean;
  lesson: Lesson;
}

export interface RandomQuestionResponse {
  success: boolean;
  question: QuizQuestion;
}

export interface DailyQuestionResponse {
  success: boolean;
  question: QuizQuestion;
}

export interface DailyQuestionStatusResponse {
  success: boolean;
  hasAnsweredToday: boolean;
  nextAttemptTime?: string;
}
