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
  xSmall: 12,
  large: 18,
  xxLarge: 28,
};

export const Typography = StyleSheet.create({
  h1: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  body: {
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
  },
});
