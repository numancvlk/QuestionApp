//LIBRARY
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";

import { LessonDetailScreenRouteProp } from "../../navigation/types";
import { Lesson as LessonType, Exercise } from "../../types";
import { getLessonById } from "../../api/userApi";

const LessonDetailScreen: React.FC = () => {
  const route = useRoute<LessonDetailScreenRouteProp>();
  const { lessonId } = route.params;

  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedLesson = await getLessonById(lessonId);
        setLesson(fetchedLesson);
      } catch (err: any) {
        console.error("Ders detayı yüklenirken hata oluştu:", err);
        setError("Ders detayı yüklenirken bir sorun oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonDetail();
    } else {
      setError("Ders ID'si bulunamadı.");
      setIsLoading(false);
    }
  }, [lessonId]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Ders Yükleniyor...</Text>
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

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ders bulunamadı.</Text>
      </View>
    );
  }

  const renderExercise = (exercise: Exercise, index: number) => {
    switch (exercise.type) {
      case "text":
        return (
          <View key={index} style={styles.exerciseContainer}>
            <Text style={styles.questionText}>
              Soru {index + 1}: {exercise.question}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Cevabınızı buraya yazın..."
            />
          </View>
        );
      case "multipleChoice":
        return (
          <View key={index} style={styles.exerciseContainer}>
            <Text style={styles.questionText}>
              Soru {index + 1}: {exercise.question}
            </Text>
            {exercise.options?.map((option, optIndex) => (
              <TouchableOpacity key={optIndex} style={styles.optionButton}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case "fillInTheBlanks":
        return (
          <View key={index} style={styles.exerciseContainer}>
            <Text style={styles.questionText}>
              Soru {index + 1}: {exercise.question}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Boşluğu doldurun..."
            />
          </View>
        );
      default:
        return (
          <View key={index} style={styles.exerciseContainer}>
            <Text style={styles.questionText}>Bilinmeyen Egzersiz Tipi</Text>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDescription}>{lesson.description}</Text>

        <Text style={styles.exercisesHeader}>Egzersizler:</Text>
        {lesson.exercises && lesson.exercises.length > 0 ? (
          lesson.exercises.map(renderExercise)
        ) : (
          <Text style={styles.noExercisesText}>
            Bu derste henüz egzersiz yok.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  lessonTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  lessonDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  exercisesHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  exerciseContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#444",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  optionButton: {
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  noExercisesText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});

export default LessonDetailScreen;
