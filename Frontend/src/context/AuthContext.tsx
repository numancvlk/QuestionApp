//LIBRARY
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

//MY SCRIPTS
import { getUserProfile } from "../api/userApi";
import { removeToken } from "../utils/auth";
import { User } from "../types";
import { RootStackParamList } from "../navigation/types";

interface AuthContextType {
  isAuthenticated: boolean | null;
  user: User | null;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
  initialRoute: keyof RootStackParamList;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>("LoginScreen");

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem("userToken");

      if (userToken) {
        try {
          const fetchedUser = await getUserProfile();
          setUser(fetchedUser);
          setIsAuthenticated(true);

          if (fetchedUser.selectedLanguageId) {
            setInitialRoute("HomeScreen");
          } else {
            setInitialRoute("InitialLanguageSelectionScreen");
          }
        } catch (profileError: any) {
          console.error(
            "Kullanıcı profili çekilemedi veya token geçersiz:",
            profileError
          );
          await removeToken();
          setIsAuthenticated(false);
          setUser(null);
          setInitialRoute("LoginScreen");
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setInitialRoute("LoginScreen");
      }
    } catch (e) {
      console.error("AsyncStorage'den token yüklenirken hata oluştu");
      setIsAuthenticated(false);
      setUser(null);
      setInitialRoute("LoginScreen");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await removeToken();
    setIsAuthenticated(false);
    setUser(null);
    setInitialRoute("LoginScreen");
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    checkAuthStatus,
    logout,
    initialRoute,
  };

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
