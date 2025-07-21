//LIBRARY
import axios from "axios";
import Constants from "expo-constants";
import { Alert } from "react-native";

//MY SCRIPTS
import { User, Language, Lesson } from "../types";
import { getToken, removeToken } from "../utils/auth";

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

// Oturum açmış olan kullanıcının profil bilgileri
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await API.get("/user/profile");
    return response.data.user;
  } catch (error: any) {
    throw error;
  }
};

//Kullanıcının öğrenmek istediği dili backend'de kaydeder
export const selectLanguage = async (languageId: string): Promise<User> => {
  try {
    const response = await API.post("/user/select-language", { languageId });
    return response.data.user;
  } catch (error: any) {
    throw error;
  }
};

//kullanıcı hesabı oluşturmak için kullanılır.
export const registerUser = async (userData: any): Promise<any> => {
  try {
    const response = await API.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

//LOGİN İŞLEMLERİ İÇİN
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

//Belirli bir dil ID'sine ait olan tüm dersleri çeker
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

//Belirli bir dersin tekil detaylarını (başlık, açıklama, egzersizler vb.) backend'den çeker.
export const getLessonById = async (lessonId: string): Promise<Lesson> => {
  try {
    const response = await API.get(`/lessons/${lessonId}`);
    return response.data.lesson;
  } catch (error: any) {
    throw error;
  }
};

//Uygulamada mevcut olan tüm dillerin listesini çeker
export const getLanguages = async (): Promise<Language[]> => {
  try {
    const response = await API.get("/languages");
    return response.data.languages;
  } catch (error: any) {
    throw error;
  }
};
