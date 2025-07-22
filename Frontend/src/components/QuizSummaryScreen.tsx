//LIBRARY
import React from "react";
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
import { FontSizes } from "../styles/GlobalStyles/typography";
import { globalStyles } from "../styles/GlobalStyles/globalStyles";

//MY SCRIPTS
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "../navigation/types";
import { useAuth } from "../context/AuthContext";

interface QuizSummaryScreenProps {
  earnedPoints: number;
  isScoreUpdating: boolean;
  scoreUpdateCompleted: boolean;
  onCollectPoints: () => void;
}

const QuizSummaryScreen: React.FC<QuizSummaryScreenProps> = ({
  earnedPoints,
  isScoreUpdating,
  scoreUpdateCompleted,
  onCollectPoints,
}) => {
  const navigation = useNavigation<RootStackNavigationProp<"AppTabs">>();
  const { user } = useAuth();

  const handleGoHomeAfterPointsCollected = () => {
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
  };

  return (
    <View style={globalStyles.centeredContainer}>
      <Text style={styles.quizCompleteText}>Quiz Bitti!</Text>
      <Text style={styles.finalScoreText}>
        Bu Quizden Kazanılan Puan: {earnedPoints}
      </Text>

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
        <View>
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
  scoreCollectedText: {
    fontSize: FontSizes.body,
    color: Colors.accentPrimary,
    marginTop: Spacing.large,
    marginBottom: Spacing.medium,
    fontWeight: "bold",
  },
});

export default QuizSummaryScreen;
