//LIBRARY
import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";

//MY SCRIPTS
import { getUserProfile, loginUser, registerUser } from "../api/userApi";
import { removeToken } from "../utils/auth";
import { User } from "../types";
import { AppNavigationProp, RootStackParamList } from "../navigation/types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  initialRoute: keyof RootStackParamList | undefined;
  learningPathParams?: { selectedLanguageId: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigation = useNavigation<AppNavigationProp>();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<
    keyof RootStackParamList | undefined
  >(undefined);
  const [learningPathParams, setLearningPathParams] = useState<
    { selectedLanguageId: string } | undefined
  >(undefined);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    let currentUserData: User | null = null;

    try {
      const userToken = await AsyncStorage.getItem("userToken");

      if (userToken) {
        try {
          const fetchedResult = await getUserProfile();

          if (
            fetchedResult &&
            typeof fetchedResult === "object" &&
            "username" in fetchedResult &&
            "_id" in fetchedResult
          ) {
            currentUserData = fetchedResult as User;
          } else {
            await removeToken();
            setIsAuthenticated(false);
            setUser(null);
            currentUserData = null;
          }
        } catch (profileError: any) {
          await removeToken();
          setIsAuthenticated(false);
          setUser(null);
          currentUserData = null;
        }
      }

      if (currentUserData) {
        setUser(currentUserData);
        setIsAuthenticated(true);

        if (currentUserData.selectedLanguageId) {
          setInitialRoute("LearningPathScreen");
          setLearningPathParams({
            selectedLanguageId: currentUserData.selectedLanguageId,
          });
        } else {
          setInitialRoute("InitialLanguageSelectionScreen");
          setLearningPathParams(undefined);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setInitialRoute("LoginScreen");
        setLearningPathParams(undefined);
      }
    } catch (e: any) {
      setUser(null);
      setIsAuthenticated(false);
      setInitialRoute("LoginScreen");
      setLearningPathParams(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: any) => {
      setIsLoading(true);
      try {
        const { token, user: loggedInUser } = await loginUser(credentials);
        await AsyncStorage.setItem("userToken", token);
        setUser(loggedInUser);
        setIsAuthenticated(true);

        if (loggedInUser.selectedLanguageId) {
          navigation.replace("LearningPathScreen", {
            selectedLanguageId: loggedInUser.selectedLanguageId,
          });
        } else {
          navigation.replace("InitialLanguageSelectionScreen");
        }
      } catch (error: any) {
        Alert.alert(
          "Giriş Hatası",
          error.response?.data?.message || "Kullanıcı adı veya şifre yanlış."
        );
        setIsAuthenticated(false);
        setUser(null);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigation, setUser, setIsAuthenticated]
  );

  const register = useCallback(
    async (userData: any) => {
      setIsLoading(true);
      try {
        await registerUser(userData);
        Alert.alert("Başarılı", "Kayıt başarılı! Lütfen giriş yapın.");
        navigation.navigate("LoginScreen");
      } catch (error: any) {
        Alert.alert(
          "Kayıt Hatası",
          error.response?.data?.message || "Kayıt yapılırken bir sorun oluştu."
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigation]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    await removeToken();
    setIsAuthenticated(false);
    setUser(null);
    setInitialRoute("LoginScreen");
    navigation.replace("LoginScreen");
    setIsLoading(false);
  }, [removeToken, navigation, setIsAuthenticated, setUser, setInitialRoute]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const contextValue: AuthContextType = useMemo(
    () => ({
      isAuthenticated,
      user,
      isLoading,
      checkAuthStatus,
      logout,
      login,
      register,
      initialRoute,
      learningPathParams,
    }),
    [
      isAuthenticated,
      user,
      isLoading,
      checkAuthStatus,
      logout,
      login,
      register,
      initialRoute,
      learningPathParams,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
