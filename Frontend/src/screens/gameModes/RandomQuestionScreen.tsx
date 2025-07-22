// LIBRARY
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

//MY SCRIPTS
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
import { AppTabScreenNavigationProp } from "../../navigation/types";
import { QuizLevel } from "../../components/QuizIntroScreen"; // QuizLevel'i buradan import ediyoruz
import QuizAnswerFeedback from "../../components/QuizFeedbackModal";
//STYLES
import { Colors, Radii } from "../../styles/GlobalStyles/colors";
import { Spacing } from "../../styles/GlobalStyles/spacing";
import { FontSizes } from "../../styles/GlobalStyles/typography";
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";

const RandomQuestionScreen = () => {
  const { user, isLoading: authLoading, checkAuthStatus } = useAuth();
  const navigation =
    useNavigation<AppTabScreenNavigationProp<"RandomQuestionScreen">>();

  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(
    null
  );
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestionsToAsk, setTotalQuestionsToAsk] = useState<number | null>(
    null
  );
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  const [currentQuizScore, setCurrentQuizScore] = useState(0);

  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [answerFeedbackText, setAnswerFeedbackText] = useState<string>("");
  const [showFeedbackArea, setShowFeedbackArea] = useState(false);

  const [isScoreUpdating, setIsScoreUpdating] = useState(false);
  const [scoreUpdateCompleted, setScoreUpdateCompleted] = useState(false);

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
    } catch (error: any) {
      console.error("[RandomQuizScreen] Soru çekme hatası:", error);
      Alert.alert(
        "Hata",
        error.message || "Rastgele soru yüklenirken bir sorun oluştu."
      );
      setQuizEnded(true);
    } finally {
      setLoadingQuestion(false);
    }
  }, [userLanguageId, navigation]);

  const startQuiz = useCallback(
    async (levelOrCount: QuizLevel | number) => {
      const questionCount = levelOrCount as number; // Type assertion

      setTotalQuestionsToAsk(questionCount);
      setQuizStarted(true);
      setQuizEnded(false);
      setCurrentQuestionIndex(0);
      setCorrectAnswersCount(0);
      setIncorrectAnswersCount(0);
      setCurrentQuizScore(0);
      setScoreUpdateCompleted(false);
      setShowFeedbackArea(false);
      setIsCorrectAnswer(null);
      setAnswerFeedbackText("");

      await fetchQuestion();
    },
    [fetchQuestion]
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Tüm quiz state'lerini sıfırla
        setQuizStarted(false);
        setQuizEnded(false);
        setCurrentQuestion(null);
        setLoadingQuestion(false);
        setCurrentQuestionIndex(0);
        setTotalQuestionsToAsk(null);
        setCorrectAnswersCount(0);
        setIncorrectAnswersCount(0);
        setCurrentQuizScore(0);
        setIsCorrectAnswer(null);
        setAnswerFeedbackText("");
        setShowFeedbackArea(false);
        setIsScoreUpdating(false);
        setScoreUpdateCompleted(false);
      };
    }, [])
  );

  useEffect(() => {
    if (
      quizStarted &&
      totalQuestionsToAsk !== null &&
      currentQuestionIndex >= totalQuestionsToAsk
    ) {
      setQuizEnded(true);
    }
  }, [currentQuestionIndex, totalQuestionsToAsk, quizStarted]);

  const handleAnswer = async (selectedOption: string) => {
    if (quizEnded || !currentQuestion || showFeedbackArea) return;

    setLoadingQuestion(true);

    try {
      const result = await checkQuizAnswer(currentQuestion._id, selectedOption);

      setIsCorrectAnswer(result.isCorrect);
      if (result.isCorrect) {
        setCurrentQuizScore((prevScore) => prevScore + result.pointsEarned);
        setCorrectAnswersCount((prev) => prev + 1);
        setAnswerFeedbackText(`Doğru! (+${result.pointsEarned} puan)`);
      } else {
        setIncorrectAnswersCount((prev) => prev + 1);
        const explanation = result.explanation
          ? `Açıklama: ${result.explanation}`
          : "Doğru cevap bu değil.";
        setAnswerFeedbackText(`Yanlış. ${explanation}`);
      }
      setShowFeedbackArea(true);
    } catch (error) {
      console.error("[RandomQuizScreen] Cevap kontrolü hatası:", error);
      Alert.alert("Hata", "Cevap kontrol edilirken bir sorun oluştu.");
      setShowFeedbackArea(false);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleContinueAfterFeedback = useCallback(async () => {
    setShowFeedbackArea(false);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);

    if (
      totalQuestionsToAsk !== null &&
      currentQuestionIndex + 1 >= totalQuestionsToAsk
    ) {
      setQuizEnded(true);
    } else {
      await fetchQuestion();
    }
  }, [fetchQuestion, currentQuestionIndex, totalQuestionsToAsk]);

  const handleCollectPoints = useCallback(async () => {
    if (isScoreUpdating) return;

    setIsScoreUpdating(true);

    try {
      await updateScore(currentQuizScore);
      await checkAuthStatus();
      setScoreUpdateCompleted(true);
      console.log("[RandomQuizScreen] Puan başarıyla güncellendi.");
      Alert.alert("Başarılı", "Puanınız başarıyla hesabınıza eklendi!");

      if (user?.selectedLanguageId) {
        navigation.replace("AppTabs", {
          screen: "LearningPathScreen",
          params: { selectedLanguageId: user.selectedLanguageId },
        });
      } else {
        Alert.alert(
          "Bilgi Eksik",
          "Öğrenme yoluna dönmek için dil bilgisi gerekli. Lütfen dil seçiminizi kontrol edin."
        );
        navigation.replace("InitialLanguageSelectionScreen");
      }
    } catch (error) {
      console.error("[RandomQuizScreen] Global skor güncelleme hatası:", error);
      Alert.alert("Hata", "Puan güncelleme sırasında bir sorun oluştu.");
      setScoreUpdateCompleted(true);
    } finally {
      setIsScoreUpdating(false);
    }
  }, [currentQuizScore, checkAuthStatus, isScoreUpdating, user, navigation]);

  const [selectedQuestionCount, setSelectedQuestionCount] =
    useState<number>(10);

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

  if (!quizStarted) {
    return (
      <QuizIntroScreen
        onStartQuiz={startQuiz}
        isLoading={loadingQuestion}
        title="Rastgele Soru Yarışmasına Hoş Geldiniz!"
        description="Kaç soruluk bir test istediğinizi seçin."
        isRandomQuiz={true}
        questionCountOptions={[10, 20, 30, 40]}
        selectedQuestionCount={selectedQuestionCount}
        onQuestionCountSelect={setSelectedQuestionCount}
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
        isRandomQuiz={true}
        correctAnswers={correctAnswersCount}
        incorrectAnswers={incorrectAnswersCount}
        totalQuestions={totalQuestionsToAsk || 0}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.questionCounter}>
        Soru {currentQuestionIndex + 1} / {totalQuestionsToAsk}
      </Text>
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
  questionCounter: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.textSecondary,
    marginBottom: Spacing.small,
  },
  currentScoreText: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.medium,
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

export default RandomQuestionScreen;
