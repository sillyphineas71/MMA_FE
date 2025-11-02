import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { API_BASE } from "../config/api";
import { palette, spacing, radius } from "../theme/theme";
import VenueCard from "../components/VenueCard";

export default function HomeScreen({ navigation }) {
  const [venues, setVenues] = useState([]); // ✅ đảm bảo luôn là mảng
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchVenues() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/venues?search=${search}`);
      const data = await res.json();

      console.log("📦 Fetch venues:", data);
      // ✅ ép kiểu đảm bảo venues luôn là mảng
      if (Array.isArray(data)) setVenues(data);
      else if (Array.isArray(data?.venues)) setVenues(data.venues);
      else setVenues([]);
    } catch (err) {
      console.error("❌ Fetch venues error:", err.message);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVenues();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚽ Football Booking</Text>

      <TextInput
        placeholder="🔍 Search venues..."
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={fetchVenues}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color={palette.primary} />
      ) : venues.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {venues.map((v) => (
            <VenueCard
              key={v._id || v.id}
              venue={v}
              onPress={() => navigation.navigate("VenueDetail", { id: v._id })}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>😔 Không tìm thấy sân nào</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    padding: spacing.lg,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.text,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.lg,
  },
  empty: {
    marginTop: 80,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: palette.sub,
  },
});
