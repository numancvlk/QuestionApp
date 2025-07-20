//LIBRARY
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  HomeScreen: undefined;
  InitialLanguageSelectionScreen: undefined;
  LearningPathScreen: { selectedLanguageId: string };
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type LearningPathScreenRouteProp = RouteProp<
  RootStackParamList,
  "LearningPathScreen"
>;
