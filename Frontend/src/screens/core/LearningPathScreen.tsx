// LIBRARY
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// MY SCRIPTS
import { Lesson } from "../../types";
import {
  RootStackParamList,
  LearningPathScreenRouteProp,
} from "../../navigation/types";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";

// STYLES
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";
import { Colors } from "../../styles/GlobalStyles/colors";
import { learningPathStyles } from "../../styles/ScreenStyles/LearningPathScreen.style";

const LearningPathScreen: React.FC = () => {
  const route = useRoute<LearningPathScreenRouteProp>();
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamList, "LearningPathScreen">
    >();
  const { logout } = useAuth();

  const { selectedLanguageId } = route.params;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedLanguageId) {
        setError("Yönlendirme hatası: Geçersiz dil seçimi.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(
          `/lessons/by-language/${selectedLanguageId}`
        );
        setLessons(response.data.lessons);
        setError(null);
      } catch (err: any) {
        console.error("Dersler yüklenirken hata oluştu:", err);
        setError(err.response?.data?.message || "Dersler yüklenemedi.");
        Alert.alert(
          "Hata",
          err.response?.data?.message || "Dersleri alırken bir sorun oluştu."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [selectedLanguageId]);

  const groupedLessons = useMemo(() => {
    const groups: { [key: string]: Lesson[] } = {
      BEGINNER: [],
      INTERMEDIATE: [],
      ADVANCED: [],
      EXPERT: [],
    };

    lessons.forEach((lesson) => {
      if (groups[lesson.level]) {
        groups[lesson.level].push(lesson);
      } else {
        console.warn(
          `Bilinmeyen ders seviyesi: ${lesson.level} for lesson: ${lesson.title}`
        );
      }
    });

    Object.values(groups).forEach((group) => {
      group.sort((a, b) => a.order - b.order);
    });

    return groups;
  }, [lessons]);

  const handleLessonPress = (lessonId: string) => {
    navigation.navigate("LessonDetailScreen", {
      lessonId: lessonId,
      selectedLanguageId: selectedLanguageId,
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Evet",
          onPress: async () => {
            await logout();
            navigation.replace("LoginScreen");
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return (
      <View style={globalStyles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
        <Text style={globalStyles.bodyText}>Dersler Yükleniyor...</Text>
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

  if (!selectedLanguageId) {
    return (
      <View style={globalStyles.centeredContainer}>
        <Text style={globalStyles.bodyText}>
          Yönlendirme hatası: Geçersiz dil seçimi.
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.appContainer}>
      <TouchableOpacity
        onPress={handleLogout}
        style={learningPathStyles.logoutButton}
      >
        <Text style={learningPathStyles.logoutButtonText}>Çıkış</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={learningPathStyles.scrollViewContent}>
        <Text style={learningPathStyles.screenTitle}>Öğrenme Yolu</Text>

        {["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].map((level) => (
          <View key={level} style={learningPathStyles.levelSection}>
            <Text style={learningPathStyles.levelHeader}>
              {level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()}
            </Text>
            {groupedLessons[level as keyof typeof groupedLessons]?.length >
            0 ? (
              groupedLessons[level as keyof typeof groupedLessons].map(
                (item) => (
                  <TouchableOpacity
                    key={item._id.toString()}
                    style={learningPathStyles.lessonItem}
                    onPress={() => handleLessonPress(item._id.toString())}
                  >
                    <Text style={learningPathStyles.lessonOrder}>
                      {item.order}.
                    </Text>
                    <View style={learningPathStyles.lessonContent}>
                      <Text style={learningPathStyles.lessonTitle}>
                        {item.title}
                      </Text>
                      <Text style={learningPathStyles.lessonDescription}>
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              )
            ) : (
              <Text style={learningPathStyles.noLessonsText}>
                Bu seviye için henüz ders bulunmamaktadır.
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default LearningPathScreen;
