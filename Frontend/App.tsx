// LIBRARY
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// SCREENS
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import HomeScreen from "./src/screens/core/HomeScreen";

// MY SCRIPTS
import { RootStackParamList } from "./src/navigation/types";

const STACK = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (userToken) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error("Failed to load user token from AsyncStorage:", e);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    const unsubscribe = navigationRef?.addListener("state", () => {
      checkAuthStatus();
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading App...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={setNavigationRef}>
      <STACK.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? "HomeScreen" : "LoginScreen"}
      >
        <STACK.Screen name="LoginScreen" component={LoginScreen} />
        <STACK.Screen name="RegisterScreen" component={RegisterScreen} />
        <STACK.Screen name="HomeScreen" component={HomeScreen} />
      </STACK.Navigator>
    </NavigationContainer>
  );
}

let navigationRef: NavigationContainerRef<RootStackParamList> | null;

function setNavigationRef(ref: NavigationContainerRef<RootStackParamList>) {
  navigationRef = ref;
}
