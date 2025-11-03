import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { API_BASE } from "../config/api";
import { palette, spacing } from "../theme/theme";
import GradientButton from "../components/GradientButton";
import ReviewCard from "../components/ReviewCard";
import { Dimensions } from "react-native";
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
        // ✅ 1. Lấy chi tiết venue
        const resVenue = await fetch(`${API_BASE}/api/venues/${id}`);
        if (!resVenue.ok) throw new Error(`Venue not found (${resVenue.status})`);
        const venueData = await resVenue.json();
        setVenue(venueData);

        // ✅ 2. Lấy danh sách sân con
        const resSubs = await fetch(`${API_BASE}/api/venues/${id}/sub-pitches`);
        if (resSubs.ok) {
          const subsData = await resSubs.json();
          setSubPitches(subsData);     
          // ✅ 3. Lấy đánh giá của sân con đầu tiên (nếu có)
          if (subsData.length > 0) {
            const firstSub = subsData[0];
            const resReviews = await fetch(
              `${API_BASE}/api/sub-pitches/${firstSub._id}/reviews`
            );
            if (resReviews.ok) {
              const reviewData = await resReviews.json();
              setReviews(reviewData);
            }
          }
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
  const allInactive = subPitches.length > 0 && subPitches.every((s) => !s.active);
  return (
  <ScrollView style={{ backgroundColor: palette.bg }}>
    {/*  Hình ảnh (chỉ lấy ảnh từ subPitches) */}
  <View style={styles.imageContainer}>
  <ScrollView
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    onScroll={(e) => {
      const index = Math.round(
        e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
      );
      setActiveImage(index);
    }}
    scrollEventThrottle={16}
  >
    {(() => {
      // Lấy tất cả ảnh từ subPitches
      const subPitchImages = subPitches.flatMap((sp) =>
        Array.isArray(sp.images) ? sp.images : []
      );

      if (subPitchImages.length > 0) {
        return subPitchImages.map((uri, idx) => (
          <Image
            key={idx}
            source={{ uri }}
            style={styles.banner}
            resizeMode="cover"
          />
        ));
      } else {
        //Nếu không có ảnh nào trong subPitch
        return (
          <Image
            source={{
              uri: "https://placehold.co/800x400?text=No+Image+Available",
            }}
            style={styles.banner}
            resizeMode="cover"
          />
        );
      }
    })()}
  </ScrollView>

  {/*  Dots indicator */}
  <View style={styles.dotsContainer}>
    {subPitches
      .flatMap((sp) => (Array.isArray(sp.images) ? sp.images : []))
      .map((_, i) => (
        <View
          key={i}
          style={[styles.dot, { opacity: i === activeImage ? 1 : 0.3 }]}
        />
      ))}
  </View>
</View>



      <View style={styles.content}>
        {/*  Thông tin sân */}
        <Text style={styles.title}>{venue.name}</Text>
        <Text style={styles.address}>{venue.address}</Text>

        {/* Nút đặt sân */}
        <GradientButton
          title="Đặt sân ngay"
          disabled={allInactive}
          onPress={() => {
            // không cho book
            if (allInactive) {
              Alert.alert("Thông báo", "Tất cả sân con hiện đang ngừng hoạt động ❌");
              return;
            }

            // tìm sân con đầu tiên còn active
            const firstActive = subPitches.find((s) => s.active);
            if (!firstActive) {
              Alert.alert("Thông báo", "Không tìm thấy sân con đang hoạt động!");
              return;
            }

            navigation.navigate("SlotSelection", {
              id: firstActive._id,
              images:
                Array.isArray(firstActive.images) && firstActive.images.length > 0
                  ? firstActive.images
                  : Array.isArray(venue.images)
                  ? venue.images
                  : [],
            });
          }}
          style={{
            marginVertical: 16,
            opacity: allInactive ? 0.5 : 1,
          }}
        />

        {/* Danh sách sân con */}
        <Text style={styles.sectionTitle}>Danh sách sân con</Text>
        {subPitches.length === 0 ? (
          <Text style={styles.noReview}>Chưa có sân con nào</Text>
        ) : (
          subPitches.map((s) => (
            <View key={s._id} style={styles.subCard}>
              <Text style={styles.subName}>{s.name}</Text>
              <Text>Loại sân: {s.type}</Text>
              <Text
                style={{
                  fontWeight: "600",
                  color: s.active ? "green" : "red",
                }}
              >
                {s.active ? "Đang hoạt động " : "Ngừng hoạt động "}
              </Text>

              <Text style={{ fontWeight: "600", marginTop: 6 }}>
                Khung giờ đặt được:
              </Text>

              {s.bookableBlocks.map((b) => (
                <Text key={b.label}>
                  ⏰ {b.start} - {b.end} —{" "}
                  {s.blockPrices?.[`${b.start}-${b.end}`]
                    ? `${s.blockPrices[`${b.start}-${b.end}`]}đ`
                    : "Chưa có giá"}
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
  imageContainer: {
  position: "relative",
  width: "100%",
  height: 200,
  marginBottom: 16,
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
//