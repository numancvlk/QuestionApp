// App.tsx

// LIBRARY IMPORTS
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// SCREEN IMPORTS
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import HomeScreen from "./src/screens/core/HomeScreen";
import InitialLanguageSelectionScreen from "./src/screens/core/InitialLanguageSelectionScreen";
// MY SCRIPTS IMPORTS
import { RootStackParamList } from "./src/navigation/types"; // Navigasyon tipleri
import { AuthProvider, useAuth } from "./src/context/AuthContext"; // AuthContext ve useAuth hook'u

// Bir Native Stack Navigator örneği oluşturuyoruz
const STACK = createNativeStackNavigator<RootStackParamList>();

/**
 * AppNavigator bileşeni, kimlik doğrulama durumu ve kullanıcının dil seçimine göre ana navigasyon mantığını yönetir.
 */
const AppNavigator: React.FC = () => {
  // useAuth hook'undan kimlik doğrulama durumu, yükleme durumu ve başlangıç rotasını alıyoruz
  const { isLoading, initialRoute } = useAuth();

  // Yükleme durumu devam ederken bir ActivityIndicator göster
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Uygulama Yükleniyor...</Text>
      </View>
    );
  }

  // Yükleme tamamlandığında navigatörü render et
  return (
    <STACK.Navigator
      screenOptions={{ headerShown: false }} // Tüm ekranlar için başlık çubuğunu gizle
      initialRouteName={initialRoute} // AuthContext'ten gelen dinamik olarak belirlenen başlangıç rotası
    >
      {/* Tanımladığımız tüm ekranlar */}
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

/**
 * Ana App bileşeni, tüm uygulamayı NavigationContainer ve AuthProvider ile sarmalar.
 */
export default function App() {
  return (
    <NavigationContainer>
      {/* AuthProvider, kimlik doğrulama durumunu tüm alt bileşenlere sağlar */}
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}

// Yükleme durumu için stil tanımlamaları
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
