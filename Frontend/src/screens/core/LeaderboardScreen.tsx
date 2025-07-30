import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  getCurrentLeaderboard,
  getPastLeaderboards,
  updateLeaderboardScore,
} from "../../api/userApi";

import { leaderboardStyles as styles } from "../../styles/ScreenStyles/LeaderboardScreen.style";

interface LeaderboardPublicEntry {
  rank: number;
  userId: string;
  username: string;
  profileImageUri: string | null;
  score: number;
}

interface PastLeaderboardData {
  month: string;
  year: number;
  data: LeaderboardPublicEntry[];
}

const Leaderboard: React.FC = () => {
  const [currentLeaderboard, setCurrentLeaderboard] = useState<
    LeaderboardPublicEntry[] | null
  >(null);
  const [pastLeaderboard, setPastLeaderboard] =
    useState<PastLeaderboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "past">(
    "current"
  );

  const [currentDisplayMonth, setCurrentDisplayMonth] = useState<string>("");
  const [pastDisplayMonth, setPastDisplayMonth] = useState<string>("");

  const fetchAndSyncLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateLeaderboardScore();
      console.log("Skor otomatik olarak güncellendi/kontrol edildi.");

      const currentMonthDate = new Date();
      const currentMonthName = currentMonthDate.toLocaleString("tr-TR", {
        month: "long",
      });
      setCurrentDisplayMonth(
        `${currentMonthName} ${currentMonthDate.getFullYear()}`
      );

      const currentData = await getCurrentLeaderboard();
      setCurrentLeaderboard(currentData);

      const pastData = await getPastLeaderboards();
      setPastLeaderboard(pastData);
      if (pastData) {
        setPastDisplayMonth(`${pastData.month} ${pastData.year}`);
      } else {
        setPastDisplayMonth("Geçen Ay (Veri Yok)");
      }
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "Liderlik panosu verileri yüklenirken veya skor güncellenirken bir hata oluştu.";
      setError(errorMessage);
      console.error(err);
      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSyncLeaderboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />{" "}
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Hata: {error}</Text>
      </View>
    );
  }

  const renderLeaderboardEntry = (entry: LeaderboardPublicEntry) => (
    <View key={entry.userId} style={styles.leaderboardItem}>
      <Text style={styles.rank}>{entry.rank}.</Text>
      {entry.profileImageUri && (
        <Image
          source={{ uri: entry.profileImageUri }}
          style={styles.profileImage}
        />
      )}
      <Text style={styles.username}>{entry.username}</Text>
      <Text style={styles.score}>{entry.score} Puan</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Liderlik Panosu</Text>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedPeriod === "current" && styles.activeTab,
          ]}
          onPress={() => setSelectedPeriod("current")}
        >
          <Text
            style={[
              styles.tabButtonText,
              selectedPeriod === "current" && styles.activeTabText,
            ]}
          >
            Mevcut Ay
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedPeriod === "past" && styles.activeTab,
          ]}
          onPress={() => setSelectedPeriod("past")}
        >
          <Text
            style={[
              styles.tabButtonText,
              selectedPeriod === "past" && styles.activeTabText,
            ]}
          >
            Geçen Ay
          </Text>
        </TouchableOpacity>
      </View>

      {selectedPeriod === "current" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {currentDisplayMonth} Liderlik Panosu
          </Text>
          {currentLeaderboard && currentLeaderboard.length > 0 ? (
            <View>{currentLeaderboard.map(renderLeaderboardEntry)}</View>
          ) : (
            <Text style={styles.noDataText}>
              Mevcut ay için liderlik panosu verisi bulunamadı.
            </Text>
          )}
        </View>
      )}

      {selectedPeriod === "past" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {pastDisplayMonth} Liderlik Panosu
          </Text>
          {pastLeaderboard && pastLeaderboard.data.length > 0 ? (
            <View>{pastLeaderboard.data.map(renderLeaderboardEntry)}</View>
          ) : (
            <Text style={styles.noDataText}>
              Geçen aya ait liderlik panosu verisi bulunamadı.
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default Leaderboard;
