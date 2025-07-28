// LIBRARY
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

//MY SCRIPTS
import axiosInstance from "../../utils/axiosInstance";
import { Lesson } from "../../types";
import {
  RootStackNavigationProp,
  LessonDetailScreenRouteProp,
} from "../../navigation/types";
import { useAuth } from "../../context/AuthContext";
import { getRandomMotivationMessage } from "../../utils/motivationMessages";
import QuizAnswerFeedback from "../../components/QuizFeedbackModal";
import { checkQuizAnswer, updateScore } from "../../api/userApi";

// STYLES
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";
import { Colors } from "../../styles/GlobalStyles/colors";
import { lessonDetailStyles } from "../../styles/ScreenStyles/LessonDetailScreen.style";

const LessonDetailScreen: React.FC = () => {
  const route = useRoute<LessonDetailScreenRouteProp>();
  const navigation =
    useNavigation<RootStackNavigationProp<"LessonDetailScreen">>();
  const { lessonId } = route.params;
  const { user, checkAuthStatus } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<
    "intro" | "exercises" | "feedback" | "summary" | "noQuestions"
  >("intro");

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<string>("");
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [showFeedbackArea, setShowFeedbackArea] = useState(false);

  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState<number>(0);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [motivationText, setMotivationText] = useState<string>("");

  const [isScoreUpdating, setIsScoreUpdating] = useState(false);
  const [scoreUpdateCompleted, setScoreUpdateCompleted] = useState(false);

  const userLanguageId = user?.selectedLanguageId;

  useEffect(() => {
    const fetchLessonDetail = async () => {
      if (!userLanguageId) {
        setError("Ders yüklemek için seçili bir dil bulunamadı.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`[LessonDetailScreen] Ders çekiliyor: ${lessonId}`);
        const response = await axiosInstance.get(`/lessons/${lessonId}`);
        const fetchedLesson: Lesson = response.data.lesson;
        setLesson(fetchedLesson);
        setTotalQuestions(fetchedLesson.exercises?.length || 0);
        setError(null);
        console.log(
          `[LessonDetailScreen] Ders ${fetchedLesson.title} yüklendi.`
        );
      } catch (err) {
        console.error("Ders detayları yüklenirken hata oluştu:", err);
        setError("Ders detayları yüklenemedi.");
        Alert.alert("Hata", "Ders detayları yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonDetail();
  }, [lessonId, userLanguageId]);

  useEffect(() => {
    const getMotivation = () => {
      if (currentStep === "summary" && userLanguageId) {
        const message = getRandomMotivationMessage(
          userLanguageId,
          "lesson_complete"
        );
        setMotivationText(message);
      }
    };
    getMotivation();
  }, [currentStep, userLanguageId]);

  const handleAnswer = async () => {
    const currentExercise = lesson?.exercises?.[currentExerciseIndex];

    if (!currentExercise) {
      Alert.alert("Hata", "Egzersiz bilgisi bulunamadı.");
      return;
    }

    if (!currentExercise._id) {
      Alert.alert(
        "Hata",
        "Egzersiz ID'si bulunamadı. Lütfen dersi tekrar yükleyin."
      );
      return;
    }

    let answerToEvaluate: string = "";

    if (currentExercise.type === "multipleChoice") {
      if (selectedOption === null) {
        Alert.alert("Uyarı", "Lütfen bir seçenek seçin.");
        return;
      }
      answerToEvaluate = selectedOption;
    } else {
      if (userAnswer.trim() === "") {
        Alert.alert("Uyarı", "Lütfen bir cevap girin.");
        return;
      }
      answerToEvaluate = userAnswer;
    }

    if (answerToEvaluate === undefined || answerToEvaluate === null) {
      Alert.alert(
        "Hata",
        "Cevap değerlendirilirken beklenmedik bir sorun oluştu."
      );
      return;
    }

    try {
      const result = await checkQuizAnswer(
        currentExercise._id as string,
        answerToEvaluate as string
      );

      setIsCorrectAnswer(result.isCorrect);
      if (result.isCorrect) {
        setEarnedPoints((prev) => prev + result.pointsEarned);
        setFeedback(`Doğru! (+${result.pointsEarned} puan)`);
        setCorrectAnswersCount((prev) => prev + 1);
      } else {
        const explanation = result.explanation
          ? `Açıklama: ${result.explanation}`
          : "Doğru cevap bu değil.";
        setFeedback(`Yanlış. ${explanation}`);
        setWrongAnswersCount((prev) => prev + 1);
      }
      setShowFeedbackArea(true);
    } catch (error) {
      console.error("[LessonDetailScreen] Cevap kontrolü hatası:", error);
      Alert.alert("Hata", "Cevap kontrol edilirken bir sorun oluştu.");
      setShowFeedbackArea(false);
    }
  };

  const handleContinueAfterFeedback = useCallback(() => {
    setShowFeedbackArea(false);
    setUserAnswer("");
    setSelectedOption(null);

    if (
      lesson &&
      lesson.exercises &&
      currentExerciseIndex < lesson.exercises.length - 1
    ) {
      setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
    } else {
      setCurrentStep("summary");
    }
  }, [currentExerciseIndex, lesson]);

  const completeLessonOnBackend = async () => {
    if (!lesson) return;
    setIsScoreUpdating(true);
    try {
      await updateScore(earnedPoints);
      await checkAuthStatus();
      setScoreUpdateCompleted(true);
      console.log("Ders başarıyla tamamlandı ve puan güncellendi.");
    } catch (error: any) {
      console.error(
        "Ders tamamlama/puan güncelleme API hatası:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Hata",
        "Puan güncelleme sırasında bir sunucu hatası oluştu."
      );
      setScoreUpdateCompleted(true);
    } finally {
      setIsScoreUpdating(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={lessonDetailStyles.centered}>
          <ActivityIndicator size="large" color={Colors.accentPrimary} />
          <Text style={globalStyles.bodyText}>Ders yükleniyor...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={lessonDetailStyles.centered}>
          <Text style={lessonDetailStyles.errorText}>{error}</Text>
          <TouchableOpacity
            style={lessonDetailStyles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={lessonDetailStyles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!lesson || !lesson.exercises) {
      if (currentStep !== "noQuestions") {
        setCurrentStep("noQuestions");
      }
      return (
        <View style={lessonDetailStyles.centered}>
          <Text style={lessonDetailStyles.noQuestionText}>
            Ders verisi veya egzersizler mevcut değil. Lütfen daha sonra tekrar
            deneyin.
          </Text>
          <TouchableOpacity
            style={lessonDetailStyles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={lessonDetailStyles.retryButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentLesson = lesson;
    const currentExercises = lesson.exercises;

    switch (currentStep) {
      case "intro":
        return (
          <ScrollView contentContainerStyle={lessonDetailStyles.introContainer}>
            <Text style={lessonDetailStyles.lessonTitle}>
              {currentLesson.title}
            </Text>
            <Text style={lessonDetailStyles.lessonDescription}>
              {currentLesson.description}
            </Text>
            <Text style={lessonDetailStyles.lessonInfo}>
              Toplam Soru: {currentExercises.length}
            </Text>
            <Text style={lessonDetailStyles.lessonInfo}>
              Zorluk Seviyesi: {currentLesson.level}
            </Text>

            <TouchableOpacity
              style={lessonDetailStyles.startButton}
              onPress={() => {
                if (currentExercises.length > 0) {
                  setCurrentStep("exercises");
                } else {
                  Alert.alert(
                    "Uyarı",
                    "Bu derste henüz egzersiz bulunmamaktadır."
                  );
                  setCurrentStep("noQuestions");
                }
              }}
            >
              <Text style={lessonDetailStyles.startButtonText}>
                Derse Başla
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={lessonDetailStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={lessonDetailStyles.backButtonText}>Geri Dön</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case "exercises":
        const currentExercise = currentExercises[currentExerciseIndex];
        if (!currentExercise) {
          return (
            <View style={lessonDetailStyles.centered}>
              <Text style={lessonDetailStyles.noQuestionText}>
                Egzersiz bulunamadı veya yüklenemedi (geçersiz index).
              </Text>
            </View>
          );
        }

        const correctAnswerString = Array.isArray(currentExercise.correctAnswer)
          ? currentExercise.correctAnswer[0] || ""
          : currentExercise.correctAnswer || "";

        return (
          <View style={lessonDetailStyles.exerciseScreenContainer}>
            <Text style={lessonDetailStyles.scoreAndProgressText}>
              Bu Ders Puanı: {earnedPoints} | Soru {currentExerciseIndex + 1}/
              {currentExercises.length}
            </Text>
            <ScrollView
              contentContainerStyle={lessonDetailStyles.exerciseContainer}
            >
              <Text style={lessonDetailStyles.questionText}>
                {currentExercise.question}
              </Text>

              {currentExercise.type === "multipleChoice" && (
                <View style={lessonDetailStyles.optionsContainer}>
                  {currentExercise.options?.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        lessonDetailStyles.optionButton,
                        selectedOption === option &&
                          lessonDetailStyles.selectedOption,
                        showFeedbackArea &&
                          correctAnswerString.toLowerCase() ===
                            option.toLowerCase() &&
                          lessonDetailStyles.correctOption,
                        showFeedbackArea &&
                          !isCorrectAnswer &&
                          selectedOption === option &&
                          lessonDetailStyles.wrongOption,
                      ]}
                      onPress={() =>
                        !showFeedbackArea && setSelectedOption(option)
                      }
                      disabled={showFeedbackArea}
                    >
                      <Text style={lessonDetailStyles.optionText}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {(currentExercise.type === "text" ||
                currentExercise.type === "fillInTheBlanks") && (
                <TextInput
                  style={lessonDetailStyles.textInput}
                  placeholder={
                    currentExercise.type === "text"
                      ? "Cevabınızı buraya yazın..."
                      : "Boşluğu doldurun..."
                  }
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  editable={!showFeedbackArea}
                />
              )}

              <TouchableOpacity
                style={lessonDetailStyles.submitButton}
                onPress={handleAnswer}
                disabled={showFeedbackArea}
              >
                <Text style={lessonDetailStyles.submitButtonText}>
                  Cevabı Kontrol Et
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <QuizAnswerFeedback
              isVisible={showFeedbackArea}
              isCorrect={isCorrectAnswer}
              feedbackText={feedback}
              onContinue={handleContinueAfterFeedback}
            />
          </View>
        );

      case "summary":
        return (
          <View style={lessonDetailStyles.summaryContainer}>
            <Text style={lessonDetailStyles.summaryTitle}>
              Ders Tamamlandı!
            </Text>
            <Text style={lessonDetailStyles.motivationText}>
              {motivationText}
            </Text>
            <View style={lessonDetailStyles.summaryStats}>
              <Text style={lessonDetailStyles.summaryStatText}>
                Toplam Soru: {totalQuestions}
              </Text>
              <Text
                style={[
                  lessonDetailStyles.summaryStatText,
                  lessonDetailStyles.summaryStatCorrect,
                ]}
              >
                Doğru Cevap: {correctAnswersCount}
              </Text>
              <Text
                style={[
                  lessonDetailStyles.summaryStatText,
                  lessonDetailStyles.summaryStatIncorrect,
                ]}
              >
                Yanlış Cevap: {wrongAnswersCount}
              </Text>
              <Text style={lessonDetailStyles.summaryPointsText}>
                Kazanılan Puan: {earnedPoints}
              </Text>
            </View>

            {!scoreUpdateCompleted ? (
              <TouchableOpacity
                style={lessonDetailStyles.backToPathButton}
                onPress={completeLessonOnBackend}
                disabled={isScoreUpdating}
              >
                {isScoreUpdating ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={lessonDetailStyles.backToPathButtonText}>
                    Puanları Topla
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={lessonDetailStyles.backToPathButton}
                onPress={() => {
                  if (userLanguageId) {
                    navigation.replace("AppTabs", {
                      screen: "LearningPathScreen",
                      params: { selectedLanguageId: userLanguageId },
                    });
                  } else {
                    Alert.alert(
                      "Bilgi Eksik",
                      "Öğrenme yoluna dönmek için dil bilgisi gerekli. Lütfen dil seçiminizi kontrol edin."
                    );
                    navigation.replace("InitialLanguageSelectionScreen");
                  }
                }}
              >
                <Text style={lessonDetailStyles.backToPathButtonText}>
                  Öğrenme Yoluna Geri Dön
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case "noQuestions":
        return (
          <View style={lessonDetailStyles.centered}>
            <Text style={lessonDetailStyles.noQuestionText}>
              Bu derste henüz egzersiz bulunmamaktadır.
            </Text>
            <TouchableOpacity
              style={lessonDetailStyles.retryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={lessonDetailStyles.retryButtonText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return <View style={lessonDetailStyles.container}>{renderContent()}</View>;
};

export default LessonDetailScreen;
