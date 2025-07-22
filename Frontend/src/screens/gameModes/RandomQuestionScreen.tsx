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

const RandomQuestionScreen = () => {
  const { user, isLoading: authLoading, checkAuthStatus } = useAuth();
  const navigation =
    useNavigation<AppTabScreenNavigationProp<"RandomQuestionScreen">>();

  const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(
    null
  );
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [isAnswerChecking, setIsAnswerChecking] = useState(false);

  const userLanguageId = user?.selectedLanguageId;

  // Rastgele bir soru çekme fonksiyonu
  const fetchRandomQuestion = useCallback(async () => {
    if (!userLanguageId) {
      Alert.alert("Dil Seçimi Hatası", "Lütfen önce bir dil seçin.");
      navigation.navigate("InitialLanguageSelectionScreen");
      return;
    }

    setLoadingQuestion(true);
    setCurrentQuestion(null);
    setShowExplanation(false);
    setExplanationText("");
    setIsCorrectAnswer(null);

    try {
      const question = await getRandomQuestion(userLanguageId);
      setCurrentQuestion(question);
    } catch (error: any) {
      console.error("Rastgele soru çekme hatası:", error);
      Alert.alert(
        "Hata",
        error.message || "Rastgele soru yüklenirken bir sorun oluştu."
      );
    } finally {
      setLoadingQuestion(false);
    }
  }, [userLanguageId, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && userLanguageId) {
        fetchRandomQuestion();
      }
      return () => {
        setCurrentQuestion(null);
        setLoadingQuestion(false);
        setShowExplanation(false);
        setExplanationText("");
        setIsCorrectAnswer(null);
        setIsAnswerChecking(false);
      };
    }, [authLoading, userLanguageId, fetchRandomQuestion])
  );

  const handleAnswer = async (selectedOption: string) => {
    if (!currentQuestion || isAnswerChecking || showExplanation) return;

    setIsAnswerChecking(true);

    try {
      const result = await checkQuizAnswer(currentQuestion._id, selectedOption);

      setIsCorrectAnswer(result.isCorrect);
      setExplanationText(result.explanation || "Açıklama mevcut değil.");
      setShowExplanation(true);

      if (result.isCorrect) {
        await updateScore(result.pointsEarned);
        await checkAuthStatus();
        Alert.alert(
          "Tebrikler!",
          `Doğru cevap! ${result.pointsEarned} puan kazandınız.`,
          [{ text: "Tamam" }]
        );
      } else {
        Alert.alert("Yanlış Cevap", "Maalesef doğru cevap bu değil.", [
          { text: "Tamam" },
        ]);
      }
    } catch (error: any) {
      console.error("Cevap kontrolü veya puan güncelleme hatası:", error);
      Alert.alert(
        "Hata",
        error.message || "Cevap işlenirken bir sorun oluştu."
      );
      setIsCorrectAnswer(false);
      setExplanationText(
        error.message || "Cevap kontrol edilirken bir hata oluştu."
      );
      setShowExplanation(true);
    } finally {
      setIsAnswerChecking(false);
    }
  };

  if (authLoading || !userLanguageId || loadingQuestion) {
    return (
      <View style={globalStyles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
        <Text style={globalStyles.bodyText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>Puanınız: {user?.globalScore || 0}</Text>
      {currentQuestion ? (
        <>
          <QuizQuestionComponent
            question={currentQuestion}
            onAnswer={handleAnswer}
            disableInteractions={showExplanation || isAnswerChecking}
          />

          {showExplanation && (
            <View
              style={[
                styles.explanationContainer,
                {
                  backgroundColor: isCorrectAnswer
                    ? Colors.successLight
                    : Colors.errorLight,
                  borderColor: isCorrectAnswer ? Colors.success : Colors.error,
                },
              ]}
            >
              <Text style={styles.explanationTitle}>Açıklama:</Text>
              <Text style={styles.explanationText}>{explanationText}</Text>
              <TouchableOpacity
                style={styles.nextQuestionButton}
                onPress={fetchRandomQuestion}
              >
                <Text style={styles.nextQuestionButtonText}>Yeni Soru</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.nextQuestionButton,
                  {
                    marginTop: Spacing.small,
                    backgroundColor: Colors.backgroundSecondary,
                    borderColor: Colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => navigation.goBack()}
              >
                <Text
                  style={[
                    styles.nextQuestionButtonText,
                    { color: Colors.textPrimary },
                  ]}
                >
                  Geri Dön
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <View style={globalStyles.centeredContainer}>
          <Text style={styles.noQuestionText}>Soru bulunamadı.</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchRandomQuestion}
          >
            <Text style={styles.refreshButtonText}>Tekrar Dene</Text>
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
    justifyContent: "flex-start",
    alignItems: "center",
  },
  scoreText: {
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
    paddingHorizontal: Spacing.medium,
  },
  refreshButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: Radii.medium,
    marginTop: Spacing.medium,
  },
  refreshButtonText: {
    color: Colors.white,
    fontSize: FontSizes.body,
    fontWeight: "bold",
  },
  nextQuestionButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
    borderRadius: Radii.medium,
    marginTop: Spacing.large,
    alignSelf: "center",
  },
  nextQuestionButtonText: {
    color: Colors.white,
    fontSize: FontSizes.h3,
    fontWeight: "bold",
  },
  explanationContainer: {
    marginTop: Spacing.large,
    padding: Spacing.medium,
    borderRadius: Radii.medium,
    borderWidth: 1,
    width: "90%",
    alignItems: "center",
  },
  explanationTitle: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    marginBottom: Spacing.small,
    color: Colors.textPrimary,
  },
  explanationText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.medium,
  },
});

export default RandomQuestionScreen;
