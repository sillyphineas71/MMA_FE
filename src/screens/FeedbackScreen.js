// screens/FeedbackScreen.js
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    SafeAreaView,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker"; // ← CẬP NHẬT
import { apiGet, apiPost } from "../config/api";
import { palette, spacing } from "../theme/theme";

export default function FeedbackScreen({ route, navigation }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState("");
    const [bookingDetail, setBookingDetail] = useState(null); // NEW: Chi tiết booking

    // NEW: Nhận bookingId từ HistoryBookingScreen
    const { bookingId, onReviewSubmitted } = route.params || {};

    // NEW: Tải chi tiết booking theo bookingId
    useEffect(() => {
        if (bookingId) {
            fetchBookingDetail();
        }
    }, [bookingId]);

    const fetchBookingDetail = async () => {
        try {
            const res = await apiGet(`/api/bookings/${bookingId}`);
            setBookingDetail(res.data);
        } catch (error) {
            console.error("Lỗi tải thông tin booking:", error);
            Alert.alert("Lỗi", "Không thể tải thông tin lịch đặt.");
        }
    };

    // KEEP: Giữ lại fetchBookings cũ (nếu cần dùng ở nơi khác)
    const fetchBookings = async () => {
        try {
            const res = await apiGet(`/api/bookings/user/completed?venueId=${venueId}`);
            setBookings(res.data || []);
        } catch (error) {
            console.error("Lỗi tải booking:", error);
            Alert.alert("Lỗi", "Không thể tải lịch đặt. Vui lòng thử lại.");
        }
    };

    const handleSubmit = async () => {
        if (!bookingId || rating < 1 || comment.trim().length < 10) {
            return Alert.alert("Lỗi", "Vui lòng đánh giá sao và viết ít nhất 10 ký tự.");
        }

        try {
            await apiPost("/api/reviews/submit", {
                bookingId,
                rating,
                comment: comment.trim(),
            });

            Alert.alert("Thành công", "Đánh giá đã được gửi!", [
                {
                    text: "OK",
                    onPress: () => {
                        onReviewSubmitted?.(); // Gọi lại để refresh HistoryBookingScreen
                        navigation.goBack();
                    },
                },
            ]);
        } catch (error) {
            const msg = error.response?.data?.error || "Không thể gửi đánh giá. Vui lòng thử lại.";
            Alert.alert("Lỗi", msg);
        }
    };

    // KEEP: Giữ lại selectedBk (dù không dùng Picker)
    const selectedBk = bookings.find(bk => bk._id === selectedBooking);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Đánh giá sân bóng</Text>

                {/* NEW: HIỂN THỊ THÔNG TIN BOOKING THEO bookingId */}
                {bookingDetail && (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            <Text style={{ fontWeight: "700" }}>Sân:</Text> {bookingDetail.subPitch?.name || "N/A"}
                        </Text>
                        <Text style={styles.infoText}>
                            <Text style={{ fontWeight: "700" }}>Thời gian:</Text> {bookingDetail.date} | {bookingDetail.startTime} - {bookingDetail.endTime}
                        </Text>
                    </View>
                )}

                {/* KEEP: Giữ lại Picker (ẩn đi nếu không dùng) */}
                {/* Nếu bạn không muốn hiển thị Picker, comment lại đoạn này */}
                {/* 
                <Text style={styles.label}>Chọn lịch đã đặt:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedBooking}
                        onValueChange={setSelectedBooking}
                        style={styles.picker}
                        dropdownIconColor={palette.primary}
                    >
                        <Picker.Item label="— Chọn lịch đặt —" value="" />
                        {bookings.map(bk => (
                            <Picker.Item
                                key={bk._id}
                                label={`${bk.subPitchId?.name} | ${bk.date} | ${bk.startTime}-${bk.endTime}`}
                                value={bk._id}
                            />
                        ))}
                    </Picker>
                </View>
                */}

                {/* ĐÁNH GIÁ SAO */}
                <Text style={styles.label}>Đánh giá của bạn:</Text>
                <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                            <Ionicons
                                name={star <= rating ? "star" : "star-outline"}
                                size={44}
                                color="#FFD700"
                                style={styles.star}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* NHẬN XÉT */}
                <Text style={styles.label}>Nhận xét (tối thiểu 10 ký tự):</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Chia sẻ trải nghiệm của bạn về sân, dịch vụ, nhân viên..."
                    multiline
                    numberOfLines={5}
                    value={comment}
                    onChangeText={setComment}
                    maxLength={500}
                />
                <Text style={styles.charCount}>
                    {comment.length}/500
                </Text>

                {/* NÚT GỬI */}
                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        (!bookingId || !rating || comment.trim().length < 10) && styles.disabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!bookingId || !rating || comment.trim().length < 10}
                >
                    <Text style={styles.submitText}>Gửi đánh giá</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// === STYLES ===
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.bg },
    container: { flex: 1, padding: spacing.md },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: palette.text,
        marginBottom: spacing.lg,
        textAlign: "center",
    },

    // INFO BOX
    infoBox: {
        backgroundColor: palette.card,
        padding: spacing.sm,
        borderRadius: 12,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: palette.primary,
    },
    infoText: { fontSize: 14, color: palette.text, marginVertical: 2 },

    // PICKER
    label: { fontWeight: "600", marginTop: spacing.md, marginBottom: spacing.xs, color: palette.text },
    pickerContainer: {
        backgroundColor: palette.card,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: spacing.md,
        elevation: 2,
    },
    picker: { height: 50, color: palette.text },

    // STAR
    starRow: { flexDirection: "row", justifyContent: "center", marginVertical: spacing.lg },
    star: { marginHorizontal: 8 },

    // TEXTAREA
    textArea: {
        backgroundColor: palette.card,
        borderRadius: 12,
        padding: spacing.md,
        textAlignVertical: "top",
        fontSize: 15,
        height: 120,
        marginBottom: spacing.xs,
        elevation: 1,
    },
    charCount: {
        alignSelf: "flex-end",
        color: palette.sub,
        fontSize: 12,
        marginBottom: spacing.md,
    },

    // BUTTON
    submitBtn: {
        backgroundColor: palette.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        elevation: 3,
    },
    disabled: { backgroundColor: "#aaa", elevation: 0 },
    submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});