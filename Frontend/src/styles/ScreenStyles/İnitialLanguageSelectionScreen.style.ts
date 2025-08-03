//LIBRARY
import { StyleSheet } from "react-native";

//STYLES
import { Colors, Radii, Shadow } from "../GlobalStyles/colors";
import { Spacing } from "../GlobalStyles/spacing";
import { FontSizes } from "../GlobalStyles/typography";

export const initialLanguageSelectionStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    paddingTop: Spacing.xLarge * 2,
    paddingHorizontal: Spacing.medium,
    alignItems: "center",
  },
  header: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.accentPrimary,
    marginBottom: Spacing.xLarge,
    textAlign: "center",
  },
  listContentContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    paddingBottom: Spacing.large,
  },
  languageItem: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radii.medium,
    padding: Spacing.medium,
    marginBottom: Spacing.medium,
    ...Shadow.soft,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  languageName: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
});
