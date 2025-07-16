//LIBRARY
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
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

//MY SCRIPTS
import { AppNavigationProp } from "../../navigation/types";

//STYLES
import { loginStyles } from "../../styles/ScreenStyles/LoginScreen.style";
import { Colors } from "../../styles/GlobalStyles/colors";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const LoginScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();

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
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        emailOrUsername,
        password,
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem("userToken", JSON.stringify(token));
      await AsyncStorage.setItem("userData", JSON.stringify(user));

      Alert.alert("Successful", "Login successful!");

      navigation.replace("HomeScreen");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        Alert.alert(
          "Login Error",
          error.response.data.message || "An error occurred."
        );
      } else {
        Alert.alert("Error", "There was a problem while logging in.");
      }
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
