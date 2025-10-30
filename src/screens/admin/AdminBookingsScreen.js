import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiGet, apiPost } from "../../config/api";
import { palette, spacing, radius, shadow } from "../../theme/theme";

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/admin/bookings");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Fetch bookings error:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={palette.primary} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>
                {item?.subPitchId?.name || "(No sub-pitch)"}
              </Text>
              <Text style={styles.detail}>
                {item?.userId?.name || "Unknown user"} • {item.status}
              </Text>
              <Text style={styles.detail}>
                {item.date || ""} —{" "}
                {item.startTime && item.endTime
                  ? `${item.startTime} - ${item.endTime}`
                  : ""}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FAF8", padding: spacing.md },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadow.card,
  },
  title: { fontWeight: "700", fontSize: 16, color: palette.text },
  detail: { color: palette.sub, marginTop: 4 },
});
