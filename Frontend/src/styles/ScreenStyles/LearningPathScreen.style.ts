// LIBRARY
import { StyleSheet } from "react-native";

// STYLES
import { Colors, Radii, Shadow } from "../GlobalStyles/colors";
import { Spacing } from "../GlobalStyles/spacing";
import { FontSizes, Typography } from "../GlobalStyles/typography";

export const learningPathStyles = StyleSheet.create({
  scrollViewContent: {
    paddingVertical: Spacing.xLarge * 2.5,
    paddingHorizontal: Spacing.medium,
    alignItems: "center",
  },
  logoutButton: {
    position: "absolute",
    top: Spacing.xLarge * 1.5,
    right: Spacing.medium,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: Radii.medium,
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.soft,
  },
  logoutButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.small,
    fontWeight: "bold",
  },
  screenTitle: {
    ...Typography.h1,
    fontSize: FontSizes.xxLarge,
    color: Colors.accentPrimary,
    marginBottom: Spacing.xLarge,
    textAlign: "center",
    width: "100%",
  },
  levelSection: {
    width: "100%",
    marginBottom: Spacing.xLarge,
  },
  levelHeader: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.accentPrimary,
    marginBottom: Spacing.medium,
    paddingBottom: Spacing.xSmall,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    textAlign: "center",
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.medium,
    padding: Spacing.medium,
  },
  lessonOrder: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.accentSecondary,
    marginRight: Spacing.medium,
    minWidth: 30,
    textAlign: "right",
  },
  lessonContent: {
    flex: 1,
    paddingHorizontal: Spacing.small,
  },
  lessonTitle: {
    fontSize: FontSizes.large,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Spacing.xSmall,
  },
  lessonDescription: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    lineHeight: FontSizes.small * 1.4,
  },
  noLessonsText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: Spacing.large,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radii.medium,
    ...Shadow.soft,
    marginVertical: Spacing.medium,
    paddingHorizontal: Spacing.medium,
  },
  retryButton: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
    borderRadius: Radii.medium,
    marginTop: Spacing.large,
    ...Shadow.soft,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: FontSizes.h3,
    fontWeight: "bold",
  },
});
