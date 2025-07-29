// LIBRARY
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from "react-native";

//MY SCRIPTS
import { QuizQuestion } from "../types";

//STYLES
import { Colors, Radii } from "../styles/GlobalStyles/colors";
import { Spacing } from "../styles/GlobalStyles/spacing";
import { lessonDetailStyles } from "../styles/ScreenStyles/LessonDetailScreen.style";

const { height, width } = Dimensions.get("window");

interface QuizQuestionProps {
  question: QuizQuestion;
  onAnswer: (selectedOption: string) => void;
  disableInteractions?: boolean;
  selectedOptionFromParent?: string | null;
  isCorrectAnswerFromParent?: boolean | null;
  showFeedbackAreaFromParent?: boolean;
  correctAnswerStringFromParent?: string;
}

const QuizQuestionComponent: React.FC<QuizQuestionProps> = ({
  question,
  onAnswer,
  disableInteractions,
  selectedOptionFromParent,
  showFeedbackAreaFromParent,
  correctAnswerStringFromParent,
}) => {
  const [textInputAnswer, setTextInputAnswer] = useState("");
  const [selectedOptionLocal, setSelectedOptionLocal] = useState<string | null>(
    null
  );

  useEffect(() => {
    setTextInputAnswer("");
    setSelectedOptionLocal(null);
  }, [question, disableInteractions]);

  const handleOptionPress = (option: string) => {
    if (!disableInteractions && !showFeedbackAreaFromParent) {
      setSelectedOptionLocal(option);
    }
  };

  const handleSubmitAnswer = () => {
    if (question.type === "multipleChoice") {
      if (selectedOptionLocal) {
        onAnswer(selectedOptionLocal);
      } else {
        alert("Lütfen bir seçenek seçin.");
      }
    } else {
      if (textInputAnswer.trim() !== "") {
        onAnswer(textInputAnswer.trim());
      } else {
        alert("Lütfen cevabınızı girin.");
      }
    }
  };

  const effectiveCorrectAnswerString =
    question.type === "multipleChoice"
      ? Array.isArray(question.correctAnswer)
        ? question.correctAnswer[0]
        : question.correctAnswer || ""
      : correctAnswerStringFromParent;

  return (
    <View style={styles.fixedHeightContainer}>
      <View style={styles.container}>
        <Text style={lessonDetailStyles.questionText}>{question.question}</Text>

        {question.type === "multipleChoice" && (
          <View style={lessonDetailStyles.optionsContainer}>
            {question.options?.map((option, index) => {
              const isOptionCorrect =
                effectiveCorrectAnswerString?.toLowerCase() ===
                option.toLowerCase();
              const isOptionSelected =
                selectedOptionLocal === option ||
                selectedOptionFromParent === option;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    lessonDetailStyles.optionButton,
                    styles.quizOptionButton,
                    isOptionSelected &&
                      !showFeedbackAreaFromParent &&
                      lessonDetailStyles.selectedOption,
                    showFeedbackAreaFromParent &&
                      isOptionCorrect &&
                      lessonDetailStyles.correctOption,
                    showFeedbackAreaFromParent &&
                      !isOptionCorrect &&
                      isOptionSelected &&
                      lessonDetailStyles.wrongOption,
                    disableInteractions || showFeedbackAreaFromParent
                      ? styles.disabledOptionButton
                      : null,
                  ]}
                  onPress={() => handleOptionPress(option)}
                  disabled={disableInteractions || showFeedbackAreaFromParent}
                >
                  <Text style={lessonDetailStyles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {(question.type === "text" || question.type === "fillInTheBlanks") && (
          <View style={styles.textInputContainer}>
            <TextInput
              style={lessonDetailStyles.textInput}
              onChangeText={setTextInputAnswer}
              value={textInputAnswer}
              placeholder={
                question.type === "text"
                  ? "Cevabınızı buraya yazın..."
                  : "Boşluğu doldurun..."
              }
              placeholderTextColor={Colors.textPlaceholder}
              editable={!disableInteractions && !showFeedbackAreaFromParent}
            />
          </View>
        )}

        <TouchableOpacity
          style={[
            lessonDetailStyles.submitButton,
            styles.quizSubmitButton,
            (question.type === "multipleChoice" && !selectedOptionLocal) ||
            ((question.type === "text" ||
              question.type === "fillInTheBlanks") &&
              textInputAnswer.trim() === "") ||
            disableInteractions ||
            showFeedbackAreaFromParent
              ? styles.disabledSubmitButton
              : null,
          ]}
          onPress={handleSubmitAnswer}
          disabled={
            disableInteractions ||
            showFeedbackAreaFromParent ||
            (question.type === "multipleChoice" && !selectedOptionLocal) ||
            ((question.type === "text" ||
              question.type === "fillInTheBlanks") &&
              textInputAnswer.trim() === "")
          }
        >
          <Text style={lessonDetailStyles.submitButtonText}>
            Cevabı Kontrol Et
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fixedHeightContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: Spacing.medium,
  },
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radii.large,
    padding: Spacing.large,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
    maxWidth: width * 0.9,
    minHeight: height * 0.4,
    justifyContent: "center",
  },
  quizOptionButton: {
    minHeight: 55,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.medium,
  },
  disabledOptionButton: {
    opacity: 0.6,
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.lightGray,
  },
  textInputContainer: {
    marginTop: Spacing.medium,
    width: "100%",
    alignItems: "center",
  },
  quizSubmitButton: {
    minHeight: 55,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.large * 1.5,
    paddingVertical: Spacing.medium,
    marginTop: Spacing.large,
    alignSelf: "center",
  },
  disabledSubmitButton: {
    opacity: 0.6,
    backgroundColor: Colors.lightGray,
  },
});

export default QuizQuestionComponent;
