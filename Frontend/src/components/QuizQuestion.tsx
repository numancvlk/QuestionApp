// LIBRARY
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";

//MY SCRIPTS
import { QuizQuestion } from "../types";

//STYLES
import { Colors, Radii } from "../styles/GlobalStyles/colors";
import { FontSizes } from "../styles/GlobalStyles/typography";
import { Spacing } from "../styles/GlobalStyles/spacing";

interface QuizQuestionProps {
  question: QuizQuestion;
  onAnswer: (selectedOption: string) => void;
  disableInteractions?: boolean;
}

const QuizQuestionComponent: React.FC<QuizQuestionProps> = ({
  question,
  onAnswer,
  disableInteractions,
}) => {
  const [textInputAnswer, setTextInputAnswer] = React.useState("");

  const handleOptionPress = (option: string) => {
    if (!disableInteractions) {
      onAnswer(option);
    }
  };

  const handleSubmitTextAnswer = () => {
    if (!disableInteractions && textInputAnswer.trim() !== "") {
      onAnswer(textInputAnswer.trim());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{question.question}</Text>

      {question.type === "multipleChoice" && (
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                disableInteractions && styles.disabledOptionButton,
              ]}
              onPress={() => handleOptionPress(option)}
              disabled={disableInteractions}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {(question.type === "text" || question.type === "fillInTheBlanks") && (
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            onChangeText={setTextInputAnswer}
            value={textInputAnswer}
            placeholder={
              question.type === "text"
                ? "Cevabınızı buraya yazın..."
                : "Boşluğu doldurun..."
            }
            placeholderTextColor={Colors.textPlaceholder}
            editable={!disableInteractions}
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              disableInteractions && styles.disabledSubmitButton,
            ]}
            onPress={handleSubmitTextAnswer}
            disabled={disableInteractions || textInputAnswer.trim() === ""}
          >
            <Text style={styles.submitButtonText}>Cevapla</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radii.large,
    padding: Spacing.large,
    marginHorizontal: Spacing.medium,
    marginBottom: Spacing.large,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  questionText: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Spacing.large,
    textAlign: "center",
  },
  optionsContainer: {
    marginTop: Spacing.medium,
  },
  optionButton: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: Radii.medium,
    marginBottom: Spacing.small,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  disabledOptionButton: {
    opacity: 0.6,
    backgroundColor: Colors.lightGray,
  },
  optionText: {
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  textInputContainer: {
    marginTop: Spacing.medium,
    width: "100%",
    alignItems: "center",
  },
  textInput: {
    width: "100%",
    height: 50,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.medium,
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.medium,
    backgroundColor: Colors.backgroundSecondary,
  },
  submitButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: Radii.medium,
  },
  disabledSubmitButton: {
    opacity: 0.6,
    backgroundColor: Colors.lightGray,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: FontSizes.body,
    fontWeight: "bold",
  },
});

export default QuizQuestionComponent;
