// LIBRARY
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

//STYLES
import { Colors, Radii } from "../styles/GlobalStyles/colors";
import { Spacing } from "../styles/GlobalStyles/spacing";
import { FontSizes } from "../styles/GlobalStyles/typography";
import { globalStyles } from "../styles/GlobalStyles/globalStyles";

export type QuizLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

interface QuizIntroScreenProps {
  onStartQuiz: (levelOrCount: QuizLevel | number) => void;
  isLoading: boolean;
  selectedLevel?: QuizLevel;
  onLevelSelect?: (level: QuizLevel) => void;
  selectedQuestionCount?: number;
  onQuestionCountSelect?: (count: number) => void;
  title?: string;
  description?: string;
  isTimedQuiz?: boolean;
  isRandomQuiz?: boolean;
  questionCountOptions?: number[];
}

const QuizIntroScreen: React.FC<QuizIntroScreenProps> = ({
  onStartQuiz,
  isLoading,
  selectedLevel,
  onLevelSelect,
  selectedQuestionCount,
  onQuestionCountSelect,
  title = "Hızlı Yarışmaya Hoş Geldin!",
  description = "Seviyeni seç ve bilgini test et.",
  isTimedQuiz = false,
  isRandomQuiz = false,
  questionCountOptions = [10, 20, 30, 40],
}) => {
  const handleStart = () => {
    if (isRandomQuiz && selectedQuestionCount) {
      onStartQuiz(selectedQuestionCount);
    } else if (!isTimedQuiz && selectedLevel) {
      onStartQuiz(selectedLevel);
    } else {
      onStartQuiz(0);
    }
  };

  return (
    <View style={globalStyles.centeredContainer}>
      <Text style={styles.introTitle}>{title}</Text>
      <Text style={styles.introDescription}>{description}</Text>

      {isRandomQuiz && (
        <View style={styles.levelSelectionContainer}>
          {questionCountOptions.map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.levelButton,
                selectedQuestionCount === count && styles.selectedLevelButton,
              ]}
              onPress={() =>
                onQuestionCountSelect && onQuestionCountSelect(count)
              }
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  selectedQuestionCount === count &&
                    styles.selectedLevelButtonText,
                ]}
              >
                {count} Soru
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!isTimedQuiz && !isRandomQuiz && (
        <View style={styles.levelSelectionContainer}>
          {["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                selectedLevel === level && styles.selectedLevelButton,
              ]}
              onPress={() => onLevelSelect && onLevelSelect(level as QuizLevel)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  selectedLevel === level && styles.selectedLevelButtonText,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStart}
        disabled={isLoading || (isRandomQuiz && !selectedQuestionCount)}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.startButtonText}>Başla</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  introTitle: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Spacing.medium,
  },
  introDescription: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.large,
    paddingHorizontal: Spacing.large,
  },
  levelSelectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: Spacing.large,
  },
  levelButton: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: Radii.medium,
    margin: Spacing.xSmall,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedLevelButton: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.accentPrimary,
  },
  levelButtonText: {
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
    fontWeight: "bold",
  },
  selectedLevelButtonText: {
    color: Colors.white,
  },
  startButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
    borderRadius: Radii.medium,
    marginTop: Spacing.large,
    minWidth: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: Colors.white,
    fontSize: FontSizes.h3,
    fontWeight: "bold",
  },
});

export default QuizIntroScreen;
