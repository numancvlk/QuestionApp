//LIBRARY
import { StyleSheet } from "react-native";
import { Colors, Radii, Shadow } from "../GlobalStyles/colors";
import { Spacing } from "../GlobalStyles/spacing";
import { FontSizes } from "../GlobalStyles/typography";

export const learningPathStyles = StyleSheet.create({
  scrollViewContent: {
    paddingTop: Spacing.xLarge * 2,
    paddingBottom: Spacing.xLarge,
    alignItems: "center",
  },
  screenTitle: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.accentPrimary,
    marginBottom: Spacing.small,
    textAlign: "center",
  },
  screenSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xLarge,
    paddingHorizontal: Spacing.medium,
  },
  logoutButton: {
    position: "absolute",
    top: Spacing.medium,
    right: Spacing.medium,
    backgroundColor: Colors.danger,
    paddingVertical: Spacing.xSmall,
    paddingHorizontal: Spacing.small,
    borderRadius: Radii.small,
    zIndex: 10,
    ...Shadow.soft,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: FontSizes.small,
    fontWeight: "bold",
  },
  levelSection: {
    width: "90%",
    maxWidth: 600,
    marginBottom: Spacing.xLarge,
    alignItems: "center",
  },
  levelHeader: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.large,
    borderRadius: Radii.medium,
    marginBottom: Spacing.large,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.default,
    textTransform: "uppercase",
  },
  lessonItem: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radii.medium,
    padding: Spacing.medium,
    marginBottom: Spacing.medium,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: Colors.accentPrimary,
    ...Shadow.soft,
  },
  lessonOrder: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.accentSecondary,
    marginRight: Spacing.small,
    minWidth: 40,
    textAlign: "center",
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Spacing.xSmall,
  },
  lessonDescription: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: FontSizes.body * 1.4,
  },
  noLessonsText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    padding: Spacing.medium,
  },
});
