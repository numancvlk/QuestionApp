//LIBRARY
import React, { useState, useCallback } from "react";
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
  getQuickQuizQuestions,
  updateScore,
  checkQuizAnswer,
} from "../../api/userApi";
import { QuizQuestion } from "../../types";
import QuizQuestionComponent from "../../components/QuizQuestion";
import { AppTabScreenNavigationProp } from "../../navigation/types";

//STYLES
import { Colors, Radii } from "../../styles/GlobalStyles/colors";
import { Spacing } from "../../styles/GlobalStyles/spacing";
import { FontSizes } from "../../styles/GlobalStyles/typography";
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";

const QuickQuizScreen = () => {
  const { user, isLoading: authLoading, checkAuthStatus } = useAuth();
  const navigation =
    useNavigation<AppTabScreenNavigationProp<"QuickQuizScreen">>();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isAnswerChecking, setIsAnswerChecking] = useState(false);

  const userLanguageId = user?.selectedLanguageId;
  const quizLevel = "BEGINNER";
  const fetchQuizQuestions = useCallback(async () => {
    if (!userLanguageId) {
      Alert.alert("Dil Seçimi Hatası", "Lütfen önce bir dil seçin.");
      navigation.navigate("InitialLanguageSelectionScreen");
      return;
    }

    setLoadingQuiz(true);
    setQuizCompleted(false);
    setScore(0);
    setCurrentQuestionIndex(0);

    try {
      const fetchedQuestions = await getQuickQuizQuestions(
        userLanguageId,
        quizLevel
      );
      if (fetchedQuestions.length === 0) {
        Alert.alert("Uyarı", "Bu dilde veya seviyede soru bulunamadı.");
        setLoadingQuiz(false);
        return;
      }
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Quiz soruları çekme hatası:", error);
      Alert.alert("Hata", "Quiz soruları yüklenirken bir sorun oluştu.");
    } finally {
      setLoadingQuiz(false);
    }
  }, [userLanguageId, navigation, quizLevel]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && userLanguageId) {
        fetchQuizQuestions();
      }
      return () => {
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setQuizCompleted(false);
        setScore(0);
        setIsAnswerChecking(false);
      };
    }, [authLoading, userLanguageId, fetchQuizQuestions])
  );

  const handleAnswer = async (selectedOption: string) => {
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) {
      Alert.alert("Hata", "Soru bilgisi bulunamadı.");
      return;
    }

    setIsAnswerChecking(true);

    try {
      const result = await checkQuizAnswer(currentQuestion._id, selectedOption);

      if (result.isCorrect) {
        setScore((prevScore) => prevScore + result.pointsEarned);
        Alert.alert(
          "Tebrikler!",
          `Doğru cevap! ${result.pointsEarned} puan kazandınız.`
        );
      } else {
        Alert.alert(
          "Yanlış Cevap",
          `Maalesef doğru cevap bu değil. ${
            result.explanation ? `Açıklama: ${result.explanation}` : ""
          }`
        );
      }
    } catch (error) {
      console.error("Cevap kontrolü hatası:", error);
      Alert.alert("Hata", "Cevap kontrol edilirken bir sorun oluştu.");
    } finally {
      setIsAnswerChecking(false);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        setQuizCompleted(true);
        Alert.alert(
          "Quiz Tamamlandı!",
          `Toplamda ${score} puan kazandınız. Puanlar güncelleniyor...`
        );
        try {
          await updateScore(score);
          await checkAuthStatus();
          Alert.alert("Başarılı", "Puanınız başarıyla güncellendi!");
        } catch (error) {
          console.error("Global skor güncelleme hatası:", error);
          Alert.alert("Hata", "Puan güncelleme sırasında bir sorun oluştu.");
        }
      }
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (authLoading || !userLanguageId || loadingQuiz) {
    return (
      <View style={globalStyles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
        <Text style={globalStyles.bodyText}>
          {loadingQuiz ? "Quiz Yükleniyor..." : "Yükleniyor..."}
        </Text>
      </View>
    );
  }

  if (quizCompleted) {
    return (
      <View style={globalStyles.centeredContainer}>
        <Text style={styles.quizCompleteText}>Quiz Bitti!</Text>
        <Text style={styles.finalScoreText}>Kazandığınız Puan: {score}</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>Ana Menüye Dön</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { marginTop: Spacing.medium }]}
          onPress={fetchQuizQuestions}
        >
          <Text style={styles.actionButtonText}>Tekrar Oyna</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentQuestion && !loadingQuiz && !quizCompleted) {
    return (
      <View style={globalStyles.centeredContainer}>
        <Text style={styles.noQuestionText}>
          Bu seviye veya dilde soru bulunamadı.
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchQuizQuestions}
        >
          <Text style={styles.refreshButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.refreshButton, { marginTop: Spacing.small }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.refreshButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.scoreAndProgressText}>
        Puanınız: {user?.globalScore || 0} | Bu Quiz Puanı: {score} | Soru{" "}
        {currentQuestionIndex + 1}/{questions.length}
      </Text>
      {currentQuestion && (
        <QuizQuestionComponent
          question={currentQuestion}
          onAnswer={handleAnswer}
          disableInteractions={isAnswerChecking}
        />
      )}
      {isAnswerChecking && (
        <View style={styles.checkingAnswerOverlay}>
          <ActivityIndicator size="small" color={Colors.white} />
          <Text style={styles.checkingAnswerText}>
            Cevap kontrol ediliyor...
          </Text>
        </View>
      )}
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
  },
  scoreAndProgressText: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.medium,
    width: "90%",
  },
  quizCompleteText: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Spacing.medium,
  },
  finalScoreText: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.accentPrimary,
    marginBottom: Spacing.large,
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
  checkingAnswerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: Radii.large,
  },
  checkingAnswerText: {
    color: Colors.white,
    marginTop: Spacing.small,
    fontSize: FontSizes.body,
  },
});

export default QuickQuizScreen;
