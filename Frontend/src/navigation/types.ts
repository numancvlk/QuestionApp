import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";

export type AppTabParamList = {
  LearningPathScreen: { selectedLanguageId: string | undefined };
  QuickQuizScreen: undefined;
  TimedQuizScreen: undefined;
  RandomQuestionScreen: undefined;
  LeaderboardScreen: undefined;
};

export type RootStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  InitialLanguageSelectionScreen: undefined;
  LessonDetailScreen: { lessonId: string; selectedLanguageId: string };
  AppTabs: {
    screen: keyof AppTabParamList;
    params?: AppTabParamList[keyof AppTabParamList];
  };
  DailyQuestionModal: undefined;
};

export type RootStackNavigationProp<
  RouteName extends keyof RootStackParamList
> = StackNavigationProp<RootStackParamList, RouteName>;

export type AppTabScreenNavigationProp<
  RouteName extends keyof AppTabParamList
> = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, RouteName>,
  RootStackNavigationProp<keyof RootStackParamList>
>;

export type LearningPathScreenNavigationProp =
  AppTabScreenNavigationProp<"LearningPathScreen">;
export type QuickQuizScreenNavigationProp =
  AppTabScreenNavigationProp<"QuickQuizScreen">;

export type DailyQuestionModalNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DailyQuestionModal"
>;

export type LearningPathScreenRouteProp = RouteProp<
  AppTabParamList,
  "LearningPathScreen"
>;

export type LessonDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "LessonDetailScreen"
>;
