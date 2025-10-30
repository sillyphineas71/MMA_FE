import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { API_BASE, apiPost } from "../config/api";
import { palette, spacing, radius } from "../theme/theme";

export default function SlotSelectionScreen({ route }) {
  const { id } = route.params;
  const [slots, setSlots] = useState([]);
  const date = "2025-11-01";

  useEffect(() => {
    fetch(`${API_BASE}/api/sub-pitches/${id}/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.available || []));
  }, []);

  const holdSlot = async (slot) => {
    await apiPost("/api/holds", {
      subPitchId: id,
      date,
      startTime: slot.start,
      endTime: slot.end,
    });
    alert(`Đã giữ chỗ ${slot.label} thành công!`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chọn khung giờ ngày {date}</Text>
      {slots.map((slot) => (
        <TouchableOpacity key={slot.label} style={styles.slot} onPress={() => holdSlot(slot)}>
          <Text style={styles.slotText}>
            ⏰ {slot.label} ({slot.start}–{slot.end})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: spacing.lg },
  title: { fontWeight: "700", fontSize: 18, marginBottom: spacing.md },
  slot: {
    backgroundColor: palette.card,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.sm,
  },
  slotText: { fontWeight: "600", color: palette.text },
});
