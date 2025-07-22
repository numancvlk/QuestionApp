//LIBRARY
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
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
import QuizQuestionComponent from "../../components/QuizQuestion";
import { AppTabScreenNavigationProp } from "../../navigation/types";

//STYLES
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
  const [isAnswerChecking, setIsAnswerChecking] = useState(false);
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
      console.error("Soru çekme hatası:", error);
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
        setIsAnswerChecking(false);
      };
    }, [])
  );

  useEffect(() => {
    if (quizEnded) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (currentQuizScore > 0) {
        Alert.alert(
          "Süre Bitti!",
          `Yarışmayı ${currentQuizScore} puanla tamamladınız. Puanınız kaydediliyor...`,
          [
            {
              text: "Tamam",
              onPress: async () => {
                try {
                  await updateScore(currentQuizScore);
                  await checkAuthStatus();
                } catch (error) {
                  console.error("Puan kaydetme hatası:", error);
                  Alert.alert(
                    "Hata",
                    "Puanınız kaydedilirken bir sorun oluştu."
                  );
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("Süre Bitti!", "Bu turda puan kazanamadınız.");
      }
    }
  }, [quizEnded, currentQuizScore, checkAuthStatus]);

  const handleAnswer = async (selectedOption: string) => {
    if (quizEnded || !currentQuestion || isAnswerChecking) return;

    setIsAnswerChecking(true);

    try {
      const result = await checkQuizAnswer(currentQuestion._id, selectedOption);

      if (result.isCorrect) {
        setCurrentQuizScore((prevScore) => prevScore + result.pointsEarned);
      }
    } catch (error) {
      console.error("Cevap kontrolü hatası:", error);
      Alert.alert("Hata", "Cevap kontrol edilirken bir sorun oluştu.");
    } finally {
      setIsAnswerChecking(false);
      if (!quizEnded) {
        fetchQuestion();
      }
    }
  };

  if (authLoading || !userLanguageId) {
    return (
      <View style={globalStyles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
        <Text style={globalStyles.bodyText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!quizStarted) {
    return (
      <View style={globalStyles.centeredContainer}>
        <Text style={styles.startQuizText}>
          Zamanlı Yarışmaya Hoş Geldiniz!
        </Text>
        <Text style={styles.startQuizSubtitle}>
          {QUIZ_DURATION_SECONDS} saniye içinde olabildiğince çok soruya cevap
          ver.
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
          <Text style={styles.startButtonText}>Yarışmayı Başlat</Text>
        </TouchableOpacity>
        <Text style={styles.scoreTextCurrentSession}>
          Toplam Puanınız: {user?.globalScore || 0}{" "}
        </Text>
      </View>
    );
  }

  if (quizEnded) {
    return (
      <View style={globalStyles.centeredContainer}>
        <Text style={styles.endQuizText}>Yarışma Bitti!</Text>
        <Text style={styles.finalScoreText}>
          Bu turda kazandığınız puan: {currentQuizScore}
        </Text>
        <Text style={styles.scoreTextCurrentSession}>
          Toplam Puanınız: {user?.globalScore || 0}{" "}
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
          <Text style={styles.startButtonText}>Tekrar Başlat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>Kalan Süre: {timeLeft}s</Text>
      <Text style={styles.currentScoreText}>
        Bu Turdaki Puan: {currentQuizScore}
      </Text>
      {loadingQuestion || isAnswerChecking ? (
        <View style={globalStyles.centeredContainer}>
          <ActivityIndicator size="large" color={Colors.accentPrimary} />
          <Text style={globalStyles.bodyText}>
            {loadingQuestion
              ? "Soru Yükleniyor..."
              : "Cevap Kontrol Ediliyor..."}
          </Text>
        </View>
      ) : currentQuestion ? (
        <QuizQuestionComponent
          question={currentQuestion}
          onAnswer={handleAnswer}
          disableInteractions={loadingQuestion || isAnswerChecking}
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
  endQuizText: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Spacing.small,
  },
  finalScoreText: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.success,
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
  backButton: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: Radii.medium,
    marginTop: Spacing.small,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.body,
  },
});

export default TimedQuizScreen;
