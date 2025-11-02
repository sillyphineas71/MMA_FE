import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiGet } from "../../config/api";
import { palette, spacing, radius, shadow } from "../../theme/theme";

export default function OwnerBookingsScreen() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [status, setStatus] = useState("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const STATUS_FILTERS = [
        { label: "All", value: "" },
        { label: "Pending", value: "pending_payment" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
    ];

    // Gọi API danh sách booking của owner
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                status: STATUS_FILTERS.find((f) => f.label === status)?.value || "",
                from: fromDate || "",
                to: toDate || "",
            };
            const res = await apiGet("/api/owner/bookings", params);
            setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("Fetch owner bookings error:", e.message);
        } finally {
            setLoading(false);
        }
    }, [status, fromDate, toDate]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchBookings();
        } finally {
            setRefreshing(false);
        }
    };

    const statusColor = (s) => {
        switch (s) {
            case "confirmed":
                return "#6FCF97";
            case "completed":
                return "#2D9CDB";
            case "cancelled":
                return "#EB5757";
            default:
                return palette.primary;
        }
    };

    const Chip = ({ text, active, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.chip, active && styles.chipActive]}
        >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {text}
            </Text>
        </TouchableOpacity>
    );

    const Badge = ({ text, color }) => (
        <View
            style={[
                styles.badge,
                { backgroundColor: color + "22", borderColor: color + "55" },
            ]}
        >
            <Text style={[styles.badgeText, { color }]}>{text}</Text>
        </View>
    );

    const EmptyState = () => (
        <View style={styles.emptyBox}>
            <Ionicons name="file-tray-outline" size={36} color={palette.sub} />
            <Text style={styles.emptyTitle}>Không có booking nào</Text>
            <Text style={styles.emptySub}>Điều chỉnh bộ lọc hoặc ngày tìm kiếm</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Booking của tôi</Text>

            {/* Bộ lọc trạng thái */}
            <FlatList
                horizontal
                data={STATUS_FILTERS}
                keyExtractor={(i) => i.label}
                showsHorizontalScrollIndicator={false}
                style={styles.chipList}
                contentContainerStyle={{
                    paddingHorizontal: spacing.xs,
                    marginBottom: spacing.xs,
                }}
                renderItem={({ item }) => (
                    <Chip
                        text={item.label}
                        active={status === item.label}
                        onPress={() => setStatus(item.label)}
                    />
                )}
            />

            {loading ? (
                <View style={{ paddingTop: spacing.lg }}>
                    <ActivityIndicator size="large" color={palette.primary} />
                </View>
            ) : bookings.length === 0 ? (
                <EmptyState />
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item._id}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    contentContainerStyle={{ paddingBottom: spacing.xl }}
                    renderItem={({ item }) => {
                        const color = statusColor(item.status);
                        return (
                            <View style={styles.card}>
                                <View style={styles.headerRow}>
                                    <View style={styles.pitchIcon}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={18}
                                            color="#2D9CDB"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardTitle}>
                                            {item?.subPitchId?.name || "(Sân nhỏ)"}
                                        </Text>
                                        <Text style={styles.meta}>
                                            Người đặt: {item?.userId?.name || "Không rõ"}
                                        </Text>
                                    </View>
                                    <Badge text={item.status} color={color} />
                                </View>
                                <Text style={styles.detail}>
                                    {item.date || ""} • {item.startTime || ""} -{" "}
                                    {item.endTime || ""}
                                </Text>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg, padding: spacing.md },
    title: {
        fontSize: 20,
        fontWeight: "800",
        color: palette.text,
        marginBottom: spacing.sm,
    },
    chipList: { maxHeight: 54 },
    chip: {
        backgroundColor: "#F0F7F3",
        borderRadius: 18,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: palette.border,
        alignSelf: "flex-start",
    },
    chipActive: {
        backgroundColor: palette.primary,
        borderColor: palette.primaryDark,
    },
    chipText: { color: palette.sub, fontWeight: "600" },
    chipTextActive: { color: "#fff" },
    card: {
        backgroundColor: palette.card,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: palette.border,
        ...shadow.card,
    },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    pitchIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#E8F3FB",
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: palette.border,
    },
    cardTitle: { fontWeight: "700", fontSize: 16, color: palette.text },
    meta: { color: palette.sub, marginTop: 2, fontSize: 12 },
    detail: { color: palette.sub, marginTop: 6 },
    badge: {
        borderWidth: 1,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999,
        marginLeft: 8,
    },
    badgeText: { fontSize: 12, fontWeight: "700" },
    emptyBox: { alignItems: "center", marginTop: spacing.xl },
    emptyTitle: { color: palette.text, fontWeight: "700", marginTop: spacing.sm },
    emptySub: { color: palette.sub, marginTop: 2 },
});
