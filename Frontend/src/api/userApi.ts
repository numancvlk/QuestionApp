// LIBRARY
import axios from "axios";
import Constants from "expo-constants";
import { Alert } from "react-native";

// MY SCRIPTS
import { User, Language, Lesson, QuizQuestion } from "../types";
import { getToken, removeToken } from "../utils/auth";

interface DailyQuestionStatus {
  hasAnsweredToday: boolean;
  nextAttemptTime?: string;
}

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await removeToken();
      Alert.alert("Oturum Süresi Doldu", "Lütfen tekrar giriş yapın.");
    }
    return Promise.reject(error);
  }
);

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await API.get("/user/profile");
    return response.data.user;
  } catch (error: any) {
    throw error;
  }
};

export const selectLanguage = async (languageId: string): Promise<User> => {
  try {
    const response = await API.post("/user/select-language", { languageId });
    return response.data.user;
  } catch (error: any) {
    throw error;
  }
};

export const registerUser = async (userData: any): Promise<any> => {
  try {
    const response = await API.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const loginUser = async (
  credentials: any
): Promise<{ token: string; user: User }> => {
  try {
    const response = await API.post("/auth/login", credentials);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getLessonsByLanguage = async (
  languageId: string
): Promise<Lesson[]> => {
  try {
    const response = await API.get(`/lessons/by-language/${languageId}`);
    return response.data.lessons;
  } catch (error: any) {
    throw error;
  }
};

export const getLessonById = async (lessonId: string): Promise<Lesson> => {
  try {
    const response = await API.get(`/lessons/${lessonId}`);
    return response.data.lesson;
  } catch (error: any) {
    throw error;
  }
};

export const getLanguages = async (): Promise<Language[]> => {
  try {
    const response = await API.get("/languages");
    return response.data.languages;
  } catch (error: any) {
    throw error;
  }
};

export const getRandomQuestion = async (
  languageId: string,
  level?: string
): Promise<QuizQuestion> => {
  try {
    const response = await API.get(
      `/lessons/questions/random?languageId=${languageId}${
        level ? `&level=${level}` : ""
      }`
    );
    return response.data.question;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch random question."
    );
  }
};

export const getDailyQuestion = async (
  languageId: string
): Promise<QuizQuestion> => {
  try {
    const response = await API.get(`/lessons/questions/daily/${languageId}`);
    return response.data.question;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch daily question."
    );
  }
};

export const updateScore = async (points: number): Promise<User> => {
  try {
    const response = await API.post("/user/update-global-score", { points });
    return response.data.user;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update score.");
  }
};

export const checkDailyQuestionStatus =
  async (): Promise<DailyQuestionStatus> => {
    try {
      const response = await API.get("/user/daily-status");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to check daily question status."
      );
    }
  };

export const checkDailyQuestionAnswer = async (
  questionId: string,
  selectedAnswer: string
): Promise<{
  isCorrect: boolean;
  explanation?: string;
  pointsEarned: number;
  message: string;
}> => {
  try {
    const response = await API.post(`/lessons/questions/daily/check-answer`, {
      questionId,
      selectedAnswer,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to check daily question answer."
    );
  }
};

export const completeLesson = async (
  lessonId: string,
  earnedPoints: number,
  isDailyQuestion: boolean = false
): Promise<User> => {
  try {
    const response = await API.post("/user/complete-lesson", {
      lessonId,
      earnedPoints,
      isDailyQuestion,
    });
    return response.data.user;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to complete lesson."
    );
  }
};

export const getQuickQuizQuestions = async (
  languageId: string,
  level?: string
): Promise<QuizQuestion[]> => {
  try {
    const response = await API.get(
      `/lessons/questions/quick-quiz?languageId=${languageId}${
        level ? `&level=${level}` : ""
      }`
    );
    return response.data.questions;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch quick quiz questions."
    );
  }
};

export const getTimedQuizQuestions = async (
  languageId: string,
  level?: string
): Promise<QuizQuestion[]> => {
  try {
    const response = await API.get(
      `/lessons/questions/timed-quiz?languageId=${languageId}${
        level ? `&level=${level}` : ""
      }`
    );
    return response.data.questions;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch timed quiz questions."
    );
  }
};

export const checkQuizAnswer = async (
  questionId: string,
  selectedAnswer: string
): Promise<{
  isCorrect: boolean;
  explanation?: string;
  pointsEarned: number;
  message: string;
}> => {
  try {
    const response = await API.post(`/lessons/questions/check-answer`, {
      questionId,
      selectedAnswer,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to check quiz answer."
    );
  }
};
