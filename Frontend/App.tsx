// LIBRARY
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// SCREEN
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import HomeScreen from "./src/screens/core/HomeScreen";
import InitialLanguageSelectionScreen from "./src/screens/core/InitialLanguageSelectionScreen";
// MY SCRIPTS
import { RootStackParamList } from "./src/navigation/types";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

const STACK = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isLoading, initialRoute } = useAuth();

  if (isLoading) {
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
    </STACK.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
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
