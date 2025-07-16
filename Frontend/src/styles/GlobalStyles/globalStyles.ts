//LIBRARY
import { StyleSheet } from "react-native";

//STYLES
import { Colors, Radii, Shadow } from "./colors";
import { Spacing } from "./spacing";
import { FontSizes } from "./typography";

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

  bodyText: {
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
  },
});
