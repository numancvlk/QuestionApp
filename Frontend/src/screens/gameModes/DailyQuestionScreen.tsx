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
  getDailyQuestion,
  checkDailyQuestionAnswer,
  checkDailyQuestionStatus,
} from "../../api/userApi";
import { QuizQuestion } from "../../types";
import QuizQuestionComponent from "../../components/QuizQuestion";
import { AppTabScreenNavigationProp } from "../../navigation/types";

//STYLES
import { Colors, Radii } from "../../styles/GlobalStyles/colors";
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";
import { Spacing } from "../../styles/GlobalStyles/spacing";
import { FontSizes } from "../../styles/GlobalStyles/typography";

const DailyQuestionScreen = () => {
  const { user, isLoading: authLoading, checkAuthStatus } = useAuth();
  const navigation =
    useNavigation<AppTabScreenNavigationProp<"DailyQuestionScreen">>();

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null
  );
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);

  const userLanguageId = user?.selectedLanguageId;

  const fetchDailyQuestionAndStatus = useCallback(async () => {
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
    setHasAnsweredToday(false);

    try {
      const statusResponse = await checkDailyQuestionStatus();
      if (statusResponse.hasAnsweredToday) {
        setHasAnsweredToday(true);
        setNextAttemptTime(statusResponse.nextAttemptTime || null);
        Alert.alert(
          "Günün Sorusu",
          `Günün sorusunu zaten yanıtladınız. ${
            statusResponse.nextAttemptTime
              ? `Yarın (${new Date(
                  statusResponse.nextAttemptTime
                ).toLocaleDateString()}) `
              : ""
          }tekrar deneyin!`
        );
        return;
      }

      const questionResponse = await getDailyQuestion(userLanguageId);
      setCurrentQuestion(questionResponse);
      setHasAnsweredToday(false);
    } catch (error: any) {
      console.error("Günlük soru veya durum çekme hatası:", error);
      if (error.message.includes("already answered")) {
        setHasAnsweredToday(true);
        Alert.alert(
          "Günün Sorusu",
          "Günün sorusunu zaten yanıtladınız. Yarın tekrar deneyin!"
        );
      } else {
        Alert.alert(
          "Hata",
          error.message || "Soru yüklenirken bir sorun oluştu."
        );
      }
    } finally {
      setLoadingQuestion(false);
    }
  }, [userLanguageId, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && userLanguageId) {
        fetchDailyQuestionAndStatus();
      }
    }, [authLoading, userLanguageId, fetchDailyQuestionAndStatus])
  );

  const handleAnswer = async (selectedOption: string) => {
    if (!currentQuestion) {
      Alert.alert("Hata", "Soru bilgisi bulunamadı.");
      return;
    }

    setLoadingQuestion(true);
    try {
      const result = await checkDailyQuestionAnswer(
        currentQuestion._id,
        selectedOption
      );

      setIsCorrectAnswer(result.isCorrect);
      setExplanationText(result.explanation || "Açıklama mevcut değil.");
      setShowExplanation(true);

      if (result.isCorrect) {
        Alert.alert("Tebrikler!", `${result.pointsEarned} puan kazandınız.`, [
          { text: "Tamam" },
        ]);
      } else {
        Alert.alert("Yanlış Cevap", "Maalesef doğru cevap bu değil.", [
          { text: "Tamam" },
        ]);
      }
      await checkAuthStatus();
      setHasAnsweredToday(true);
    } catch (error: any) {
      console.error("Cevap kontrolü veya puan güncelleme hatası:", error);
      Alert.alert(
        "Hata",
        error.message || "Cevap işlenirken bir sorun oluştu."
      );
      setHasAnsweredToday(true);
      setExplanationText(error.message || "Cevap işlenirken bir hata oluştu.");
      setShowExplanation(true);
    } finally {
      setLoadingQuestion(false);
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

  if (hasAnsweredToday && !showExplanation) {
    return (
      <View style={globalStyles.centeredContainer}>
        <Text style={styles.noQuestionText}>
          Günün sorusunu bugün yanıtladınız.{"\n"}
          {nextAttemptTime
            ? `Yarın (${new Date(
                nextAttemptTime
              ).toLocaleDateString()}) tekrar deneyin!`
            : "Yarın tekrar deneyin!"}
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.refreshButtonText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
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
            disableInteractions={showExplanation}
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
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.nextQuestionButtonText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <View style={globalStyles.centeredContainer}>
          <Text style={styles.noQuestionText}>Soru bulunamadı.</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchDailyQuestionAndStatus}
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

export default DailyQuestionScreen;
