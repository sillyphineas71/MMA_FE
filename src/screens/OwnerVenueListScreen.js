import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { apiGet, apiPatch } from "../config/api";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

// --- THAY ĐỔI 1: Đảm bảo { navigation } có trong props ---
export default function OwnerVenueListScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // --- LOGIC BASE_URL ĐỘNG (Đã sửa) ---
  let host;
  if (Constants.manifest2?.extra?.expoGo?.debuggerHost) {
    host = Constants.manifest2.extra.expoGo.debuggerHost.split(":")[0];
  } else if (Constants.manifest?.debuggerHost) {
    host = Constants.manifest.debuggerHost.split(":")[0];
  } else if (Constants.experienceUrl) {
    try {
      const url = new URL(Constants.experienceUrl);
      host = url.hostname;
    } catch (e) {
      console.error(
        "Không thể phân tích experienceUrl:",
        Constants.experienceUrl,
        e
      );
    }
  }
  if (!host) {
    console.warn(
      "Không thể tự động nhận diện IP. Đang dùng 'localhost' làm dự phòng."
    );
    host = "localhost";
  }
  const BASE_URL = `http://${host}:9999`;

  // --- CÁC HÀM XỬ LÝ (Đã sửa lỗi "nhẩy") ---
  const fetchVenues = async () => {
    try {
      const data = await apiGet("/api/owner/venues");
      setVenues(data || []);
    } catch (err) {
      Alert.alert("Lỗi", "Không tải được danh sách sân.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // setLoading(true); // Đã xóa để sửa lỗi "nhẩy"
      fetchVenues();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVenues();
    setRefreshing(false);
  };

  // (Các hàm toggleStatus, createVenue, editVenue, manageSubPitches giữ nguyên)
  const toggleStatus = async (venue) => {
    const newStatus = venue.status === "active" ? "hidden" : "active";
    try {
      await apiPatch(`/api/owner/venues/${venue._id}/status`, {
        status: newStatus,
      });
      Alert.alert(
        "✅ Thành công",
        `Sân đã được ${newStatus === "active" ? "hiển thị" : "ẩn"}.`
      );
      fetchVenues();
    } catch {
      Alert.alert("Lỗi", "Không thể thay đổi trạng thái sân.");
    }
  };
  const createVenue = () => navigation.navigate("OwnerVenueCreate");
  const editVenue = (venue) => navigation.navigate("OwnerVenueEdit", { venue });
  const manageSubPitches = (venue) => {
    navigation.navigate("OwnerSubPitchList", {
      venueId: venue._id,
      venueName: venue.name,
    });
  };

  // --- LOGIC FILTER (Code của bạn đã đúng) ---
  const filteredVenues = useMemo(() => {
    return venues
      .filter((venue) => {
        if (activeFilter === "all") return true;
        return venue.status === activeFilter;
      })
      .filter((venue) => {
        if (searchText === "") return true;
        return venue.name.toLowerCase().includes(searchText.toLowerCase());
      });
  }, [venues, activeFilter, searchText]);

  // --- LOGIC RENDER ITEM (Đã sửa, an toàn) ---
  const renderItem = ({ item }) => {
    let imageUrl = "https://via.placeholder.com/400x200?text=No+Image";
    const imagePath = item.images?.[0];

    if (imagePath) {
      if (imagePath.startsWith("http")) {
        imageUrl = imagePath;
      } else if (imagePath.startsWith("/")) {
        imageUrl = `${BASE_URL}${imagePath}`;
      }
    }

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.address}>{item.address}</Text>
          <Text
            style={[
              styles.status,
              { color: item.status === "active" ? "#40B800" : "#EF4444" },
            ]}
          >
            {item.status === "active" ? "🟢 Đang hoạt động" : "⚪ Đang ẩn"}
          </Text>
          <Text style={styles.rating}>
            ⭐{" "}
            {item.ratingAvg
              ? `${item.ratingAvg} (${item.ratingCount})`
              : "Chưa có đánh giá"}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => manageSubPitches(item)}
            >
              <Ionicons name="football-outline" size={18} color="#0EA5E9" />
              <Text style={[styles.actionText, { color: "#0EA5E9" }]}>
                Sân con
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => editVenue(item)}
            >
              <Feather name="edit" size={18} color="#40B800" />
              <Text style={styles.actionText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => toggleStatus(item)}
            >
              <Feather
                name={item.status === "active" ? "eye-off" : "eye"}
                size={18}
                color="#EF4444"
              />
              <Text style={[styles.actionText, { color: "#EF4444" }]}>
                {item.status === "active" ? "Ẩn" : "Hiện"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // --- LOADING SCREEN ---
  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#40B800" />
        <Text style={{ marginTop: 8, color: "#40B800" }}>
          Đang tải danh sách sân...
        </Text>
      </View>
    );

  // --- MAIN RETURN (JSX) ---
  return (
    <SafeAreaView style={styles.container}>
      {/* --- THAY ĐỔI 2: THÊM HEADER BAR VÀ NÚT GO BACK --- */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý sân</Text>
        <View style={{ width: 28 }} /> {/* Căn giữa tiêu đề */}
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Tìm theo tên sân..."
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* --- THAY ĐỔI 3: THAY THẾ COMMENT BẰNG CÁC NÚT FILTER --- */}
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "all" && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === "all" && styles.activeFilterButtonText,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "active" && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter("active")}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === "active" && styles.activeFilterButtonText,
              ]}
            >
              Đang hoạt động
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "hidden" && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter("hidden")}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === "hidden" && styles.activeFilterButtonText,
              ]}
            >
              Đang ẩn
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listWrapper}>
        <FlatList
          data={filteredVenues}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không tìm thấy sân nào</Text>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          style={{ paddingHorizontal: 16 }} // Chuyển padding vào đây
        />
      </View>

      <TouchableOpacity style={styles.fab} onPress={createVenue}>
        <AntDesign name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },

  // --- THAY ĐỔI 4: THÊM STYLE CHO HEADER BAR ---
  headerBar: {
    backgroundColor: "#40B800",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  backButton: {
    paddingRight: 10, // Thêm padding để dễ bấm
  },
  // --- HẾT STYLE HEADER ---

  filterContainer: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  searchBox: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    fontSize: 16,
    color: "#111827",
  },
  filterButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  filterButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: "#40B800",
  },
  filterButtonText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 14,
  },
  activeFilterButtonText: {
    color: "#FFF",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    marginBottom: 14, // (Đã sửa lỗi chính tả 'smarginBottom')
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  image: { width: "100%", height: 160, backgroundColor: "#F3F4F6" }, // Thêm màu nền
  cardContent: { padding: 12 },
  name: { fontSize: 18, fontWeight: "700", color: "#40B800" },
  address: { color: "#6B7280", marginVertical: 4 },
  status: { fontWeight: "600", marginTop: 4 },
  rating: { color: "#FACC15", marginTop: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontWeight: "600", color: "#40B800" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: "#40B800",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  listWrapper: {
    flex: 1,
    backgroundColor: "#FFF", // Màu trắng cho khu vực list
  },
});
