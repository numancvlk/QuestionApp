//LIBRARY
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

//MY SCRIPTS
import { AppNavigationProp } from "../../navigation/types";

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
    <View style={styles.container}>
      <Text style={styles.title}>LOG IN</Text>

      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        value={emailOrUsername}
        onChangeText={setEmailOrUsername}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging In..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: "#007bff",
    fontSize: 16,
  },
});

export default LoginScreen;
