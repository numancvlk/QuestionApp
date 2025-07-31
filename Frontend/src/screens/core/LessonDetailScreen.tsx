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
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

//MY SCRIPTS
import { Lesson } from "../../types";
import {
  RootStackNavigationProp,
  LessonDetailScreenRouteProp,
} from "../../navigation/types";
import { useAuth } from "../../context/AuthContext";
import { getRandomMotivationMessage } from "../../utils/motivationMessages";
import QuizAnswerFeedback from "../../components/QuizFeedbackModal";
import {
  getLessonById,
  checkLessonAnswer,
  completeLesson,
} from "../../api/userApi";

// STYLES
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";
import { Colors } from "../../styles/GlobalStyles/colors";
import { lessonDetailStyles } from "../../styles/ScreenStyles/LessonDetailScreen.style";

const updatedLessonDetailStyles = StyleSheet.create({
  ...lessonDetailStyles,
  gameOverTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.error,
    textAlign: "center",
    marginBottom: 10,
  },
  gameOverText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
});

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
    "intro" | "exercises" | "feedback" | "summary" | "noQuestions" | "gameOver"
  >("intro");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [showFeedbackArea, setShowFeedbackArea] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [motivationText, setMotivationText] = useState<string>("");

  const [hearts, setHearts] = useState<number>(3);
  const userLanguageId = user?.selectedLanguageId;
  const [isLessonCompleted, setIsLessonCompleted] = useState<boolean>(false);

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
        const fetchedLesson = await getLessonById(lessonId);
        setLesson(fetchedLesson);
        setTotalQuestions(fetchedLesson.exercises?.length || 0);

        const userProgress = user?.languageProgress?.[userLanguageId];
        if (userProgress) {
          setHearts(3);
          setIsLessonCompleted(
            userProgress.completedLessonIds.includes(lessonId)
          );
        } else {
          setHearts(3);
          setIsLessonCompleted(false);
        }
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
  }, [lessonId, userLanguageId, user?.languageProgress]);

  useEffect(() => {
    if (hearts <= 0 && currentStep !== "gameOver") {
      setCurrentStep("gameOver");
    }
  }, [hearts, currentStep]);

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
    if (!currentExercise || !currentExercise._id || !userLanguageId) {
      Alert.alert("Hata", "Eksik bilgi: Egzersiz veya dil bulunamadı.");
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

    try {
      const result = await checkLessonAnswer(
        userLanguageId,
        lessonId,
        currentExercise._id as string,
        answerToEvaluate as string,
        hearts
      );

      const { isCorrect, heartsLeft, pointsEarned, explanation, isCompleted } =
        result;

      setIsCorrectAnswer(isCorrect);
      setHearts(heartsLeft);

      if (isCompleted) {
        setFeedback("Bu dersi daha önce tamamladın. Puan kazanılmadı.");
      } else if (isCorrect) {
        setEarnedPoints((prev) => prev + pointsEarned);
        setFeedback(`Doğru! (+${pointsEarned} puan)`);
        setCorrectAnswersCount((prev) => prev + 1);
      } else {
        const finalExplanation = explanation
          ? `Açıklama: ${explanation}`
          : "Doğru cevap bu değil.";
        setFeedback(`Yanlış. ${finalExplanation}`);
      }

      setShowFeedbackArea(true);
    } catch (error: any) {
      console.error("[LessonDetailScreen] Cevap kontrolü hatası:", error);
      Alert.alert(
        "Hata",
        error.response?.data?.message ||
          "Cevap kontrol edilirken bir sorun oluştu."
      );
      setShowFeedbackArea(false);
    }
  };

  const handleContinueAfterFeedback = useCallback(() => {
    setShowFeedbackArea(false);
    setUserAnswer("");
    setSelectedOption(null);

    if (hearts <= 0) {
      setCurrentStep("gameOver");
      return;
    }

    if (
      lesson &&
      lesson.exercises &&
      currentExerciseIndex < lesson.exercises.length - 1
    ) {
      setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
    } else {
      setCurrentStep("summary");
    }
  }, [currentExerciseIndex, lesson, hearts]);

  const completeLessonOnBackend = async () => {
    if (!lesson || !userLanguageId) {
      Alert.alert("Hata", "Ders tamamlama için gerekli veriler eksik.");
      return;
    }

    if (isLessonCompleted) {
      Alert.alert("Bilgi", "Bu ders zaten tamamlandı. Puan kazanılmaz.");
      navigation.replace("AppTabs", {
        screen: "LearningPathScreen",
        params: { selectedLanguageId: userLanguageId },
      });
      return;
    }

    try {
      await completeLesson(lessonId, userLanguageId, earnedPoints);
      await checkAuthStatus();
      Alert.alert(
        "Tebrikler!",
        "Dersi başarıyla tamamladınız ve puanları topladınız."
      );
      navigation.replace("AppTabs", {
        screen: "LearningPathScreen",
        params: { selectedLanguageId: userLanguageId },
      });
    } catch (error: any) {
      console.error(
        "Ders tamamlama API hatası:",
        error.response?.data || error.message
      );
      Alert.alert("Hata", "Ders tamamlama sırasında bir sunucu hatası oluştu.");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={updatedLessonDetailStyles.centered}>
          <ActivityIndicator size="large" color={Colors.accentPrimary} />
          <Text style={globalStyles.bodyText}>Ders yükleniyor...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={updatedLessonDetailStyles.centered}>
          <Text style={updatedLessonDetailStyles.errorText}>{error}</Text>
          <TouchableOpacity
            style={updatedLessonDetailStyles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={updatedLessonDetailStyles.retryButtonText}>
              Tekrar Dene
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!lesson || !lesson.exercises || lesson.exercises.length === 0) {
      if (currentStep !== "noQuestions") {
        setCurrentStep("noQuestions");
      }
      return (
        <View style={updatedLessonDetailStyles.centered}>
          <Text style={updatedLessonDetailStyles.noQuestionText}>
            Ders verisi veya egzersizler mevcut değil.
          </Text>
          <TouchableOpacity
            style={updatedLessonDetailStyles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={updatedLessonDetailStyles.retryButtonText}>
              Geri Dön
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentLesson = lesson;
    const currentExercises = lesson.exercises;

    switch (currentStep) {
      case "intro":
        return (
          <ScrollView
            contentContainerStyle={updatedLessonDetailStyles.introContainer}
          >
            <Text style={updatedLessonDetailStyles.lessonTitle}>
              {currentLesson.title}
            </Text>
            <Text style={updatedLessonDetailStyles.lessonDescription}>
              {currentLesson.description}
            </Text>
            <Text style={updatedLessonDetailStyles.lessonInfo}>
              Toplam Soru: {currentExercises.length}
            </Text>
            <Text style={updatedLessonDetailStyles.lessonInfo}>
              Zorluk Seviyesi: {currentLesson.level}
            </Text>
            <TouchableOpacity
              style={updatedLessonDetailStyles.startButton}
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
              <Text style={updatedLessonDetailStyles.startButtonText}>
                Derse Başla
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={updatedLessonDetailStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={updatedLessonDetailStyles.backButtonText}>
                Geri Dön
              </Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case "exercises":
        const currentExercise = currentExercises[currentExerciseIndex];
        if (!currentExercise) {
          return (
            <View style={updatedLessonDetailStyles.centered}>
              <Text style={updatedLessonDetailStyles.noQuestionText}>
                Egzersiz bulunamadı veya yüklenemedi (geçersiz index).
              </Text>
            </View>
          );
        }
        const correctAnswerString = Array.isArray(currentExercise.correctAnswer)
          ? currentExercise.correctAnswer[0] || ""
          : currentExercise.correctAnswer || "";

        return (
          <View style={updatedLessonDetailStyles.exerciseScreenContainer}>
            <View style={updatedLessonDetailStyles.heartsContainer}>
              <Text style={updatedLessonDetailStyles.heartsText}>
                Kalp: {hearts}
              </Text>
            </View>
            <Text style={updatedLessonDetailStyles.scoreAndProgressText}>
              Bu Ders Puanı: {earnedPoints} | Soru {currentExerciseIndex + 1}/
              {currentExercises.length}
            </Text>
            <ScrollView
              contentContainerStyle={
                updatedLessonDetailStyles.exerciseContainer
              }
            >
              <Text style={updatedLessonDetailStyles.questionText}>
                {currentExercise.question}
              </Text>
              {currentExercise.type === "multipleChoice" && (
                <View style={updatedLessonDetailStyles.optionsContainer}>
                  {currentExercise.options?.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        updatedLessonDetailStyles.optionButton,
                        selectedOption === option &&
                          updatedLessonDetailStyles.selectedOption,
                        showFeedbackArea &&
                          correctAnswerString.toLowerCase() ===
                            option.toLowerCase() &&
                          updatedLessonDetailStyles.correctOption,
                        showFeedbackArea &&
                          !isCorrectAnswer &&
                          selectedOption === option &&
                          updatedLessonDetailStyles.wrongOption,
                      ]}
                      onPress={() =>
                        !showFeedbackArea && setSelectedOption(option)
                      }
                      disabled={showFeedbackArea}
                    >
                      <Text style={updatedLessonDetailStyles.optionText}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {(currentExercise.type === "text" ||
                currentExercise.type === "fillInTheBlanks") && (
                <TextInput
                  style={updatedLessonDetailStyles.textInput}
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
                style={updatedLessonDetailStyles.submitButton}
                onPress={handleAnswer}
                disabled={showFeedbackArea}
              >
                <Text style={updatedLessonDetailStyles.submitButtonText}>
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
          <View style={updatedLessonDetailStyles.summaryContainer}>
            <Text style={updatedLessonDetailStyles.summaryTitle}>
              Ders Tamamlandı!
            </Text>
            <Text style={updatedLessonDetailStyles.motivationText}>
              {motivationText}
            </Text>
            <View style={updatedLessonDetailStyles.summaryStats}>
              <Text style={updatedLessonDetailStyles.summaryStatText}>
                Toplam Soru: {totalQuestions}
              </Text>
              <Text
                style={[
                  updatedLessonDetailStyles.summaryStatText,
                  updatedLessonDetailStyles.summaryStatCorrect,
                ]}
              >
                Doğru Cevap: {correctAnswersCount}
              </Text>
              <Text
                style={[
                  updatedLessonDetailStyles.summaryStatText,
                  updatedLessonDetailStyles.summaryStatIncorrect,
                ]}
              >
                Yanlış Cevap: {totalQuestions - correctAnswersCount}
              </Text>
              <Text style={updatedLessonDetailStyles.summaryPointsText}>
                Kazanılan Puan: {earnedPoints}
              </Text>
            </View>
            <TouchableOpacity
              style={updatedLessonDetailStyles.backToPathButton}
              onPress={completeLessonOnBackend}
            >
              <Text style={updatedLessonDetailStyles.backToPathButtonText}>
                {isLessonCompleted ? "Geri Dön" : "Puanları Topla"}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "gameOver":
        return (
          <View style={updatedLessonDetailStyles.centered}>
            <Text style={updatedLessonDetailStyles.gameOverTitle}>
              Kalplerin Bitti!
            </Text>
            <Text style={updatedLessonDetailStyles.gameOverText}>
              Dersi tamamlayamadın. Tekrar dene!
            </Text>
            <TouchableOpacity
              style={updatedLessonDetailStyles.retryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={updatedLessonDetailStyles.retryButtonText}>
                Geri Dön
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "noQuestions":
        return (
          <View style={updatedLessonDetailStyles.centered}>
            <Text style={updatedLessonDetailStyles.noQuestionText}>
              Bu derste egzersiz bulunmamaktadır.
            </Text>
            <TouchableOpacity
              style={updatedLessonDetailStyles.retryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={updatedLessonDetailStyles.retryButtonText}>
                Geri Dön
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={updatedLessonDetailStyles.container}>{renderContent()}</View>
  );
};

export default LessonDetailScreen;
