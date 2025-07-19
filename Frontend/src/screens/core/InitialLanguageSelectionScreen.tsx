//LIBRARY
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../navigation/types";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

//MY SCRIPTS
import { Language } from "../../types";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
console.log(BASE_URL);
const InitialLanguageSelectionScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { checkAuthStatus } = useAuth();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingLanguage, setSelectingLanguage] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/languages`);
        setLanguages(response.data.languages);
      } catch (error) {
        console.error("Diller getirilirken hata");
        Alert.alert("Hata", "Diller yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  const handleLanguageSelect = async (languageId: string) => {
    setSelectingLanguage(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Hata", "Giriş yapılmamış. Lütfen tekrar giriş yapın.");
        navigation.navigate("LoginScreen");
        return;
      }

      await axios.post(
        `${BASE_URL}/user/select-language`,
        { languageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Başarılı", "Dil başarıyla seçildi!");
      await checkAuthStatus();
    } catch (error) {
      console.error("Dil seçimi kaydedilirken hata");
      Alert.alert("Hata", "Dil seçimi kaydedilirken bir sorun oluştu.");
    } finally {
      setSelectingLanguage(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Diller Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lütfen Bir Dil Seçin</Text>
      <FlatList
        data={languages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.languageItem}
            onPress={() => handleLanguageSelect(item._id)}
            disabled={selectingLanguage}
          >
            <Text style={styles.languageName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      {selectingLanguage && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>Dil Seçiliyor...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  languageItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageName: {
    fontSize: 18,
    fontWeight: "500",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});

export default InitialLanguageSelectionScreen;
