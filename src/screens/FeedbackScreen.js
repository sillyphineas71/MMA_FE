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
import { apiPost } from "../config/api";
import { palette, spacing } from "../theme/theme";

export default function FeedbackScreen({ route, navigation }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const { bookingId, bookingData } = route.params || {};

    const canSubmit = bookingId && rating >= 1 && comment.trim().length >= 10;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setLoading(true);
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
                        navigation.goBack();
                        // GỌI REFETCH TỪ HISTORY QUA EVENT
                        navigation.getParent()?.setParams({ refresh: Date.now() });
                    },
                },
            ]);
        } catch (error) {
            const msg =
                error.response?.data?.error ||
                error.message ||
                "Không thể gửi đánh giá. Vui lòng thử lại.";
            Alert.alert("Lỗi", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Đánh giá sân bóng</Text>

                {bookingData ? (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            <Text style={{ fontWeight: "700" }}>Sân:</Text> {bookingData.pitch}
                        </Text>
                        <Text style={styles.infoText}>
                            <Text style={{ fontWeight: "700" }}>Phụ sân:</Text> {bookingData.subPitch}
                        </Text>
                        <Text style={styles.infoText}>
                            <Text style={{ fontWeight: "700" }}>Thời gian:</Text> {bookingData.date} | {bookingData.startTime} - {bookingData.endTime}
                        </Text>
                    </View>
                ) : (
                    <Text style={[styles.infoText, { color: "red", textAlign: "center" }]}>
                        Không tải được thông tin sân.
                    </Text>
                )}

                <Text style={styles.label}>Đánh giá của bạn:</Text>
                <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
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

                <Text style={styles.label}>Nhận xét (tối thiểu 10 ký tự):</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    multiline
                    value={comment}
                    onChangeText={setComment}
                    maxLength={500}
                />
                <Text style={styles.charCount}>{comment.length}/500</Text>

                <TouchableOpacity
                    style={[styles.submitBtn, !canSubmit && styles.disabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit || loading}
                >
                    <Text style={styles.submitText}>
                        {loading ? "Đang gửi..." : canSubmit ? "Gửi đánh giá" : "Chưa đủ điều kiện"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// styles giữ nguyên
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.bg },
    container: { flex: 1, padding: spacing.md },
    title: { fontSize: 22, fontWeight: "800", color: palette.text, marginBottom: spacing.lg, textAlign: "center" },
    infoBox: { backgroundColor: palette.card, padding: spacing.sm, borderRadius: 12, marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: palette.primary },
    infoText: { fontSize: 14, color: palette.text, marginVertical: 2 },
    label: { fontWeight: "600", marginTop: spacing.md, marginBottom: spacing.xs, color: palette.text },
    starRow: { flexDirection: "row", justifyContent: "center", marginVertical: spacing.lg },
    star: { marginHorizontal: 8 },
    textArea: { backgroundColor: palette.card, borderRadius: 12, padding: spacing.md, textAlignVertical: "top", fontSize: 15, height: 120, marginBottom: spacing.xs, elevation: 1 },
    charCount: { alignSelf: "flex-end", color: palette.sub, fontSize: 12, marginBottom: spacing.md },
    submitBtn: { backgroundColor: palette.primary, paddingVertical: 14, borderRadius: 12, alignItems: "center", elevation: 3 },
    disabled: { backgroundColor: "#aaa", elevation: 0 },
    submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});