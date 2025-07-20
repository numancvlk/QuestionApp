export interface User {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  globalScore: number;
  dailyStreak: number;
  lastActiveDate: Date;
  selectedLanguageId?: string | null;
  languageProgress: {
    [key: string]: {
      completedTestIds: string[];
      currentMapNodeId: string | null;
    };
  };
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Language {
  _id: string;
  name: string;
  displayName?: string;
  iconUrl?: string;
  description?: string;
}

export interface BaseExercise {
  type: "text" | "multipleChoice" | "fillInTheBlanks";
  question: string;
  correctAnswer: string;
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

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  language: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  order: number;
  content?: string;
  exercises?: Exercise[];
  createdAt: string;
  updatedAt: string;
}
