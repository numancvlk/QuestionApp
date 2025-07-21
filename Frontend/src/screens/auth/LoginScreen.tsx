// LIBRARY
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// MY SCRIPTS
import { RootStackNavigationProp } from "../../navigation/types";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/userApi";

// STYLES
import { loginStyles } from "../../styles/ScreenStyles/LoginScreen.style";
import { Colors } from "../../styles/GlobalStyles/colors";

const LoginScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp<"LoginScreen">>();
  const { checkAuthStatus } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const { token, user } = await loginUser({ emailOrUsername, password });

      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));

      Alert.alert("Successful", "Login successful!");

      await checkAuthStatus();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during login.";
      Alert.alert("Login Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={loginStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={loginStyles.content}>
        <Text style={loginStyles.title}>Welcome Back!</Text>

        <Text style={loginStyles.subtitle}>
          Log in to continue your coding journey.
        </Text>

        <TextInput
          style={loginStyles.input}
          placeholder="Username or Email"
          placeholderTextColor={Colors.textPlaceholder}
          value={emailOrUsername}
          onChangeText={setEmailOrUsername}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={loginStyles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={loginStyles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={loginStyles.buttonText}>
            {loading ? "Logging In..." : "Login"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
          <Text style={loginStyles.linkText}>
            Don't have an account?{" "}
            <Text style={loginStyles.linkTextBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
