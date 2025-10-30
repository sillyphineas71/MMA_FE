import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { API_BASE } from "../config/api";
import { palette, spacing } from "../theme/theme";
import GradientButton from "../components/GradientButton";
import ReviewCard from "../components/ReviewCard";

export default function VenueDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [venue, setVenue] = useState(null);
  const [subPitches, setSubPitches] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ 1. Chi tiết venue
        const resVenue = await fetch(`${API_BASE}/api/venues/${id}`);
        if (!resVenue.ok) throw new Error(`Venue not found (${resVenue.status})`);
        const venueData = await resVenue.json();
        setVenue(venueData);

        // ✅ 2. Các sân con của venue
        const resSubs = await fetch(`${API_BASE}/api/venues/${id}/sub-pitches`);
        if (resSubs.ok) {
          const subsData = await resSubs.json();
          setSubPitches(subsData);
        }

        // ✅ 3. Các đánh giá (nếu có)
        const resReviews = await fetch(`${API_BASE}/api/sub-pitches/${id}/reviews`);
        if (resReviews.ok) {
          const reviewData = await resReviews.json();
          setReviews(reviewData);
        }
      } catch (err) {
        console.error("Error loading venue detail:", err);
      }
    }
    fetchData();
  }, [id]);

  if (!venue)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Đang tải thông tin sân...</Text>
      </View>
    );

  return (
    <ScrollView style={{ backgroundColor: palette.bg }}>
      <Image
        source={{ uri: venue.image || "https://placehold.co/600x300" }}
        style={styles.banner}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{venue.name}</Text>
        <Text style={styles.address}>{venue.address}</Text>

        <GradientButton
          title="Đặt sân ngay"
          onPress={() => navigation.navigate("SlotSelection", { id })}
          style={{ marginVertical: 16 }}
        />

        {/* 🏟️ Danh sách sân con */}
        <Text style={styles.sectionTitle}>Danh sách sân con</Text>
        {subPitches.length === 0 ? (
          <Text style={styles.noReview}>Chưa có sân con nào</Text>
        ) : (
          subPitches.map((s) => (
            <View key={s._id} style={styles.subCard}>
              <Text style={styles.subName}>{s.name}</Text>
              <Text>Loại sân: {s.type}</Text>
              <Text>
                Trạng thái: {s.active ? "Đang hoạt động ✅" : "Ngừng hoạt động ❌"}
              </Text>

              <Text style={{ fontWeight: "600", marginTop: 6 }}>
                Khung giờ đặt được:
              </Text>
              {s.bookableBlocks.map((b) => (
                <Text key={b.label}>
                  ⏰ {b.start} - {b.end} ({b.label}) —{" "}
                  {s.blockPrices[`${b.start}-${b.end}`]}đ
                </Text>
              ))}
            </View>
          ))
        )}

        {/* 💬 Đánh giá */}
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
  banner: { width: "100%", height: 200 },
  content: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: palette.text },
  address: { color: palette.sub, marginVertical: 4 },
  sectionTitle: { fontWeight: "700", marginTop: 10, marginBottom: 4 },
  noReview: { color: palette.sub, marginVertical: 10 },
  subCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  subName: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
});
