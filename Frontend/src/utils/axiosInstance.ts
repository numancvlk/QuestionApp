//LIBRARY
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    } catch (error) {
      console.error("Failed to retrieve token from AsyncStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject("erroRr");
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      await AsyncStorage.removeItem("userToken");
      console.warn("Authentication token expired or invalid. User logged out.");
      return Promise.reject("erroRr");
    }
    return Promise.reject("erroRr");
  }
);

export default axiosInstance;
