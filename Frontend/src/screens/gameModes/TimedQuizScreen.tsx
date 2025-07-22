// LIBRARY
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  getRandomQuestion,
  updateScore,
  checkQuizAnswer,
} from "../../api/userApi";
import { QuizQuestion as QuestionType } from "../../types";

import QuizIntroScreen from "../../components/QuizIntroScreen";
import QuizQuestionComponent from "../../components/QuizQuestion";
import QuizSummaryScreen from "../../components/QuizSummaryScreen";
import QuizAnswerFeedback from "../../components/QuizFeedbackModal";
import { AppTabScreenNavigationProp } from "../../navigation/types";

// STYLES
import { Colors, Radii } from "../../styles/GlobalStyles/colors";
import { Spacing } from "../../styles/GlobalStyles/spacing";
import { FontSizes } from "../../styles/GlobalStyles/typography";
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";

const QUIZ_DURATION_SECONDS = 60;

const TimedQuizScreen = () => {
  const { user, isLoading: authLoading, checkAuthStatus } = useAuth();
  const navigation =
    useNavigation<AppTabScreenNavigationProp<"TimedQuizScreen">>();

  const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(
    null
  );
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [currentQuizScore, setCurrentQuizScore] = useState(0);

  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [answerFeedbackText, setAnswerFeedbackText] = useState<string>("");
  const [showFeedbackArea, setShowFeedbackArea] = useState(false);

  const [isScoreUpdating, setIsScoreUpdating] = useState(false);
  const [scoreUpdateCompleted, setScoreUpdateCompleted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const userLanguageId = user?.selectedLanguageId;

  const fetchQuestion = useCallback(async () => {
    if (!userLanguageId) {
      Alert.alert("Dil Seçimi Hatası", "Lütfen önce bir dil seçin.");
      navigation.navigate("InitialLanguageSelectionScreen");
      return;
    }

    setLoadingQuestion(true);
    setCurrentQuestion(null);
    try {
      const question = await getRandomQuestion(userLanguageId);
      setCurrentQuestion(question);
    } catch (error) {
      console.error("[TimedQuizScreen] Soru çekme hatası:", error);
      Alert.alert("Hata", "Yeni soru yüklenirken bir sorun oluştu.");
      if (quizStarted) {
        setQuizEnded(true);
      }
    } finally {
      setLoadingQuestion(false);
    }
  }, [userLanguageId, navigation, quizStarted]);

  const startQuiz = useCallback(() => {
    setQuizStarted(true);
    setQuizEnded(false);
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setCurrentQuizScore(0);
    setScoreUpdateCompleted(false);
    setShowFeedbackArea(false);
    setIsCorrectAnswer(null);
    setAnswerFeedbackText("");

    fetchQuestion();

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          setQuizEnded(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [fetchQuestion]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setQuizStarted(false);
        setQuizEnded(false);
        setTimeLeft(QUIZ_DURATION_SECONDS);
        setCurrentQuizScore(0);
        setCurrentQuestion(null);
        setShowFeedbackArea(false);
        setIsCorrectAnswer(null);
        setAnswerFeedbackText("");
        setLoadingQuestion(false);
        setIsScoreUpdating(false);
        setScoreUpdateCompleted(false);
      };
    }, [])
  );

  useEffect(() => {
    if (quizEnded) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [quizEnded]);

  // Cevaplama mantığı
  const handleAnswer = async (selectedOption: string) => {
    if (quizEnded || !currentQuestion || showFeedbackArea) return;

    setLoadingQuestion(true);

    try {
      const result = await checkQuizAnswer(currentQuestion._id, selectedOption);

      setIsCorrectAnswer(result.isCorrect);
      if (result.isCorrect) {
        setCurrentQuizScore((prevScore) => prevScore + result.pointsEarned);
        setAnswerFeedbackText(`Doğru! (+${result.pointsEarned} puan)`);
      } else {
        const explanation = result.explanation
          ? `Açıklama: ${result.explanation}`
          : "Doğru cevap bu değil.";
        setAnswerFeedbackText(`Yanlış. ${explanation}`);
      }
      setShowFeedbackArea(true);
    } catch (error) {
      console.error("[TimedQuizScreen] Cevap kontrolü hatası:", error);
      Alert.alert("Hata", "Cevap kontrol edilirken bir sorun oluştu.");
      setShowFeedbackArea(false);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleContinueAfterFeedback = useCallback(() => {
    setShowFeedbackArea(false);
    if (!quizEnded) {
      fetchQuestion();
    }
  }, [fetchQuestion, quizEnded]);

  const handleCollectPoints = useCallback(async () => {
    if (isScoreUpdating) return;

    setIsScoreUpdating(true);

    try {
      await updateScore(currentQuizScore);
      await checkAuthStatus(); // Kullanıcının güncel puanını çekmek için
      setScoreUpdateCompleted(true); // Başarılı tamamlandı
      console.log("[TimedQuizScreen] Puan başarıyla güncellendi.");
    } catch (error) {
      console.error("[TimedQuizScreen] Global skor güncelleme hatası:", error);
      Alert.alert("Hata", "Puan güncelleme sırasında bir sorun oluştu.");
      setScoreUpdateCompleted(true);
    } finally {
      setIsScoreUpdating(false);
    }
  }, [currentQuizScore, checkAuthStatus, isScoreUpdating]);

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
              navigation.navigate("InitialLanguageSelectionScreen")
            }
          >
            <Text style={styles.actionButtonText}>Dil Seç</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // QUIZ BAŞLANGIÇ EKRANI (QuizIntroScreen'i kullanıyoruz)
  if (!quizStarted) {
    return (
      <QuizIntroScreen
        onStartQuiz={() => startQuiz()}
        isLoading={loadingQuestion}
        selectedLevel={"BEGINNER"}
        onLevelSelect={() => {}}
        title="Zamanlı Yarışmaya Hoş Geldiniz!"
        description={`${QUIZ_DURATION_SECONDS} saniye içinde olabildiğince çok soruya cevap ver.`}
        isTimedQuiz={true}
      />
    );
  }

  if (quizEnded) {
    return (
      <QuizSummaryScreen
        earnedPoints={currentQuizScore}
        isScoreUpdating={isScoreUpdating}
        scoreUpdateCompleted={scoreUpdateCompleted}
        onCollectPoints={handleCollectPoints}
        isTimedQuiz={true}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>Kalan Süre: {timeLeft}s</Text>
      <Text style={styles.currentScoreText}>
        Bu Turdaki Puan: {currentQuizScore}
      </Text>

      {loadingQuestion ? (
        <View style={globalStyles.centeredContainer}>
          <ActivityIndicator size="large" color={Colors.accentPrimary} />
          <Text style={globalStyles.bodyText}>Soru Yükleniyor...</Text>
        </View>
      ) : currentQuestion ? (
        <QuizQuestionComponent
          question={currentQuestion}
          onAnswer={handleAnswer}
          disableInteractions={showFeedbackArea || loadingQuestion}
          key={currentQuestion._id}
        />
      ) : (
        <View style={globalStyles.centeredContainer}>
          <Text style={styles.noQuestionText}>Soru bulunamadı.</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchQuestion}
          >
            <Text style={styles.refreshButtonText}>Yeni Soru Yükle</Text>
          </TouchableOpacity>
        </View>
      )}

      <QuizAnswerFeedback
        isVisible={showFeedbackArea}
        isCorrect={isCorrectAnswer}
        feedbackText={answerFeedbackText}
        onContinue={handleContinueAfterFeedback}
      />
    </View>
  );
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
  timerText: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.accentPrimary,
    textAlign: "center",
    marginBottom: Spacing.small,
  },
  currentScoreText: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.medium,
  },
  scoreTextCurrentSession: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.small,
  },
  startButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.xLarge,
    borderRadius: Radii.large,
    marginTop: Spacing.xLarge,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: FontSizes.large,
    fontWeight: "bold",
  },
  startQuizText: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Spacing.small,
    textAlign: "center",
    marginHorizontal: Spacing.medium,
  },
  startQuizSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginHorizontal: Spacing.medium,
    marginBottom: Spacing.xLarge,
  },
  noQuestionText: {
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.medium,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: Radii.medium,
    marginTop: Spacing.large,
  },
  refreshButtonText: {
    color: Colors.white,
    fontSize: FontSizes.body,
    fontWeight: "bold",
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
});

export default TimedQuizScreen;
