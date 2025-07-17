//LIBRARY
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "userToken";

export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log("Token kaydedildi.");
  } catch (error) {
    console.error("Token kaydedilirken hata oluştu:", error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Token alınırken hata oluştu:", error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log("Token silindi.");
  } catch (error) {
    console.error("Token silinirken hata oluştu:", error);
  }
};
