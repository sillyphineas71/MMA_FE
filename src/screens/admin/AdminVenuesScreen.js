import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiGet } from "../../config/api";
import { palette, spacing, radius, shadow } from "../../theme/theme";

// Match backend Venue.status enum: ["active", "hidden"]
const STATUS_FILTERS = ["All", "Active", "Hidden"];

export default function AdminVenuesScreen() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/admin/venues", {
        status: status === "All" ? "" : status.toLowerCase(),
        search,
      });
      // Normalize response: accept array or wrapped shapes
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.venues)
        ? res.venues
        : Array.isArray(res?.results)
        ? res.results
        : [];
      setVenues(list);
    } catch (e) {
      console.error("Fetch venues error:", e.message);
      Alert.alert("Lỗi tải Venues", e.message);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchVenues();
    } finally {
      setRefreshing(false);
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

  const Badge = ({ text, color = palette.primary }) => (
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
      <Text style={styles.emptyTitle}>Không có sân nào</Text>
      <Text style={styles.emptySub}>
        Thử thay đổi trạng thái lọc hoặc từ khóa tìm kiếm
      </Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const statusColor = item.status === "active" ? "#6FCF97" : "#FFB020";
    return (
      <View style={styles.card}>
        <View style={styles.venueHeader}>
          <View style={styles.venueIcon}>
            <Ionicons name="home-outline" size={18} color="#4E9F69" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.info}>{item.address || "(No address)"}</Text>
          </View>
          <Badge text={item.status} color={statusColor} />
        </View>
        {item?.ownerId ? (
          <Text style={styles.meta}>
            Owner: {item.ownerId?.name || item.ownerId}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý sân bóng</Text>

      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={18}
          color={palette.sub}
          style={{ marginHorizontal: 8 }}
        />
        <TextInput
          placeholder="Search venue"
          placeholderTextColor={palette.sub}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchVenues}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      <View style={styles.chipsRow}>
        {STATUS_FILTERS.map((item) => (
          <Chip
            key={item}
            text={item}
            active={status === item}
            onPress={() => setStatus(item)}
          />
        ))}
      </View>

      {loading ? (
        <View style={{ paddingTop: spacing.lg }}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
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
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    minHeight: 40,
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
  venueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  venueIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAFBEF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  name: { fontWeight: "700", fontSize: 16, color: palette.text },
  info: { color: palette.sub, marginTop: 2, fontSize: 12 },
  meta: { color: palette.sub, marginTop: 6, fontStyle: "italic" },
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
