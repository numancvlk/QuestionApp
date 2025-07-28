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
import { Colors, Radii } from "../styles/GlobalStyles/colors";
import { Spacing } from "../styles/GlobalStyles/spacing";
import { globalStyles } from "../styles/GlobalStyles/globalStyles";
import { FontSizes } from "../styles/GlobalStyles/typography";

//MY SCRIPTS
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "../navigation/types";
import { useAuth } from "../context/AuthContext";

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
  const navigation = useNavigation<RootStackNavigationProp<"AppTabs">>();
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
    <View style={globalStyles.centeredContainer}>
      <Text style={styles.quizCompleteText}>Quiz Bitti!</Text>
      <Text style={styles.finalScoreText}>
        Bu Quizden Kazanılan Puan: {earnedPoints}
      </Text>

      {motivationMessage && (
        <Text style={styles.motivationText}>{motivationMessage}</Text>
      )}

      {totalQuestions !== undefined && totalQuestions > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Toplam Soru: {totalQuestions}</Text>
          <Text style={[styles.statText, { color: Colors.successGreen }]}>
            Doğru Cevap: {correctAnswers}
          </Text>
          <Text style={[styles.statText, { color: Colors.errorRed }]}>
            Yanlış Cevap: {incorrectAnswers}
          </Text>
        </View>
      )}

      {!scoreUpdateCompleted ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onCollectPoints}
          disabled={isScoreUpdating}
        >
          {isScoreUpdating ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.actionButtonText}>Puanı Al</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.scoreCollectedContainer}>
          <Text style={styles.scoreCollectedText}>
            Puanınız hesabınıza eklendi!
          </Text>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                marginTop: Spacing.medium,
                backgroundColor: Colors.accentPrimary,
              },
            ]}
            onPress={handleGoHomeAfterPointsCollected}
          >
            <Text style={styles.actionButtonText}>Ana Menüye Dön</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  motivationText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: Spacing.medium,
    paddingHorizontal: Spacing.medium,
  },
  statsContainer: {
    marginBottom: Spacing.large,
    alignItems: "center",
  },
  statText: {
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.small / 2,
    fontWeight: "bold",
  },
  actionButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
    borderRadius: Radii.medium,
    marginTop: Spacing.large,
    minWidth: 180,
    alignItems: "center",
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: FontSizes.h3,
    fontWeight: "bold",
  },
  scoreCollectedContainer: {
    alignItems: "center",
  },
  scoreCollectedText: {
    fontSize: FontSizes.body,
    color: Colors.accentPrimary,
    marginTop: Spacing.large,
    marginBottom: Spacing.medium,
    fontWeight: "bold",
    textAlign: "center",
  },
  playAgainButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
    borderRadius: Radii.medium,
    marginTop: Spacing.small,
    minWidth: 180,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playAgainButtonText: {
    color: Colors.white,
    fontSize: FontSizes.h3,
    fontWeight: "bold",
  },
});

export default QuizSummaryScreen;
