//LIBRARY
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

//MY SCRIPTS
import {
  LearningPathScreenRouteProp,
  AppNavigationProp,
} from "../../navigation/types";
import { Lesson as LessonType } from "../../types";
import { getLessonsByLanguage } from "../../api/userApi";

const LearningPathScreen: React.FC = () => {
  const route = useRoute<LearningPathScreenRouteProp>();
  const navigation = useNavigation<AppNavigationProp>();

  const selectedLanguageId = route.params?.selectedLanguageId || null;

  const [lessons, setLessons] = useState<LessonType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(selectedLanguageId);
  useEffect(() => {
    if (!selectedLanguageId) {
      setError("Öğrenilecek dil seçilmedi veya geçersiz bir dil ID'si alındı.");
      setIsLoading(false);
      Alert.alert(
        "Hata",
        "Öğrenilecek dil bulunamadı. Lütfen bir dil seçmek için geri dönün.",
        [
          {
            text: "Tamam",
            onPress: () => navigation.replace("InitialLanguageSelectionScreen"),
          },
        ]
      );
      return;
    }

    const fetchLessons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedLessons = await getLessonsByLanguage(selectedLanguageId);
        setLessons(fetchedLessons);
      } catch (err: any) {
        console.error("Dersler yüklenirken hata oluştu:", err);
        setError("Dersler yüklenirken bir sorun oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [selectedLanguageId, navigation]);

  const handleLessonPress = (lessonId: string) => {
    navigation.navigate("LessonDetailScreen", { lessonId });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Dersler Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!selectedLanguageId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Yönlendirme hatası: Geçersiz dil seçimi.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Öğrenme Yolu (Dil ID: {selectedLanguageId})
      </Text>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.lessonItem}
            onPress={() => handleLessonPress(item._id)}
          >
            <Text style={styles.lessonTitle}>
              {item.order}. {item.title}
            </Text>
            <Text style={styles.lessonDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
    backgroundColor: "#f0f0f0",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  lessonItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
  },
  lessonDescription: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});

export default LearningPathScreen;
