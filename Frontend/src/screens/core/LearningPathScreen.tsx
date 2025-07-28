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
import { useNavigation, useRoute } from "@react-navigation/native";

// MY SCRIPTS
import { Lesson } from "../../types";
import {
  LearningPathScreenNavigationProp,
  LearningPathScreenRouteProp,
} from "../../navigation/types";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";

// STYLES
import { globalStyles } from "../../styles/GlobalStyles/globalStyles";
import { Colors } from "../../styles/GlobalStyles/colors";
import { learningPathStyles } from "../../styles/ScreenStyles/LearningPathScreen.style";

const LearningPathScreen: React.FC = () => {
  const navigation = useNavigation<LearningPathScreenNavigationProp>();
  const route = useRoute<LearningPathScreenRouteProp>();

  const { selectedLanguageId: initialSelectedLanguageId } = route.params || {};

  const { logout, user } = useAuth();

  const [selectedLanguageId, setSelectedLanguageId] = useState<
    string | undefined | null
  >(initialSelectedLanguageId);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLanguageId(user?.selectedLanguageId);
  }, [user?.selectedLanguageId]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedLanguageId) {
        setError("Yönlendirme hatası: Geçersiz dil seçimi.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        console.log(
          `[LearningPathScreen] Dersler çekiliyor: ${selectedLanguageId}`
        );
        const response = await axiosInstance.get(
          `/lessons/by-language/${selectedLanguageId}`
        );
        setLessons(response.data.lessons);
        console.log(
          `[LearningPathScreen] ${response.data.lessons.length} ders çekildi.`
        );
        setError(null);
      } catch (err: any) {
        console.error("Dersler yüklenirken hata oluştu:", err);
        const errorMessage =
          err.response?.data?.message || "Dersler yüklenemedi.";
        setError(errorMessage);
        Alert.alert("Hata", errorMessage);
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
      const levelKey = lesson.level.toUpperCase();
      if (groups[levelKey]) {
        groups[levelKey].push(lesson);
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
    if (!selectedLanguageId) {
      Alert.alert(
        "Hata",
        "Ders detaylarını görüntülemek için seçili bir dil bulunamadı."
      );
      navigation.navigate("InitialLanguageSelectionScreen");
      return;
    }

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

  if (!selectedLanguageId) {
    return (
      <View style={globalStyles.centeredContainer}>
        <Text style={globalStyles.bodyText}>
          Yönlendirme hatası: Geçersiz dil seçimi. Lütfen ana menüden dil
          seçerek tekrar deneyin.
        </Text>
        <TouchableOpacity
          style={learningPathStyles.retryButton}
          onPress={() => navigation.navigate("InitialLanguageSelectionScreen")}
        >
          <Text style={learningPathStyles.retryButtonText}>
            Dil Seçimine Git
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.centeredContainer}>
        <Text style={globalStyles.bodyText}>{error}</Text>
        <TouchableOpacity
          style={learningPathStyles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
          }}
        >
          <Text style={learningPathStyles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const levelsOrder: (keyof typeof groupedLessons)[] = [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT",
  ];

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

        {levelsOrder.map((level) => (
          <View key={level} style={learningPathStyles.levelSection}>
            <Text style={learningPathStyles.levelHeader}>
              {(level as string).charAt(0).toUpperCase() +
                (level as string).slice(1).toLowerCase()}
            </Text>
            {groupedLessons[level]?.length > 0 ? (
              groupedLessons[level].map((item) => (
                <TouchableOpacity
                  key={item._id.toString()}
                  style={[learningPathStyles.lessonItem, globalStyles.card]}
                  onPress={() => handleLessonPress(item._id.toString())}
                >
                  <Text style={learningPathStyles.lessonOrder}>
                    {item.order}.
                  </Text>
                  <View style={learningPathStyles.lessonContent}>
                    <Text style={learningPathStyles.lessonTitle}>
                      {item.title}
                    </Text>
                    <Text
                      style={learningPathStyles.lessonDescription}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={learningPathStyles.noLessonsText}>
                Bu seviye için henüz ders bulunmamaktadır. Yakında eklenecek!
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default LearningPathScreen;
