import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE } from "../config/api";
import { palette, spacing } from "../theme/theme";
import GradientButton from "../components/GradientButton";
import ReviewCard from "../components/ReviewCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function VenueDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [venue, setVenue] = useState(null);
  const [subPitches, setSubPitches] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1) Venue details
        const resVenue = await fetch(`${API_BASE}/api/venues/${id}`);
        if (!resVenue.ok)
          throw new Error(`Venue not found (${resVenue.status})`);
        const venueData = await resVenue.json();
        setVenue(venueData);

        // 2) Sub-pitches of this venue
        const resSubs = await fetch(`${API_BASE}/api/venues/${id}/sub-pitches`);
        if (resSubs.ok) {
          const subsData = await resSubs.json();
          setSubPitches(Array.isArray(subsData) ? subsData : []);
          // 3) Reviews for first sub-pitch (if any)
          if (Array.isArray(subsData) && subsData.length > 0) {
            const firstSub = subsData[0];
            const resReviews = await fetch(
              `${API_BASE}/api/sub-pitches/${firstSub._id}/reviews`
            );
            if (resReviews.ok) {
              const reviewData = await resReviews.json();
              setReviews(Array.isArray(reviewData) ? reviewData : []);
            }
          } else {
            setReviews([]);
          }
        } else {
          setSubPitches([]);
          setReviews([]);
        }
      } catch (err) {
        console.error("Error loading venue detail:", err);
        Alert.alert("Lỗi", "Không thể tải dữ liệu sân");
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

  // Collect images from all sub-pitches for the carousel
  const subPitchImages = subPitches.flatMap((sp) =>
    Array.isArray(sp.images) ? sp.images : []
  );

  return (
    <ScrollView style={{ backgroundColor: palette.bg }}>
      {/* Images carousel from sub-pitches */}
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x /
                e.nativeEvent.layoutMeasurement.width
            );
            setActiveImage(index);
          }}
          scrollEventThrottle={16}
        >
          {subPitchImages.length > 0 ? (
            subPitchImages.map((uri, idx) => (
              <Image
                key={idx}
                source={{ uri }}
                style={styles.banner}
                resizeMode="cover"
              />
            ))
          ) : (
            <Image
              source={{
                uri: "https://placehold.co/800x400?text=No+Image+Available",
              }}
              style={styles.banner}
              resizeMode="cover"
            />
          )}
        </ScrollView>
        <View style={styles.dotsContainer}>
          {(subPitchImages.length > 0 ? subPitchImages : [0]).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { opacity: i === activeImage ? 1 : 0.3 }]}
            />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {/* Venue info */}
        <Text style={styles.title}>{venue.name}</Text>
        <Text style={styles.address}>{venue.address}</Text>

        {/* Rating (if available) */}
        <View style={styles.ratingBox}>
          <Text style={styles.avgRating}>
            {venue.ratingAvg ? venue.ratingAvg.toFixed(1) : "Chưa có"}
          </Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={
                  i <= Math.round(venue.ratingAvg || 0)
                    ? "star"
                    : "star-outline"
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

        {/* Book now */}
        <GradientButton
          title="Đặt sân ngay"
          onPress={() => {
            if (subPitches.length > 0) {
              const firstSub = subPitches[0];
              navigation.navigate("SlotSelection", {
                id: firstSub._id,
                images:
                  Array.isArray(firstSub.images) && firstSub.images.length > 0
                    ? firstSub.images
                    : Array.isArray(venue.images)
                    ? venue.images
                    : [],
              });
            } else {
              Alert.alert("Thông báo", "Chưa có sân con để đặt!");
            }
          }}
          style={{ marginVertical: 16 }}
        />

        {/* Sub-pitches list */}
        <Text style={styles.sectionTitle}>Danh sách sân con</Text>
        {subPitches.length === 0 ? (
          <Text style={styles.noReview}>Chưa có sân con nào</Text>
        ) : (
          subPitches.map((s) => (
            <TouchableOpacity
              key={s._id}
              style={styles.subCard}
              onPress={() =>
                navigation.navigate("SlotSelection", {
                  id: s._id,
                  images: s.images || venue.images || [],
                })
              }
            >
              <Text style={styles.subName}>{s.name}</Text>
              <Text>Loại sân: {s.type}</Text>
              <Text>
                Trạng thái:{" "}
                {s.active ? "Đang hoạt động ✅" : "Ngừng hoạt động ❌"}
              </Text>

              {Array.isArray(s.bookableBlocks) &&
                s.bookableBlocks.length > 0 && (
                  <>
                    <Text style={{ fontWeight: "600", marginTop: 6 }}>
                      Khung giờ đặt được:
                    </Text>
                    {s.bookableBlocks.map((b) => (
                      <Text key={b.label}>
                        ⏰ {b.start} - {b.end} —{" "}
                        {s.blockPrices?.[`${b.start}-${b.end}`]}đ
                      </Text>
                    ))}
                  </>
                )}
            </TouchableOpacity>
          ))
        )}

        {/* Reviews */}
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
  content: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: palette.text },
  address: { color: palette.sub, marginVertical: 4 },

  // Rating
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

  imageContainer: {
    width: "100%",
    height: SCREEN_WIDTH * 0.55,
    backgroundColor: "#f2f2f2",
    position: "relative",
    marginBottom: 16,
  },
  banner: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.55,
    backgroundColor: "#ddd",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 8,
    width: "100%",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 3,
  },
});
