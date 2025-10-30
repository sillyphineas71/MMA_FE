import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { API_BASE } from "../config/api";
import { palette, spacing } from "../theme/theme";
import GradientButton from "../components/GradientButton";
import ReviewCard from "../components/ReviewCard";

export default function VenueDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [venue, setVenue] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const resVenue = await fetch(`${API_BASE}/api/venues/${id}`);
      const venueData = await resVenue.json();
      setVenue(venueData);

      const resReviews = await fetch(`${API_BASE}/api/sub-pitches/${id}/reviews`);
      setReviews(await resReviews.json());
    }
    fetchData();
  }, [id]);

  if (!venue) return <Text>Loading...</Text>;

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
  sectionTitle: { fontWeight: "700", marginTop: 10 },
  noReview: { color: palette.sub, marginVertical: 10 },
});
