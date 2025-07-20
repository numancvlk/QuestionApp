//LIBRARY
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

//MY SCRIPTS
import { RootStackParamList } from "./src/navigation/types";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

// Screens
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import HomeScreen from "./src/screens/core/HomeScreen";
import InitialLanguageSelectionScreen from "./src/screens/core/InitialLanguageSelectionScreen";
import LearningPathScreen from "./src/screens/core/LearningPathScreen";

const STACK = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isLoading, initialRoute, learningPathParams } = useAuth();

  if (isLoading || initialRoute === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Uygulama Yükleniyor...</Text>
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
      <STACK.Screen name="HomeScreen" component={HomeScreen} />
      <STACK.Screen
        name="InitialLanguageSelectionScreen"
        component={InitialLanguageSelectionScreen}
      />
      <STACK.Screen
        name="LearningPathScreen"
        component={LearningPathScreen}
        initialParams={
          initialRoute === "LearningPathScreen" ? learningPathParams : undefined
        }
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});
