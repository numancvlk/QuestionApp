//LIBRARY
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "../../navigation/types";

//MY SCRIPTS
import { useAuth } from "../../context/AuthContext";
import { selectLanguage, getLanguages } from "../../api/userApi";
import { Language as LanguageType } from "../../types";

//STYLES
import { initialLanguageSelectionStyles } from "../../styles/ScreenStyles/İnitialLanguageSelectionScreen.style";
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";
import { Colors } from "../../styles/GlobalStyles/colors";

const InitialLanguageSelectionScreen: React.FC = () => {
  const navigation =
    useNavigation<RootStackNavigationProp<"InitialLanguageSelectionScreen">>();
  const { checkAuthStatus } = useAuth();

  const [languages, setLanguages] = useState<LanguageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedLanguages = await getLanguages();
        setLanguages(fetchedLanguages);
      } catch (err: any) {
        setError("Diller yüklenirken bir sorun oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  const handleLanguageSelect = async (languageId: string) => {
    try {
      setIsLoading(true);
      const updatedUser = await selectLanguage(languageId);

      await checkAuthStatus();

      Alert.alert(
        "Başarılı",
        `${updatedUser.username} için dil başarıyla seçildi!`
      );

      navigation.replace("AppTabs", { screen: "LearningPathScreen" });
    } catch (error: any) {
      Alert.alert("Hata", "Dil seçimi kaydedilirken bir sorun oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={globalStyles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
        <Text style={globalStyles.bodyText}>Diller Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.centeredContainer}>
        <Text style={globalStyles.bodyText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={initialLanguageSelectionStyles.container}>
      <Text style={initialLanguageSelectionStyles.header}>
        HANGİ DİLİ ÖĞRENMEK İSTİYORSUN?
      </Text>
      <FlatList
        data={languages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={initialLanguageSelectionStyles.languageItem}
            onPress={() => handleLanguageSelect(item._id)}
          >
            <Text style={initialLanguageSelectionStyles.languageName}>
              {item.displayName || item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={
          initialLanguageSelectionStyles.listContentContainer
        }
      />
    </View>
  );
};

export default InitialLanguageSelectionScreen;
