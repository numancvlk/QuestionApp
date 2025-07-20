//LIBRARY
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  HomeScreen: undefined;
  InitialLanguageSelectionScreen: undefined;
  LearningPathScreen: { selectedLanguageId: string };
  LessonDetailScreen: { lessonId: string; selectedLanguageId: string };
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type LearningPathScreenRouteProp = RouteProp<
  RootStackParamList,
  "LearningPathScreen"
>;
export type LessonDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "LessonDetailScreen"
>;
