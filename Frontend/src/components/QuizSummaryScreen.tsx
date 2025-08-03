// LIBRARY
import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";

//STYLES
import { Colors } from "../styles/GlobalStyles/colors";
import { Spacing } from "../styles/GlobalStyles/spacing";
import { globalStyles } from "../styles/GlobalStyles/globalStyles";
import { lessonDetailStyles } from "../styles/ScreenStyles/LessonDetailScreen.style";

//MY SCRIPTS
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";

interface QuizSummaryScreenProps {
  earnedPoints: number;
  isScoreUpdating: boolean;
  scoreUpdateCompleted: boolean;
  onCollectPoints: () => void;
  isTimedQuiz?: boolean;
  isRandomQuiz?: boolean;
  correctAnswers?: number;
  incorrectAnswers?: number;
  totalQuestions?: number;
  motivationMessage?: string;
}

const QuizSummaryScreen: React.FC<QuizSummaryScreenProps> = ({
  earnedPoints,
  isScoreUpdating,
  scoreUpdateCompleted,
  onCollectPoints,
  isTimedQuiz = false,
  isRandomQuiz = false,
  correctAnswers,
  incorrectAnswers,
  totalQuestions,
  motivationMessage,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const handleGoHomeAfterPointsCollected = useCallback(() => {
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
  }, [user?.selectedLanguageId, navigation]);

  useEffect(() => {
    if ((isTimedQuiz || isRandomQuiz) && scoreUpdateCompleted) {
      const timer = setTimeout(() => {
        handleGoHomeAfterPointsCollected();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [
    isTimedQuiz,
    isRandomQuiz,
    scoreUpdateCompleted,
    handleGoHomeAfterPointsCollected,
  ]);

  return (
    <View style={lessonDetailStyles.summaryContainer}>
      <Text style={lessonDetailStyles.summaryTitle}>Quiz Bitti!</Text>
      <Text style={lessonDetailStyles.summaryPointsText}>
        Bu Quizden Kazanılan Puan: {earnedPoints}
      </Text>

      {motivationMessage && (
        <Text style={lessonDetailStyles.motivationText}>
          {motivationMessage}
        </Text>
      )}

      {totalQuestions !== undefined && totalQuestions > 0 && (
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
            Doğru Cevap: {correctAnswers}
          </Text>
          <Text
            style={[
              lessonDetailStyles.summaryStatText,
              lessonDetailStyles.summaryStatIncorrect,
            ]}
          >
            Yanlış Cevap: {incorrectAnswers}
          </Text>
        </View>
      )}

      {!scoreUpdateCompleted ? (
        <TouchableOpacity
          style={lessonDetailStyles.backToPathButton}
          onPress={onCollectPoints}
          disabled={isScoreUpdating}
        >
          {isScoreUpdating ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={lessonDetailStyles.backToPathButtonText}>
              Puanı Al
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.scoreCollectedContainer}>
          <Text style={styles.scoreCollectedText}>
            Puanınız hesabınıza eklendi!
          </Text>
          <TouchableOpacity
            style={lessonDetailStyles.backToPathButton}
            onPress={handleGoHomeAfterPointsCollected}
          >
            <Text style={lessonDetailStyles.backToPathButtonText}>
              Ana Menüye Dön
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scoreCollectedContainer: {
    alignItems: "center",
    marginTop: Spacing.large,
  },
  scoreCollectedText: {
    ...globalStyles.bodyText,
    color: Colors.accentPrimary,
    marginTop: Spacing.medium,
    marginBottom: Spacing.medium,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default QuizSummaryScreen;
