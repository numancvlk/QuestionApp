//LIBRARY
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

//MY SCRIPTS
import { useAuth } from "../../context/AuthContext";
import {
  getDailyQuestion,
  checkDailyQuestionAnswer,
  checkDailyQuestionStatus,
} from "../../api/userApi";
import { QuizQuestion } from "../../types";
import QuizQuestionComponent from "../../components/QuizQuestion";
import { DailyQuestionModalNavigationProp } from "../../navigation/types";

//STYLES
import { Colors, Radii } from "../../styles/GlobalStyles/colors";
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";
import { Spacing } from "../../styles/GlobalStyles/spacing";
import { FontSizes } from "../../styles/GlobalStyles/typography";

const DailyQuestionScreen = () => {
  const { user, isLoading: authLoading, checkAuthStatus } = useAuth();
  const navigation = useNavigation<DailyQuestionModalNavigationProp>();

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null
  );
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);

  const userLanguageId = user?.selectedLanguageId;

  const fetchDailyQuestionAndStatus = useCallback(async () => {
    if (!userLanguageId) {
      Alert.alert("Dil Seçimi Hatası", "Lütfen önce bir dil seçin.");
      navigation.goBack(); // Modalı kapat
      navigation.navigate("InitialLanguageSelectionScreen");
      return;
    }

    setLoadingQuestion(true);
    setCurrentQuestion(null);
    setShowFeedback(false);
    setExplanationText("");
    setIsCorrectAnswer(null);
    setHasAnsweredToday(false);

    try {
      const statusResponse = await checkDailyQuestionStatus();
      if (statusResponse.hasAnsweredToday) {
        setHasAnsweredToday(true);
        setNextAttemptTime(statusResponse.nextAttemptTime || null);
        navigation.goBack();
        return;
      }

      const questionResponse = await getDailyQuestion(userLanguageId);
      setCurrentQuestion(questionResponse);
      setHasAnsweredToday(false);
    } catch (error: any) {
      console.error("Günlük soru veya durum çekme hatası:", error);
      Alert.alert(
        "Hata",
        error.message || "Soru yüklenirken bir sorun oluştu."
      );
      navigation.goBack();
    } finally {
      setLoadingQuestion(false);
    }
  }, [userLanguageId, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && userLanguageId) {
        fetchDailyQuestionAndStatus();
      }
      return () => {
        setCurrentQuestion(null);
        setLoadingQuestion(false);
        setHasAnsweredToday(false);
        setNextAttemptTime(null);
        setShowFeedback(false);
        setExplanationText("");
        setIsCorrectAnswer(null);
      };
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

      if (result.isCorrect) {
        Alert.alert("Tebrikler!", `${result.pointsEarned} puan kazandınız.`, [
          {
            text: "Tamam",
            onPress: () => setShowFeedback(true),
          },
        ]);
      } else {
        Alert.alert("Yanlış Cevap", `Maalesef doğru cevap bu değil.`, [
          {
            text: "Tamam",
            onPress: () => setShowFeedback(true),
          },
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
      setShowFeedback(true);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleCloseModal = () => {
    navigation.goBack(); // Modalı kapat
  };

  const handleCloseFeedback = useCallback(() => {
    setShowFeedback(false);
    navigation.goBack();
  }, [navigation]);

  if (authLoading || loadingQuestion) {
    return (
      <Modal visible={true} transparent={true} animationType="fade">
        <View style={globalStyles.centeredContainer}>
          <ActivityIndicator size="large" color={Colors.accentPrimary} />
          <Text style={globalStyles.bodyText}>Günün Sorusu Yükleniyor...</Text>
        </View>
      </Modal>
    );
  }

  if (hasAnsweredToday || !currentQuestion) {
    return null;
  }

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Kapatma butonu */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
          >
            <Icon name="close-circle" size={30} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.dailyQuestionTitle}>Günün Sorusu</Text>
          <Text style={styles.scoreText}>
            Puanınız: {user?.globalScore || 0}
          </Text>

          {currentQuestion ? (
            <QuizQuestionComponent
              question={currentQuestion}
              onAnswer={handleAnswer}
              disableInteractions={showFeedback}
            />
          ) : (
            <Text style={styles.noQuestionText}>Günün sorusu bulunamadı.</Text>
          )}

          <Modal
            visible={showFeedback}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCloseFeedback}
          >
            <View style={styles.feedbackOverlay}>
              <View
                style={[
                  styles.feedbackContainer,
                  {
                    backgroundColor: isCorrectAnswer
                      ? Colors.successLight
                      : Colors.errorLight,
                    borderColor: isCorrectAnswer
                      ? Colors.success
                      : Colors.error,
                  },
                ]}
              >
                <Text style={styles.feedbackTitle}>
                  {isCorrectAnswer ? "Doğru Cevap!" : "Yanlış Cevap!"}
                </Text>
                <Text style={styles.feedbackText}>{explanationText}</Text>
                <TouchableOpacity
                  style={styles.feedbackButton}
                  onPress={handleCloseFeedback}
                >
                  <Text style={styles.feedbackButtonText}>Tamam</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: Radii.large,
    padding: Spacing.large,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.small,
    right: Spacing.small,
    zIndex: 1,
    padding: Spacing.xSmall,
  },
  dailyQuestionTitle: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.accentPrimary,
    marginBottom: Spacing.medium,
    marginTop: Spacing.medium,
  },
  scoreText: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.large,
  },
  noQuestionText: {
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.medium,
    textAlign: "center",
    paddingHorizontal: Spacing.medium,
  },
  feedbackOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackContainer: {
    padding: Spacing.large,
    borderRadius: Radii.medium,
    borderWidth: 1,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedbackTitle: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    marginBottom: Spacing.medium,
    color: Colors.textPrimary,
  },
  feedbackText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.large,
  },
  feedbackButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
    borderRadius: Radii.medium,
    minWidth: 120,
    alignItems: "center",
  },
  feedbackButtonText: {
    color: Colors.white,
    fontSize: FontSizes.h3,
    fontWeight: "bold",
  },
});

export default DailyQuestionScreen;
