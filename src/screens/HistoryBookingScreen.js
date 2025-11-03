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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { palette, spacing, radius, shadow } from "../theme/theme";
import { API_BASE } from "../config/api";

export default function HistoryBookingScreen({ navigation }) {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            if (!user?._id) return;

            const res = await fetch(`${API_BASE}/bookings/customer/${user._id}`);
            const data = await res.json();

            if (res.ok) {
                setBookings(data.bookings || []);
            } else {
                console.error("Warning:", data.message);
            }
        } catch (err) {
            console.error("Error when loading booking history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user?._id]);

    const renderBooking = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => {
                // If you want to view booking details, navigate here:
                // navigation.navigate("BookingDetail", { booking: item });
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {item.images?.[0] ? (
                    <Image
                        source={{ uri: item.images[0] }}
                        style={styles.image}
                        resizeMode="cover"
                    />
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
                                    item.status === "confirmed"
                                        ? "green"
                                        : item.status === "pending_payment"
                                            ? "orange"
                                            : "red",
                            },
                        ]}
                    >
                        {item.status === "pending_payment"
                            ? "Chờ thanh toán"
                            : item.status === "confirmed"
                                ? "Đã xác nhận"
                                : "Đã hủy"}
                    </Text>
                </View>
            </View>

            <View style={styles.amountRow}>
                <Text style={styles.amount}>
                    {item.totalAmount.toLocaleString("vi-VN")} VND
                </Text>
            </View>

            {/* ================== NEW: REVIEW BUTTON ================== */}
            <View style={styles.feedbackRow}>
                <TouchableOpacity
                    style={styles.feedbackBtn}
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent card press
                        navigation.navigate("Feedback", {
                            bookingId: item.bookingId,
                            onReviewSubmitted: () => fetchBookings(), // Refresh list after review
                        });
                    }}
                >
                    <Ionicons name="star-outline" size={18} color={palette.primary} />
                    <Text style={styles.feedbackText}>Đánh giá</Text>
                </TouchableOpacity>
            </View>
            {/* ========================================================= */}
        </TouchableOpacity>
    );

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
    container: {
        flex: 1,
        backgroundColor: palette.bg,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadow.card,
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: radius.md,
    },
    pitchName: {
        fontSize: 16,
        fontWeight: "700",
        color: palette.text,
    },
    subPitch: {
        fontSize: 14,
        color: palette.sub,
    },
    address: {
        fontSize: 13,
        color: palette.sub,
    },
    date: {
        fontSize: 13,
        color: palette.sub,
        marginTop: 2,
    },
    status: {
        fontWeight: "600",
        marginTop: 4,
    },
    amountRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: spacing.sm,
    },
    amount: {
        fontWeight: "700",
        color: palette.primaryDark,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        marginTop: spacing.sm,
        color: palette.sub,
    },

    // ================== NEW STYLES ==================
    feedbackRow: {
        marginTop: spacing.sm,
        alignItems: "flex-end",
    },
    feedbackBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: palette.bgLight || "#f0f8ff",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm || 8,
        alignSelf: "flex-start",
    },
    feedbackText: {
        marginLeft: spacing.xs,
        color: palette.primary,
        fontSize: 13,
        fontWeight: "600",
    },
    // ================================================
});