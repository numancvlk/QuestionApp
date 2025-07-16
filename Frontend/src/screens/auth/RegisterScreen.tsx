// LIBRARY
import React, { useState, useEffect } from "react";
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
import Constants from "expo-constants";

// MY SCRIPTS
import { AppNavigationProp } from "../../navigation/types";

// STYLES
import { registerStyles } from "../../styles/ScreenStyles/RegisterScreen.style";
import { Colors } from "../../styles/GlobalStyles/colors";

const RegisterScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

  useEffect(() => {
    if (!BASE_URL) {
      Alert.alert(
        "Error",
        "API URL is not defined! Please check your app.config.js and .env file."
      );
    }
  }, [BASE_URL]);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (!BASE_URL) {
      Alert.alert("Error", "API URL configuration is missing.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });

      Alert.alert("Success", "Registration successful! You can now log in.");

      navigation.replace("LoginScreen");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        Alert.alert(
          "Registration Error",
          error.response.data.message ||
            "An error occurred during registration."
        );
      } else {
        Alert.alert("Error", "There was a problem during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={registerStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={registerStyles.content}>
        <Text style={registerStyles.title}>Create Your Journey</Text>

        <Text style={registerStyles.subtitle}>
          Sign up to start your coding adventure!
        </Text>

        <TextInput
          style={registerStyles.input}
          placeholder="Username"
          placeholderTextColor={Colors.textPlaceholder}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={registerStyles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textPlaceholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={registerStyles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={registerStyles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={registerStyles.buttonText}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          <Text style={registerStyles.linkText}>
            Already have an account?{" "}
            <Text style={registerStyles.linkTextBold}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
