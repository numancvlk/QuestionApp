//LIBRARY
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

//STYLES
import { Colors, Radii } from "../styles/GlobalStyles/colors";
import { Spacing } from "../styles/GlobalStyles/spacing";
import { FontSizes } from "../styles/GlobalStyles/typography";

interface QuizAnswerFeedbackProps {
  isVisible: boolean | null;
  isCorrect: boolean | null;
  feedbackText: string;
  onContinue: () => void;
}

const QuizAnswerFeedback: React.FC<QuizAnswerFeedbackProps> = ({
  isVisible,
  isCorrect,
  feedbackText,
  onContinue,
}) => {
  if (!isVisible) {
    return null;
  }

  const backgroundColor = isCorrect ? Colors.successGreen : Colors.errorRed;
  const continueButtonText = isCorrect ? "Devam" : "Devam";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.feedbackText}>{feedbackText}</Text>
      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueButtonText}>{continueButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: Spacing.large,
    paddingHorizontal: Spacing.medium,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: Radii.large,
    borderTopRightRadius: Radii.large,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  feedbackText: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.medium,
  },
  continueButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.large,
    borderRadius: Radii.medium,
  },
  continueButtonText: {
    fontSize: FontSizes.body,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
});

export default QuizAnswerFeedback;
