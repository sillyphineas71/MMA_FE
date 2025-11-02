import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE } from "../config/api";
import { palette, spacing } from "../theme/theme";
import GradientButton from "../components/GradientButton";
import ReviewCard from "../components/ReviewCard";

export default function VenueDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [venue, setVenue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ← Để reload

  useEffect(() => {
    fetchData();
    checkCanReview();
  }, [id, refreshTrigger]); // ← Reload khi refreshTrigger thay đổi

  const fetchData = async () => {
    try {
      const [venueRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE}/api/venues/${id}`),
        fetch(`${API_BASE}/api/reviews/venue/${id}`), // ← API MỚI
      ]);

      const venueData = await venueRes.json();
      setVenue(venueData);

      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData || []);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu sân");
    }
  };

  const checkCanReview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/user/completed?venueId=${id}`, {
        headers: { Authorization: `Bearer ${/* your token */ ""}` },
      });
      const data = await res.json();
      setCanReview(Array.isArray(data) && data.length > 0);
    } catch (error) {
      setCanReview(false);
    }
  };

  if (!venue) return <Text style={styles.loading}>Đang tải...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: venue.images?.[0] || venue.image || "https://placehold.co/600x300" }}
        style={styles.banner}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{venue.name}</Text>
        <Text style={styles.address}>{venue.address}</Text>

        {/* RATING TRUNG BÌNH */}
        <View style={styles.ratingBox}>
          <Text style={styles.avgRating}>
            {venue.ratingAvg ? venue.ratingAvg.toFixed(1) : "Chưa có"}
          </Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={
                  i <= Math.round(venue.ratingAvg || 0) ? "star" : "star-outline"
                }
                size={18}
                color="#FFD700"
              />
            ))}
          </View>
          <Text style={styles.reviewCount}>
            ({venue.ratingCount || 0} đánh giá)
          </Text>
        </View>

        {/* NÚT ĐẶT SÂN */}
        <GradientButton
          title="Đặt sân ngay"
          onPress={() => navigation.navigate("SlotSelection", { id })}
          style={{ marginVertical: 16 }}
        />

        {/* NÚT VIẾT ĐÁNH GIÁ – CHỈ HIỆN NẾU ĐƯỢC PHÉP */}
        {canReview && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() =>
              navigation.navigate("Feedback", {
                venueId: id,
                onReviewSubmitted: () => setRefreshTrigger(Date.now()), // ← GỌI LẠI ĐỂ RELOAD
              })
            }
          >
            <Ionicons name="pencil" size={16} color={palette.primary} />
            <Text style={styles.reviewBtnText}>Viết đánh giá</Text>
          </TouchableOpacity>
        )}

        {/* DANH SÁCH ĐÁNH GIÁ */}
        <Text style={styles.sectionTitle}>Đánh giá</Text>
        {reviews.length === 0 ? (
          <Text style={styles.noReview}>Chưa có đánh giá nào</Text>
        ) : (
          reviews.map((r) => <ReviewCard key={r._id} review={r} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  banner: { width: "100%", height: 200 },
  content: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: palette.text },
  address: { color: palette.sub, marginVertical: 4 },
  loading: { textAlign: "center", marginTop: 20, color: palette.sub },

  // RATING
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginVertical: 8,
  },
  avgRating: { fontSize: 20, fontWeight: "800", marginRight: 8 },
  stars: { flexDirection: "row", marginRight: 8 },
  reviewCount: { color: palette.sub, fontSize: 14 },

  // NÚT VIẾT ĐÁNH GIÁ
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  reviewBtnText: { marginLeft: 6, color: palette.primary, fontWeight: "600" },

  // ĐÁNH GIÁ
  sectionTitle: { fontWeight: "700", marginTop: 10 },
  noReview: { color: palette.sub, marginVertical: 10 },
});