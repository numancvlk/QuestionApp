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

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  language: string;
  order: number;
  content?: string;
  createdAt: string;
  updatedAt: string;
}
