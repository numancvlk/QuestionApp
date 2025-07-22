//LIBRARY
import React, { useCallback, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

//MY SCRIPTS
import { RootStackParamList, AppTabParamList } from "./src/navigation/types";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { checkDailyQuestionStatus } from "./src/api/userApi";
import { RootStackNavigationProp } from "./src/navigation/types";

// Screens
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import InitialLanguageSelectionScreen from "./src/screens/core/InitialLanguageSelectionScreen";
import LearningPathScreen from "./src/screens/core/LearningPathScreen";
import LessonDetailScreen from "./src/screens/core/LessonDetailScreen";
import LeaderboardScreen from "./src/screens/core/LeaderboardScreen";
import QuickQuizScreen from "./src/screens/gameModes/QuickQuizScreen";
import TimedQuizScreen from "./src/screens/gameModes/TimedQuizScreen";
import RandomQuestionScreen from "./src/screens/gameModes/RandomQuestionScreen";
import DailyQuestionScreen from "./src/screens/gameModes/DailyQuestionScreen";

//STYLES
import { Colors } from "./src/styles/GlobalStyles/colors";
import { FontSizes } from "./src/styles/GlobalStyles/typography";
import { globalStyles } from "./src/styles/GlobalStyles/globalStyles";

const STACK = createNativeStackNavigator<RootStackParamList>();
const TAB = createBottomTabNavigator<AppTabParamList>();

const AppTabs: React.FC = () => {
  return (
    <TAB.Navigator
      initialRouteName="LearningPathScreen"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === "LearningPathScreen") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "QuickQuizScreen") {
            iconName = focused ? "lightning-bolt" : "lightning-bolt-outline";
          } else if (route.name === "TimedQuizScreen") {
            iconName = focused ? "timer-sand" : "timer-sand";
          } else if (route.name === "RandomQuestionScreen") {
            iconName = focused ? "head-question" : "head-question-outline";
          } else if (route.name === "LeaderboardScreen") {
            iconName = focused ? "trophy" : "trophy-outline";
          } else {
            iconName = "alert-circle";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.accentPrimary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.backgroundSecondary,
          borderTopColor: Colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: FontSizes.xSmall,
        },
      })}
    >
      <TAB.Screen
        name="LearningPathScreen"
        component={LearningPathScreen}
        options={{ title: "Harita" }}
      />
      <TAB.Screen
        name="QuickQuizScreen"
        component={QuickQuizScreen}
        options={{ title: "Hızlı Yarışma" }}
      />
      <TAB.Screen
        name="TimedQuizScreen"
        component={TimedQuizScreen}
        options={{ title: "Zaman Yarışması" }}
      />
      <TAB.Screen
        name="RandomQuestionScreen"
        component={RandomQuestionScreen}
        options={{ title: "Rastgele Soru" }}
      />
      <TAB.Screen
        name="LeaderboardScreen"
        component={LeaderboardScreen}
        options={{ title: "Liderlik" }}
      />
    </TAB.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isLoading, isAuthenticated, user, initialRoute } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp<"AppTabs">>();

  const checkAndShowDailyQuestion = useCallback(async () => {
    if (isAuthenticated && user?.selectedLanguageId && navigation.isFocused()) {
      try {
        const status = await checkDailyQuestionStatus();
        if (!status.hasAnsweredToday) {
          navigation.navigate("DailyQuestionModal");
        }
      } catch (error) {
        console.error("Günün sorusu durumu kontrol hatası:", error);
      }
    }
  }, [isAuthenticated, user?.selectedLanguageId, navigation]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      checkAndShowDailyQuestion();
    }
  }, [isLoading, isAuthenticated, checkAndShowDailyQuestion]);

  if (isLoading || initialRoute === undefined) {
    return (
      <View style={globalStyles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
        <Text style={globalStyles.bodyText}>Uygulama Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <STACK.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <STACK.Screen name="LoginScreen" component={LoginScreen} />
      <STACK.Screen name="RegisterScreen" component={RegisterScreen} />
      <STACK.Screen
        name="InitialLanguageSelectionScreen"
        component={InitialLanguageSelectionScreen}
      />
      <STACK.Screen name="AppTabs" component={AppTabs} />
      <STACK.Screen name="LessonDetailScreen" component={LessonDetailScreen} />
      <STACK.Screen
        name="DailyQuestionModal"
        component={DailyQuestionScreen}
        options={{
          presentation: "modal",
          headerShown: false,
          animation: "fade",
        }}
      />
    </STACK.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
