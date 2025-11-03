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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE } from "../config/api";
import { palette, spacing } from "../theme/theme";
import GradientButton from "../components/GradientButton";
import ReviewCard from "../components/ReviewCard";
// ✅ 1. IMPORT THƯ VIỆN GOOGLE AI
import { GoogleGenerativeAI } from "@google/generative-ai";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ✅ 2. THÊM API KEY CỦA BẠN VÀO ĐÂY
// ⚠️ CẢNH BÁO: CHỈ DÙNG ĐỂ TEST. KHÔNG BAO GIỜ ĐƯA LÊN PRODUCTION!
// HÃY DÙNG BIẾN MÔI TRƯỜNG NẾU CÓ THỂ, HOẶC XÓA ĐI KHI BUILD APP
const GEMINI_API_KEY = "YOUR_GOOGLE_AI_API_KEY_HERE";

// ✅ 3. KHỞI TẠO DỊCH VỤ AI
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const aiModel = genAI
  ? genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })
  : null;

export default function VenueDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [venue, setVenue] = useState(null);
  const [subPitches, setSubPitches] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [hasBooked, setHasBooked] = useState(false);

  const [aiSummary, setAiSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

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

        // 4) KIỂM TRA USER ĐÃ TỪNG ĐẶT SÂN NÀY CHƯA
        try {
          const resCheck = await fetch(
            `${API_BASE}/api/bookings/user/completed?venueId=${id}`
          );
          if (resCheck.ok) {
            const data = await resCheck.json();
            if (Array.isArray(data) && data.length > 0) {
              setHasBooked(true);
            } else {
              setHasBooked(false);
            }
          } else {
            setHasBooked(false);
          }
        } catch (err) {
          console.warn("Không thể kiểm tra booking:", err);
          setHasBooked(false);
        }
      } catch (err) {
        console.error("Error loading venue detail:", err);
        Alert.alert("Lỗi", "Không thể tải dữ liệu sân");
      }
    }

    fetchData();
  }, [id]);

  // ✅ 4. SỬA ĐỔI EFFECT NÀY ĐỂ GỌI TRỰC TIẾP GEMINI AI
  useEffect(() => {
    // Hàm này giờ sẽ gọi thẳng đến Google AI
    async function fetchAiSummary() {
      if (!aiModel) {
        setAiSummary(null);
        return;
      }
      if (reviews.length === 0) {
        setAiSummary(null);
        return;
      }

      setIsSummaryLoading(true);
      setSummaryError(null);
      try {
        // Gom tất cả comment của review thành một chuỗi
        const reviewComments = reviews
          .map((r) => `- ${r.comment} (Rating: ${r.rating} sao)`)
          .join("\n");

        // Tạo prompt cho AI
        const prompt = `
          Bạn là trợ lý đánh giá sân bóng. Dưới đây là một số đánh giá từ người dùng:
          ${reviewComments}
          
          Hãy tóm tắt các đánh giá này thành một đoạn văn ngắn gọn (tối đa 3 câu),
          nêu bật những điểm chung mà người dùng thích và không thích về sân bóng này.
          Viết bằng tiếng Việt.
        `;

        // Gọi API của Gemini
        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const summaryText = response.text();

        setAiSummary(summaryText);
      } catch (err) {
        console.error("Lỗi khi gọi Gemini AI:", err);
        setSummaryError("Không thể tải tóm tắt. Vui lòng thử lại sau.");
      } finally {
        setIsSummaryLoading(false);
      }
    }

    fetchAiSummary();
  }, [reviews]);

  if (!venue)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Đang tải thông tin sân...</Text>
      </View>
    );

  const allInactive =
    subPitches.length > 0 && subPitches.every((s) => !s.active);
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
          disabled={allInactive}
          onPress={() => {
            if (allInactive) {
              Alert.alert(
                "Thông báo",
                "Tất cả sân con hiện đang ngừng hoạt động ❌"
              );
              return;
            }
            const firstActive = subPitches.find((s) => s.active);
            if (!firstActive) {
              Alert.alert(
                "Thông báo",
                "Không tìm thấy sân con đang hoạt động!"
              );
              return;
            }
            navigation.navigate("SlotSelection", {
              id: firstActive._id,
              images:
                Array.isArray(firstActive.images) &&
                firstActive.images.length > 0
                  ? firstActive.images
                  : Array.isArray(venue.images)
                  ? venue.images
                  : [],
            });
          }}
          style={{ marginVertical: 16, opacity: allInactive ? 0.5 : 1 }}
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
              disabled={!s.active}
              onPress={() => {
                if (!s.active) return;
                navigation.navigate("SlotSelection", {
                  id: s._id,
                  images: s.images || venue.images || [],
                });
              }}
            >
              <Text style={styles.subName}>{s.name}</Text>
              <Text>Loại sân: {s.type}</Text>
              <Text
                style={{ fontWeight: "600", color: s.active ? "green" : "red" }}
              >
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
                        {s.blockPrices?.[`${b.start}-${b.end}`]
                          ? `${s.blockPrices[`${b.start}-${b.end}`]}đ`
                          : "Chưa có giá"}
                      </Text>
                    ))}
                  </>
                )}
            </TouchableOpacity>
          ))
        )}

        {/* NÚT GỬI ĐÁNH GIÁ */}
        {hasBooked && (
          <TouchableOpacity
            style={styles.feedbackBtn}
            onPress={() =>
              navigation.navigate("Feedback", {
                venueId: venue._id,
                onReviewSubmitted: () => {
                  try {
                    (async () => {
                      const resSubs = await fetch(
                        `${API_BASE}/api/venues/${id}/sub-pitches`
                      );
                      if (resSubs.ok) {
                        const subsData = await resSubs.json();
                        if (Array.isArray(subsData) && subsData.length > 0) {
                          const firstSub = subsData[0];
                          const resReviews = await fetch(
                            `${API_BASE}/api/sub-pitches/${firstSub._id}/reviews`
                          );
                          if (resReviews.ok) {
                            const reviewData = await resReviews.json();
                            setReviews(
                              Array.isArray(reviewData) ? reviewData : []
                            );
                          }
                        }
                      }
                    })();
                  } catch (error) {
                    console.error("Refresh review error:", error);
                  }
                },
              })
            }
          >
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#fff" />
            <Text style={styles.feedbackText}>Gửi đánh giá</Text>
          </TouchableOpacity>
        )}

        {/* Reviews */}
        <Text style={styles.sectionTitle}>Đánh giá</Text>

        {/* PHẦN TÓM TẮT BẰNG AI (Không thay đổi) */}
        {reviews.length > 0 && (
          <View style={styles.aiSummaryContainer}>
            <View style={styles.aiHeader}>
              <Ionicons
                name="sparkles-sharp"
                size={20}
                color={palette.primary}
              />
              <Text style={styles.aiTitle}>Tóm tắt bằng AI</Text>
            </View>
            {isSummaryLoading ? (
              <ActivityIndicator size="small" color={palette.primary} />
            ) : summaryError ? (
              <Text style={styles.aiError}>{summaryError}</Text>
            ) : aiSummary ? (
              <Text style={styles.aiText}>{aiSummary}</Text>
            ) : null}
          </View>
        )}

        {reviews.length === 0 ? (
          <Text style={styles.noReview}>Chưa có đánh giá nào</Text>
        ) : (
          reviews.map((r) => <ReviewCard key={r._id} review={r} />)
        )}
      </View>
    </ScrollView>
  );
}

// ... (Phần styles giữ nguyên y hệt)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: palette.text },
  address: { color: palette.sub, marginVertical: 4 },

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

  feedbackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 12,
  },
  feedbackText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
  },

  aiSummaryContainer: {
    backgroundColor: "#f0f5ff",
    borderRadius: 10,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#d6e4ff",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.primary,
    marginLeft: 6,
  },
  aiText: {
    fontSize: 14,
    color: palette.text,
    lineHeight: 20,
  },
  aiError: {
    fontSize: 14,
    color: "red",
    fontStyle: "italic",
  },
});
