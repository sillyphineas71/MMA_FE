import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiGet } from "../../config/api";
import { palette, spacing, radius, shadow } from "../../theme/theme";

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const STATUS_FILTERS = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending_payment" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Refunded", value: "refunded" },
    { label: "No-show", value: "no_show" },
  ];

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/admin/bookings", {
        status: STATUS_FILTERS.find((f) => f.label === status)?.value || "",
      });
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Fetch bookings error:", e.message);
      Alert.alert("Lỗi tải Bookings", e.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

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

  const filtered = useMemo(() => {
    if (!search) return bookings;
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      const user = b?.userId?.name || "";
      const pitch = b?.subPitchId?.name || "";
      return user.toLowerCase().includes(q) || pitch.toLowerCase().includes(q);
    });
  }, [bookings, search]);

  const statusColor = (s) => {
    switch (s) {
      case "confirmed":
        return "#6FCF97";
      case "completed":
        return "#2D9CDB";
      case "cancelled":
        return "#EB5757";
      case "refunded":
        return "#A855F7";
      case "no_show":
        return "#FFB020";
      default:
        return palette.primary; // pending
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
      <Text style={styles.emptyTitle}>Không có booking</Text>
      <Text style={styles.emptySub}>Điều chỉnh trạng thái hoặc tìm kiếm</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý đặt sân</Text>

      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={18}
          color={palette.sub}
          style={{ marginHorizontal: 8 }}
        />
        <TextInput
          placeholder="Tìm theo người dùng hoặc sân nhỏ"
          placeholderTextColor={palette.sub}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipList}
        contentContainerStyle={{
          paddingHorizontal: spacing.xs,
          marginTop: spacing.xs,
          alignItems: "center",
        }}
      >
        {STATUS_FILTERS.map((item) => (
          <Chip
            key={item.label}
            text={item.label}
            active={status === item.label}
            onPress={() => setStatus(item.label)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ paddingTop: spacing.lg }}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filtered}
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
                      {item?.subPitchId?.name || "(No sub-pitch)"}
                    </Text>
                    <Text style={styles.meta}>
                      {item?.userId?.name || "Unknown user"}
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
  searchBox: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: palette.text,
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
  },
  chipList: { marginBottom: spacing.sm },
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
