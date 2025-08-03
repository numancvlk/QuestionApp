import { StyleSheet } from "react-native";
import { Colors, Radii, Shadow } from "../GlobalStyles/colors";
import { globalStyles } from "../GlobalStyles/globalStyles";
import { Spacing } from "../GlobalStyles/spacing";
import { Typography } from "../GlobalStyles/typography";

export const leaderboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    padding: Spacing.medium,
  },
  title: {
    ...Typography.h1,
    textAlign: "center",
    marginBottom: Spacing.large,
    color: Colors.textPrimary,
  },
  loadingText: {
    ...Typography.body,
    textAlign: "center",
    marginTop: Spacing.medium,
    color: Colors.textSecondary,
  },
  errorText: {
    ...Typography.body,
    textAlign: "center",
    marginTop: Spacing.medium,
    color: Colors.error,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.medium,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radii.medium,
    ...Shadow.soft,
    padding: Spacing.xSmall,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: Colors.primary,
    ...Shadow.soft,
  },
  tabButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  section: {
    marginBottom: Spacing.large,
    ...globalStyles.card,
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.medium,
  },
  sectionTitle: {
    ...Typography.h3,
    textAlign: "center",
    marginBottom: Spacing.medium,
    color: Colors.textPrimary,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: Radii.small,
    padding: Spacing.small,
    marginBottom: Spacing.xSmall,
    ...Shadow.soft,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  myLeaderboardItem: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  rank: {
    ...Typography.h3,
    color: Colors.accentPrimary,
    marginRight: Spacing.medium,
    minWidth: 30,
    textAlign: "right",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: Radii.large,
    marginRight: Spacing.medium,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  username: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: "600",
  },
  score: {
    ...Typography.h3,
    color: Colors.success,
    marginLeft: Spacing.medium,
    fontWeight: "bold",
  },
  noDataText: {
    ...Typography.body,
    textAlign: "center",
    marginTop: Spacing.medium,
    color: Colors.textSecondary,
  },
  myLeaderboardText: {
    color: Colors.white,
    fontWeight: "bold",
  },
});
