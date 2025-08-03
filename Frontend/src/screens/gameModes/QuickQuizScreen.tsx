// LIBRARY
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// MY SCRIPTS
import { useAuth } from "../../context/AuthContext";
import {
  getQuickQuizQuestions,
  updateScore,
  checkQuizAnswer,
} from "../../api/userApi";
import { QuizQuestion } from "../../types";
import QuizQuestionComponent from "../../components/QuizQuestion";
import QuizIntroScreen from "../../components/QuizIntroScreen";
import QuizSummaryScreen from "../../components/QuizSummaryScreen";
import QuizAnswerFeedback from "../../components/QuizFeedbackModal";
import { QuizLevel } from "../../components/QuizIntroScreen";
import { getRandomMotivationMessage } from "../../utils/motivationMessages";

// STYLES
import { Colors, Radii } from "../../styles/GlobalStyles/colors";
import { Spacing } from "../../styles/GlobalStyles/spacing";
import { FontSizes } from "../../styles/GlobalStyles/typography";
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";

const QuickQuizScreen = () => {
  const { user, isLoading: authLoading, checkAuthStatus } = useAuth();
  const navigation = useNavigation();

  const [currentStep, setCurrentStep] = useState<
    "intro" | "question" | "feedback" | "summary" | "noQuestions"
  >("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [earnedPointsThisQuiz, setEarnedPointsThisQuiz] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel>("BEGINNER");

  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [answerFeedbackText, setAnswerFeedbackText] = useState<string>("");
  const [showFeedbackArea, setShowFeedbackArea] = useState(false);

  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);

  const [motivationText, setMotivationText] = useState<string>("");
  const [isScoreUpdating, setIsScoreUpdating] = useState(false);
  const [scoreUpdateCompleted, setScoreUpdateCompleted] = useState(false);

  const userLanguageId = user?.selectedLanguageId;

  const fetchQuizQuestions = useCallback(
    async (levelOrCount: QuizLevel | number) => {
      const level = levelOrCount as QuizLevel;

      if (!userLanguageId) {
        Alert.alert("Dil Seçimi Hatası", "Lütfen önce bir dil seçin.");
        (navigation as any).navigate("InitialLanguageSelectionScreen");
        return;
      }

      setLoadingQuiz(true);
      setQuestions([]);
      setEarnedPointsThisQuiz(0);
      setCurrentQuestionIndex(0);
      setScoreUpdateCompleted(false);
      setShowFeedbackArea(false);
      setIsCorrectAnswer(null);
      setAnswerFeedbackText("");
      setCorrectAnswersCount(0);
      setIncorrectAnswersCount(0);
      setMotivationText("");

      try {
        const fetchedQuestions = await getQuickQuizQuestions(
          userLanguageId,
          level
        );

        if (fetchedQuestions.length === 0) {
          Alert.alert(
            "Uyarı",
            "Bu dilde veya seviyede soru bulunamadı. Lütfen farklı bir seviye deneyin."
          );
          setCurrentStep("noQuestions");
          return;
        }

        setQuestions(fetchedQuestions);
        setCurrentStep("question");
      } catch (error) {
        Alert.alert("Hata", "Quiz soruları yüklenirken bir sorun oluştu.");
        setCurrentStep("intro");
      } finally {
        setLoadingQuiz(false);
      }
    },
    [userLanguageId, navigation]
  );

  useFocusEffect(
    useCallback(() => {
      setCurrentStep("intro");
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setEarnedPointsThisQuiz(0);
      setIsCorrectAnswer(null);
      setAnswerFeedbackText("");
      setShowFeedbackArea(false);
      setIsScoreUpdating(false);
      setScoreUpdateCompleted(false);
      setCorrectAnswersCount(0);
      setIncorrectAnswersCount(0);
      setMotivationText("");
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (currentStep === "summary") {
      if (userLanguageId) {
        const message = getRandomMotivationMessage(userLanguageId, "quiz_end");
        setMotivationText(message);
      }
    }
  }, [currentStep, userLanguageId]);

  const handleAnswer = async (selectedOption: string) => {
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) {
      Alert.alert("Hata", "Soru bilgisi bulunamadı.");
      return;
    }

    try {
      const result = await checkQuizAnswer(currentQuestion._id, selectedOption);

      setIsCorrectAnswer(result.isCorrect);
      if (result.isCorrect) {
        setEarnedPointsThisQuiz((prevScore) => prevScore + result.pointsEarned);
        setAnswerFeedbackText(`DOĞRU! (+${result.pointsEarned} puan)`);
        setCorrectAnswersCount((prev) => prev + 1);
      } else {
        const explanation = result.explanation
          ? `${result.explanation}`
          : "Doğru cevap bu değil.";
        setAnswerFeedbackText(`YANLIŞ!. ${explanation}`);
        setIncorrectAnswersCount((prev) => prev + 1);
      }
      setShowFeedbackArea(true);
    } catch (error) {
      Alert.alert("Hata", "Cevap kontrol edilirken bir sorun oluştu.");
      setShowFeedbackArea(false);
    } finally {
    }
  };

  const handleContinueAfterFeedback = useCallback(() => {
    setShowFeedbackArea(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setCurrentStep("summary");
    }
  }, [currentQuestionIndex, questions.length]);

  const handleCollectPoints = useCallback(async () => {
    if (isScoreUpdating) return;

    setIsScoreUpdating(true);
    try {
      await updateScore(earnedPointsThisQuiz);
      await checkAuthStatus();
      setScoreUpdateCompleted(true);
      Alert.alert("Başarılı", "Puanınız başarıyla hesabınıza eklendi!");
    } catch (error) {
      Alert.alert("Hata", "Puan güncelleme sırasında bir sorun oluştu.");
      setScoreUpdateCompleted(true);
    } finally {
      setIsScoreUpdating(false);
    }
  }, [earnedPointsThisQuiz, checkAuthStatus, isScoreUpdating]);

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex]
  );

  if (authLoading || !userLanguageId) {
    return (
      <View style={globalStyles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
        <Text style={globalStyles.bodyText}>
          {authLoading
            ? "Kullanıcı verileri yükleniyor..."
            : "Dil seçimi bekleniyor..."}
        </Text>
        {!userLanguageId && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              (navigation as any).navigate("InitialLanguageSelectionScreen")
            }
          >
            <Text style={styles.actionButtonText}>Dil Seç</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  switch (currentStep) {
    case "intro":
      return (
        <QuizIntroScreen
          selectedLevel={selectedLevel}
          onLevelSelect={setSelectedLevel}
          onStartQuiz={fetchQuizQuestions}
          isLoading={loadingQuiz}
          isRandomQuiz={false}
          questionCountOptions={[]}
          selectedQuestionCount={0}
          onQuestionCountSelect={() => {}}
        />
      );
    case "question":
      if (!currentQuestion && !loadingQuiz) {
        setCurrentStep("noQuestions");
        return null;
      }
      return (
        <View style={styles.container}>
          <Text style={styles.scoreAndProgressText}>
            Bu Quiz Puanı: {earnedPointsThisQuiz} | Soru{" "}
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
          {currentQuestion && (
            <QuizQuestionComponent
              question={currentQuestion}
              onAnswer={handleAnswer}
              disableInteractions={showFeedbackArea || loadingQuiz}
              key={currentQuestion._id}
            />
          )}

          <QuizAnswerFeedback
            isVisible={showFeedbackArea}
            isCorrect={isCorrectAnswer}
            feedbackText={answerFeedbackText}
            onContinue={handleContinueAfterFeedback}
          />
        </View>
      );
    case "summary":
      return (
        <QuizSummaryScreen
          earnedPoints={earnedPointsThisQuiz}
          isScoreUpdating={isScoreUpdating}
          scoreUpdateCompleted={scoreUpdateCompleted}
          onCollectPoints={handleCollectPoints}
          isRandomQuiz={false}
          isTimedQuiz={false}
          correctAnswers={correctAnswersCount}
          incorrectAnswers={incorrectAnswersCount}
          totalQuestions={questions.length}
          motivationMessage={motivationText}
        />
      );
    case "noQuestions":
      return (
        <View style={globalStyles.centeredContainer}>
          <Text style={styles.noQuestionText}>
            Bu seviye veya dilde soru bulunamadı.
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => setCurrentStep("intro")}
          >
            <Text style={styles.refreshButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      );
    default:
      return (
        <View style={globalStyles.centeredContainer}>
          <Text style={globalStyles.bodyText}>
            Beklenmeyen bir hata oluştu.
          </Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    paddingTop: Spacing.large,
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  scoreAndProgressText: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.medium,
    width: "90%",
  },
  actionButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
    borderRadius: Radii.medium,
    marginTop: Spacing.large,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: FontSizes.h3,
    fontWeight: "bold",
  },
  noQuestionText: {
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.medium,
    textAlign: "center",
    paddingHorizontal: Spacing.medium,
  },
  refreshButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: Radii.medium,
  },
  refreshButtonText: {
    color: Colors.white,
    fontSize: FontSizes.body,
    fontWeight: "bold",
  },
});

export default QuickQuizScreen;
