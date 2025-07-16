//LIBRARY
import { StyleSheet } from "react-native";

//STYLES
import { Colors, Radii, Shadow } from "../GlobalStyles/colors";
import { FontSizes } from "../GlobalStyles/typography";
import { Spacing } from "../GlobalStyles/spacing";

export const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radii.large,
    padding: Spacing.xLarge,
    alignItems: "center",
    ...Shadow.default,
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.accentPrimary,
    marginBottom: Spacing.small,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xLarge,
  },
  input: {
    width: "100%",
    padding: Spacing.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.small,
    marginBottom: Spacing.medium,
    fontSize: FontSizes.body,
    color: Colors.textOnLight,
    backgroundColor: Colors.white,
  },
  button: {
    width: "100%",
    padding: Spacing.medium,
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radii.small,
    alignItems: "center",
    marginBottom: Spacing.medium,
    ...Shadow.soft,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.h3,
    fontWeight: "bold",
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.small,
  },
  linkTextBold: {
    fontWeight: "bold",
    color: Colors.accentSecondary,
  },
});
