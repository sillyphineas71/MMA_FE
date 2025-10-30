import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { apiGet, apiPost } from "../../config/api";
import { palette, spacing, radius, shadow } from "../../theme/theme";

// Match backend Venue.status enum: ["active", "hidden"]
const STATUS_FILTERS = ["All", "Active", "Hidden"];

export default function AdminVenuesScreen() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(false);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/admin/venues", {
        status: status === "All" ? "" : status.toLowerCase(),
        search,
      });
      setVenues(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Fetch venues error:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [status]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search venue"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={fetchVenues}
      />

      <FlatList
        horizontal
        data={STATUS_FILTERS}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, status === item && styles.chipActive]}
            onPress={() => setStatus(item)}
          >
            <Text
              style={[
                styles.chipText,
                status === item && styles.chipTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator size="large" color={palette.primary} />
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.info}>
                {item.address} • {item.status}
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
  search: {
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    padding: spacing.sm,
    ...shadow.card,
  },
  chip: {
    backgroundColor: "#EAFBEF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 5,
  },
  chipActive: { backgroundColor: "#6FCF97" },
  chipText: { color: "#4E9F69", fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadow.card,
  },
  name: { fontWeight: "700", fontSize: 16, color: palette.text },
  info: { color: palette.sub, marginTop: 4 },
});
