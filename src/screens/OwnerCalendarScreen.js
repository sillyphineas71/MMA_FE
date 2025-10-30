import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { API_BASE } from "../config/api";
import { palette, spacing, radius } from "../theme/theme";

export default function OwnerCalendarScreen({ route }) {
  const { id } = route.params;
  const [slots, setSlots] = useState([]);
  const date = "2025-11-01";

  useEffect(() => {
    fetch(`${API_BASE}/api/owner/sub-pitches/${id}/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📅 Lịch đặt sân ngày {date}</Text>
      {slots.map((slot) => (
        <View key={slot.label} style={styles.card}>
          <Text style={styles.label}>{slot.label}</Text>
          <Text style={styles.info}>
            Booked: {slot.bookedCount} | Holds: {slot.holdCount}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: spacing.lg },
  header: { fontWeight: "800", fontSize: 18, marginBottom: spacing.md },
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  label: { fontWeight: "700", color: palette.text },
  info: { color: palette.sub },
});
