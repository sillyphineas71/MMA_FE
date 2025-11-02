import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { apiGet } from "../config/api";
import { Feather, Ionicons } from "@expo/vector-icons"; // Thêm Ionicons

// === COMPONENT CON: HIỂN THỊ SAO ===
// Component này để vẽ số sao dựa trên rating
function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Ionicons
        key={i}
        name={i <= rating ? "star" : "star-outline"}
        size={16}
        color="#FFC107" // Màu vàng
      />
    );
  }
  return <View style={styles.ratingContainer}>{stars}</View>;
}

// === COMPONENT CHÍNH ===
export default function OwnerReviewListScreen({ navigation, route }) {
  const { subPitchId, subPitchName } = route.params;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = async () => {
    try {
      const data = await apiGet(`/api/owner/sub-pitches/${subPitchId}/reviews`);
      setReviews(data || []);
    } catch (err) {
      Alert.alert("Lỗi", "Không tải được danh sách đánh giá.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReviews();
    }, [subPitchId]) // Tải lại nếu subPitchId thay đổi
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  // Hiển thị item trong FlatList
  const renderItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        {/* <Image
                    // Giả định backend populate userId thành object có avatar
                    source={{ uri: item.userId?.avatar || "https://via.placeholder.com/100?text=User" }}
                    style={styles.avatar}
                /> */}
        <View style={styles.reviewInfo}>
          <Text style={styles.name}>
            {/* Giả định backend populate userId thành object có name */}
            {item.userId?.name || "Người dùng ẩn"}
          </Text>
          <StarRating rating={item.rating} />
        </View>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
        </Text>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
    </View>
  );

  // Màn hình Loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#40B800" />
        <Text style={{ marginTop: 10, color: "#40B800" }}>
          Đang tải đánh giá...
        </Text>
      </View>
    );
  }

  // Giao diện chính
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Đánh giá {subPitchName || "sân"}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* 2. Danh sách đánh giá */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sân này chưa có đánh giá nào.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#40B800"]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Màu nền xám nhạt
  },
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
    color: "#FFFFFF",
    flex: 1, // Cho phép text co giãn
    textAlign: "center",
    marginHorizontal: 10,
  },
  backButton: {
    paddingRight: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22, // Bo tròn
    backgroundColor: "#F3F4F6",
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  comment: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});
