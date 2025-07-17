//LIBRARY
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  HomeScreen: undefined;
  InitialLanguageSelectionScreen: undefined;
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
