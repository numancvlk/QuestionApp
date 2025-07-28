//LIBRARY
import { StyleSheet } from "react-native";

//STYLES
import { Colors } from "./colors";

export const FontSizes = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  small: 14,
  medium: 16,
  xSmall: 12,
  large: 18,
  xxLarge: 28,
  header: 28,
  title: 22,
  button: 18,
};

export const Typography = StyleSheet.create({
  h1: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  h2: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: FontSizes.h3,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  body: {
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
  },
  button: {
    fontSize: FontSizes.button,
    fontWeight: "bold",
    color: Colors.white,
  },
  smallText: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
  },
});
