//LIBRARY
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../navigation/types";

//MY SCRIPTS
import { useAuth } from "../../context/AuthContext";
import { selectLanguage, getLanguages } from "../../api/userApi";
import { Language as LanguageType } from "../../types";

const InitialLanguageSelectionScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { checkAuthStatus } = useAuth();

  const [languages, setLanguages] = useState<LanguageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedLanguages = await getLanguages();
        setLanguages(fetchedLanguages);
      } catch (err: any) {
        console.error("Diller yüklenirken hata oluştu:", err);
        setError("Diller yüklenirken bir sorun oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  const handleLanguageSelect = async (languageId: string) => {
    try {
      setIsLoading(true);
      const updatedUser = await selectLanguage(languageId);

      await checkAuthStatus();

      Alert.alert(
        "Başarılı",
        `${updatedUser.username} için dil başarıyla seçildi!`
      );

      navigation.replace("LearningPathScreen", {
        selectedLanguageId: languageId,
      });
    } catch (error: any) {
      console.error(
        "Dil seçimi kaydedilirken hata oluştu:",
        error.response?.data?.message || error.message
      );
      Alert.alert(
        "Hata",
        error.response?.data?.message ||
          "Dil seçimi kaydedilirken bir sorun oluştu."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Diller Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bir Dil Seçin</Text>
      <FlatList
        data={languages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.languageItem}
            onPress={() => handleLanguageSelect(item._id)}
          >
            <Text style={styles.languageName}>
              {item.displayName || item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
};

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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
  },
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: "#f0f0f0",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  languageItem: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  languageName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#444",
  },
});

export default InitialLanguageSelectionScreen;
