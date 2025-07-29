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
import { Colors } from "../styles/GlobalStyles/colors";
import { globalStyles } from "../styles/GlobalStyles/globalStyles";
import { lessonDetailStyles } from "../styles/ScreenStyles/LessonDetailScreen.style";

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
    <View style={lessonDetailStyles.introContainer}>
      <Text style={lessonDetailStyles.lessonTitle}>{title}</Text>
      <Text style={lessonDetailStyles.lessonDescription}>{description}</Text>

      {isRandomQuiz && (
        <View style={styles.levelSelectionContainer}>
          <Text style={styles.levelSelectionLabel}>Soru Sayısı:</Text>
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
          <Text style={styles.levelSelectionLabel}>Zorluk Seviyesi:</Text>
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
                {level === "BEGINNER"
                  ? "Başlangıç"
                  : level === "INTERMEDIATE"
                  ? "Orta"
                  : level === "ADVANCED"
                  ? "İleri"
                  : "Uzman"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={lessonDetailStyles.startButton}
        onPress={handleStart}
        disabled={isLoading || (isRandomQuiz && !selectedQuestionCount)}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={lessonDetailStyles.startButtonText}>Başla</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  levelSelectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 25,
    width: "100%",
    paddingHorizontal: 10,
  },
  levelSelectionLabel: {
    ...globalStyles.bodyText,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 15,
    width: "100%",
    textAlign: "center",
  },
  levelButton: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedLevelButton: {
    backgroundColor: Colors.primary + "1A",
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  levelButtonText: {
    ...globalStyles.bodyText,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  selectedLevelButtonText: {
    color: Colors.textPrimary,
  },
});

export default QuizIntroScreen;
