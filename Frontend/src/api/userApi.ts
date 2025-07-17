//LIBRARY
import axios from "axios";
import Constants from "expo-constants";

//MY SCRIPTS
import { User } from "../types";
import { getToken } from "../utils/auth";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await API.get("/user/profile");
    return response.data.user;
  } catch (error) {
    console.error("Error fetching user profile");
    throw error;
  }
};

export const selectLanguage = async (languageId: string): Promise<User> => {
  try {
    const response = await API.post("/user/select-language", { languageId });
    return response.data.user;
  } catch (error) {
    console.error("Error saving language selection");
    throw error;
  }
};
