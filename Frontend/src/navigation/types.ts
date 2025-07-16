//LIBRARY
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  HomeScreen: undefined;
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
