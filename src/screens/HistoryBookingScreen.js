// src/screens/HistoryBookingScreen.js
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { palette, spacing, radius, shadow } from "../theme/theme";
import { apiGet } from "../config/api";

export default function HistoryBookingScreen({ navigation }) {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // BƯỚC 1: Log khi mount
    useEffect(() => {
        console.log("HistoryBookingScreen mounted");
        console.log("User từ AuthContext:", user);
        console.log("User ID:", user?.id); // ĐÃ SỬA: user?.id
    }, []);

    const fetchBookings = async () => {
        console.log("Bắt đầu fetchBookings...");
        console.log("User ID:", user?.id); // ĐÃ SỬA

        if (!user?.id) { // ĐÃ SỬA: user?.id
            console.log("Không có user.id → dừng");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log("Đang gọi API...");
            const data = await apiGet(`/api/bookings/customer/${user.id}`); // ĐÃ SỬA: user.id
            console.log("Dữ liệu nhận được từ BE:", data);
            setBookings(Array.isArray(data) ? data : data.bookings || []);
        } catch (err) {
            console.error("Lỗi tải lịch sử:", err);
            Alert.alert("Lỗi", err.message || "Không thể tải lịch sử đặt sân");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    // BƯỚC 2: Theo dõi user object
    useEffect(() => {
        if (user?.id) { // ĐÃ SỬA: user?.id
            fetchBookings();
        } else {
            console.log("Chưa có user, không gọi API");
            setLoading(false);
        }
    }, [user]);

    const handleReviewSubmitted = () => {
        fetchBookings();
    };

    const renderBooking = ({ item }) => {
        console.log("Render item:", item.bookingId, item.pitch);
        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {item.images?.[0] ? (
                        <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <Ionicons name="football-outline" size={50} color={palette.primary} />
                    )}

                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text style={styles.pitchName}>{item.pitch}</Text>
                        <Text style={styles.subPitch}>{item.subPitch}</Text>
                        <Text style={styles.address}>{item.address}</Text>
                        <Text style={styles.date}>
                            {item.date} | {item.startTime} - {item.endTime}
                        </Text>
                        <Text
                            style={[
                                styles.status,
                                {
                                    color:
                                        item.status === "confirmed" || item.status === "completed"
                                            ? "green"
                                            : item.status === "pending_payment"
                                                ? "orange"
                                                : "red",
                                },
                            ]}
                        >
                            {item.status === "pending_payment"
                                ? "Chờ thanh toán"
                                : item.status === "confirmed" || item.status === "completed"
                                    ? "Đã hoàn thành"
                                    : "Đã hủy"}
                        </Text>
                    </View>
                </View>

                <View style={styles.amountRow}>
                    <Text style={styles.amount}>
                        {item.totalAmount.toLocaleString("vi-VN")} VND
                    </Text>
                </View>

                <View style={styles.feedbackRow}>
                    <TouchableOpacity
                        style={styles.feedbackBtn}
                        onPress={(e) => {
                            e.stopPropagation();
                            navigation.navigate("Feedback", {
                                bookingId: item.bookingId,
                                bookingData: item,
                                // onReviewSubmitted: handleReviewSubmitted,
                            });
                        }}
                    >
                        <Ionicons name="star-outline" size={18} color={palette.primary} />
                        <Text style={styles.feedbackText}>Đánh giá</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={palette.primary} />
                <Text style={{ marginTop: spacing.md, color: palette.text }}>
                    Đang tải lịch sử đặt sân...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {bookings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={60} color={palette.sub} />
                    <Text style={styles.emptyText}>Bạn chưa có lịch sử đặt sân nào</Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.bookingId}
                    renderItem={renderBooking}
                    contentContainerStyle={{ padding: spacing.md }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    card: { backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadow.card },
    image: { width: 70, height: 70, borderRadius: radius.md },
    pitchName: { fontSize: 16, fontWeight: "700", color: palette.text },
    subPitch: { fontSize: 14, color: palette.sub },
    address: { fontSize: 13, color: palette.sub },
    date: { fontSize: 13, color: palette.sub, marginTop: 2 },
    status: { fontWeight: "600", marginTop: 4 },
    amountRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: spacing.sm },
    amount: { fontWeight: "700", color: palette.primaryDark },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: { marginTop: spacing.sm, color: palette.sub },
    feedbackRow: { marginTop: spacing.sm, alignItems: "flex-end" },
    feedbackBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: palette.bgLight || "#f0f8ff",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm || 8,
        alignSelf: "flex-start",
    },
    feedbackText: { marginLeft: spacing.xs, color: palette.primary, fontSize: 13, fontWeight: "600" },
});