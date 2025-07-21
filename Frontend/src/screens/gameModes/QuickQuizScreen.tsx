//LIBRARY
import React from "react";
import { View, Text, StyleSheet } from "react-native";

//STYLES
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";
import { Colors } from "../../styles/GlobalStyles/colors";
import { FontSizes } from "../../styles/GlobalStyles/typography";

const QuickQuizScreen: React.FC = () => {
  return (
    <View style={globalStyles.centeredContainer}>
      <Text style={styles.header}>Hızlı Yarışma Ekranı</Text>
      <Text style={styles.bodyText}>Burada hızlı yarışma soruları olacak.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.accentPrimary,
    marginBottom: 20,
  },
  bodyText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default QuickQuizScreen;
