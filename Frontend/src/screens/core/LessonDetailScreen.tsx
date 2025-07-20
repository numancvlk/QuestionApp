//LIBRARY
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

//MY SCRIPTS
import axiosInstance from "../../utils/axiosInstance";
import { Lesson, Exercise, UserProfileResponse } from "../../types";
import { RootStackParamList } from "../../navigation/types";

type LessonDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "LessonDetailScreen"
>;
type LessonDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LessonDetailScreen"
>;

const LessonDetailScreen: React.FC = () => {
  const route = useRoute<LessonDetailScreenRouteProp>();
  const navigation = useNavigation<LessonDetailScreenNavigationProp>();
  const { lessonId, selectedLanguageId } = route.params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<
    "intro" | "exercises" | "summary"
  >("intro");

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState<number>(0);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  useEffect(() => {
    const fetchLessonDetail = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/lessons/${lessonId}`);
        const fetchedLesson: Lesson = response.data.lesson;
        setLesson(fetchedLesson);
        setTotalQuestions(fetchedLesson.exercises?.length || 0);
        setError(null);
      } catch (err) {
        console.error("Ders detayları yüklenirken hata oluştu:", err);
        setError("Ders detayları yüklenemedi.");
        Alert.alert("Hata", "Ders detayları yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonDetail();
  }, [lessonId]);

  const checkAnswer = () => {
    if (
      !lesson ||
      !lesson.exercises ||
      !lesson.exercises[currentExerciseIndex]
    ) {
      Alert.alert("Hata", "Egzersiz verisi eksik.");
      return;
    }

    const currentExercise: Exercise = lesson.exercises[currentExerciseIndex];

    if (userAnswer.trim() === "") {
      Alert.alert("Uyarı", "Lütfen bir cevap girin/seçin.");
      return;
    }

    setIsAnswerSubmitted(true);
    let isMatch = false;

    if (typeof currentExercise.correctAnswer === "string") {
      const correct = currentExercise.correctAnswer.toLowerCase().trim();
      const user = userAnswer.toLowerCase().trim();
      isMatch = user === correct;
    } else if (Array.isArray(currentExercise.correctAnswer)) {
      const userTrimmed = userAnswer.toLowerCase().trim();
      isMatch = currentExercise.correctAnswer.some(
        (ans: string) => ans.toLowerCase().trim() === userTrimmed
      );
    }

    if (isMatch) {
      setFeedback("Doğru!");
      setIsCorrect(true);
      setCorrectAnswersCount((prev) => prev + 1);
      setEarnedPoints((prev) => prev + (currentExercise.points || 0));
    } else {
      const displayCorrectAnswer = Array.isArray(currentExercise.correctAnswer)
        ? currentExercise.correctAnswer.join(", ")
        : currentExercise.correctAnswer;
      setFeedback(`Yanlış. Doğru cevap: "${displayCorrectAnswer}"`);
      setIsCorrect(false);
      setWrongAnswersCount((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (!lesson || !lesson.exercises) {
      Alert.alert("Hata", "Ders verisi eksik. İlerleme kaydedilemiyor.");
      return;
    }

    if (!isAnswerSubmitted) {
      Alert.alert("Uyarı", "Lütfen soruyu cevaplayın.");
      return;
    }

    setUserAnswer("");
    setFeedback("");
    setIsAnswerSubmitted(false);
    setIsCorrect(null);

    const nextIndex = currentExerciseIndex + 1;

    if (nextIndex < lesson.exercises.length) {
      setCurrentExerciseIndex(nextIndex);
    } else {
      await completeLessonOnBackend();
      setCurrentStep("summary");
    }
  };

  const completeLessonOnBackend = async () => {
    if (!lesson) return;
    try {
      const response = await axiosInstance.post<UserProfileResponse>(
        "/user/complete-lesson",
        {
          lessonId: lesson._id,
          earnedPoints: earnedPoints,
        }
      );

      if (response.data.success) {
        console.log("Ders başarıyla tamamlandı:", response.data.message);
      } else {
        Alert.alert(
          "Hata",
          response.data.message || "Dersi tamamlarken bir sorun oluştu."
        );
      }
    } catch (error: any) {
      console.error(
        "Ders tamamlama API hatası:",
        error.response?.data || error.message
      );
      Alert.alert("Hata", "Dersi tamamlarken bir sunucu hatası oluştu.");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Ders yükleniyor...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!lesson || !lesson.exercises) {
      return (
        <View style={styles.centered}>
          <Text>
            Ders verisi veya egzersizler mevcut değil. Lütfen daha sonra tekrar
            deneyin.
          </Text>
        </View>
      );
    }

    const currentLesson = lesson;
    const currentExercises = lesson.exercises;

    switch (currentStep) {
      case "intro":
        return (
          <ScrollView contentContainerStyle={styles.introContainer}>
            <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
            <Text style={styles.lessonDescription}>
              {currentLesson.description}
            </Text>
            <Text style={styles.lessonInfo}>
              Toplam Soru: {currentExercises.length}
            </Text>
            <Text style={styles.lessonInfo}>
              Zorluk Seviyesi: {currentLesson.level}
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                if (currentExercises.length > 0) {
                  setCurrentStep("exercises");
                } else {
                  Alert.alert(
                    "Uyarı",
                    "Bu derste henüz egzersiz bulunmamaktadır."
                  );
                }
              }}
            >
              <Text style={styles.startButtonText}>Derse Başla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Geri Dön</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case "exercises":
        const currentExercise = currentExercises[currentExerciseIndex];
        if (!currentExercise) {
          return (
            <View style={styles.centered}>
              <Text>
                Egzersiz bulunamadı veya yüklenemedi (geçersiz index).
              </Text>
            </View>
          );
        }
        return (
          <ScrollView contentContainerStyle={styles.exerciseContainer}>
            <Text style={styles.questionCounter}>
              Soru {currentExerciseIndex + 1} / {currentExercises.length}
            </Text>
            <Text style={styles.questionText}>{currentExercise.question}</Text>

            {currentExercise.type === "multipleChoice" && (
              <View style={styles.optionsContainer}>
                {currentExercise.options?.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      userAnswer === option && styles.selectedOption,
                      isAnswerSubmitted &&
                        typeof currentExercise.correctAnswer === "string" &&
                        currentExercise.correctAnswer.toLowerCase() ===
                          option.toLowerCase() &&
                        styles.correctOption,
                      isAnswerSubmitted &&
                        !isCorrect &&
                        userAnswer === option &&
                        styles.wrongOption,
                    ]}
                    onPress={() => !isAnswerSubmitted && setUserAnswer(option)}
                    disabled={isAnswerSubmitted}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {(currentExercise.type === "text" ||
              currentExercise.type === "fillInTheBlanks") && (
              <TextInput
                style={styles.textInput}
                placeholder={
                  currentExercise.type === "text"
                    ? "Cevabınızı buraya yazın..."
                    : "Boşluğu doldurun..."
                }
                value={userAnswer}
                onChangeText={setUserAnswer}
                editable={!isAnswerSubmitted}
              />
            )}

            {isAnswerSubmitted && feedback && (
              <Text
                style={[
                  styles.feedbackText,
                  isCorrect ? styles.correctFeedback : styles.wrongFeedback,
                ]}
              >
                {feedback}
              </Text>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={isAnswerSubmitted ? handleNext : checkAnswer}
            >
              <Text style={styles.submitButtonText}>
                {isAnswerSubmitted ? "Sonraki Soru" : "Cevabı Kontrol Et"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case "summary":
        const motivationMessages = [
          "Tebrikler! Harikaydın!",
          "Muhteşem bir iş çıkardın, böyle devam et!",
          "Gelişimini görmek harika!",
          "Bir sonraki ders için hazırsın!",
          "Başarın ilham verici!",
          "Dil öğrenme yolculuğunda bir adımı daha tamamladın!",
        ];
        const randomMotivation =
          motivationMessages[
            Math.floor(Math.random() * motivationMessages.length)
          ];

        return (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Ders Tamamlandı!</Text>
            <Text style={styles.motivationText}>{randomMotivation}</Text>
            <View style={styles.summaryStats}>
              <Text style={styles.summaryStatText}>
                Toplam Soru: {totalQuestions}
              </Text>
              <Text style={styles.summaryStatText}>
                Doğru Cevap: {correctAnswersCount}
              </Text>
              <Text style={styles.summaryStatText}>
                Yanlış Cevap: {wrongAnswersCount}
              </Text>
              <Text style={styles.summaryPointsText}>
                Kazanılan Puan: {earnedPoints}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.backToPathButton}
              onPress={() => {
                if (selectedLanguageId) {
                  navigation.navigate("LearningPathScreen", {
                    selectedLanguageId: selectedLanguageId,
                  });
                } else {
                  Alert.alert(
                    "Hata",
                    "Öğrenme Yoluna geri dönmek için dil bilgisi eksik. Lütfen tekrar deneyin."
                  );
                }
              }}
            >
              <Text style={styles.backToPathButtonText}>
                Öğrenme Yoluna Geri Dön
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  introContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  lessonTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  lessonDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  lessonInfo: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  startButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 30,
    width: "80%",
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },

  exerciseContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  questionCounter: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  selectedOption: {
    backgroundColor: "#cceeff",
    borderColor: "#007AFF",
  },
  correctOption: {
    backgroundColor: "#d4edda",
    borderColor: "#28a745",
  },
  wrongOption: {
    backgroundColor: "#f8d7da",
    borderColor: "#dc3545",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
  textInput: {
    width: "90%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  feedbackText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  correctFeedback: {
    color: "#28a745",
  },
  wrongFeedback: {
    color: "#dc3545",
  },

  summaryContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  summaryTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  motivationText: {
    fontSize: 20,
    color: "#007AFF",
    fontStyle: "italic",
    marginBottom: 30,
    textAlign: "center",
  },
  summaryStats: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    alignItems: "center",
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryStatText: {
    fontSize: 18,
    color: "#555",
    marginBottom: 10,
  },
  summaryPointsText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#28a745",
    marginTop: 10,
  },
  backToPathButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  backToPathButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LessonDetailScreen;
