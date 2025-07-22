//LIBRARY
import { StyleSheet } from "react-native";

export const Colors = {
  backgroundPrimary: "#171D2F",
  backgroundSecondary: "#222B45",
  cardBackground: "#2D3748",

  accentPrimary: "#4E79F0",
  accentSecondary: "#F0A763",

  textPrimary: "#E0E6F0",
  textSecondary: "#A6B3C6",
  textPlaceholder: "#6B778D",
  textOnLight: "#333333",

  success: "#66BB6A",
  danger: "#EF5350",
  error: "#F44336",
  warning: "#FFB300",
  info: "#2196F3",

  successGreen: "#4CAF50",
  errorRed: "#F44336",
  infoBlue: "#2196F3",

  border: "#3D4966",
  divider: "#2D3748",

  black: "#000000",
  white: "#FFFFFF",
  lightGray: "#F5F7FA",

  successLight: "#E8F5E9",
  errorLight: "#FFEBEE",
};

export const Shadow = StyleSheet.create({
  default: {
    shadowColor: Colors.backgroundPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  soft: {
    shadowColor: Colors.backgroundPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
});

export const Radii = {
  small: 5,
  medium: 10,
  large: 15,
};
