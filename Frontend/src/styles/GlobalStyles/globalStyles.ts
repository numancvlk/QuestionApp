//LIBRARY
import { StyleSheet } from "react-native";

//STYLES
import { Colors, Radii, Shadow } from "./colors";
import { Spacing } from "./spacing";
import { FontSizes, Typography } from "./typography";

export const globalStyles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },

  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radii.medium,
    padding: Spacing.medium,
    ...Shadow.soft,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backgroundPrimary,
  },

  screenPaddingTop: {
    paddingTop: Spacing.xLarge * 2,
  },

  headerText: {
    ...Typography.h1,
  },
  titleText: {
    ...Typography.h3,
  },
  bodyText: {
    ...Typography.body,
    lineHeight: FontSizes.body * 1.5,
  },
  smallText: {
    ...Typography.smallText,
  },
  buttonText: {
    ...Typography.button,
  },
});
