import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_BASE, apiPost } from "../config/api";
import { palette, spacing, radius } from "../theme/theme";

export default function SlotSelectionScreen({ route }) {
  const { id } = route.params;
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // 🧭 Format ngày YYYY-MM-DD
  const formattedDate = date.toISOString().split("T")[0];

  const fetchSlots = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/sub-pitches/${id}/slots?date=${formattedDate}`
      );
      const data = await res.json();
      setSlots(data.available || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [formattedDate]);

  const holdSlot = async (slot) => {
    try {
      await apiPost("/api/holds", {
        subPitchId: id,
        date: formattedDate,
        startTime: slot.start,
        endTime: slot.end,
      });
      alert(`✅ Đã giữ chỗ ${slot.label} thành công!`);
      fetchSlots(); // Reload lại slot để cập nhật màu
    } catch (err) {
      alert("❌ Giữ chỗ thất bại!");
      console.error(err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chọn khung giờ</Text>

      {/* 🗓 Chọn ngày */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateText}>📅 {formattedDate}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* 🧱 Lưới khung giờ */}
      <View style={styles.grid}>
        {slots.length === 0 ? (
          <Text style={styles.noSlot}>Không có khung giờ khả dụng</Text>
        ) : (
          slots.map((slot) => (
            <TouchableOpacity
              key={slot.label}
              style={[
                styles.slot,
                slot.booked || slot.held
                  ? styles.slotBooked
                  : styles.slotAvailable,
              ]}
              disabled={slot.booked || slot.held}
              onPress={() => holdSlot(slot)}
            >
              <Text style={styles.slotText}>
                ⏰ {slot.label}
                {"\n"}({slot.start}–{slot.end})
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: spacing.lg },
  title: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  dateButton: {
    backgroundColor: palette.card,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  dateText: { fontWeight: "600", color: palette.text },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  slot: {
    width: "47%",
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  slotAvailable: {
    backgroundColor: "#4CAF50", // 🟢 còn trống
  },
  slotBooked: {
    backgroundColor: "#E53935", // 🔴 đã giữ / đã đặt
  },
  slotText: {
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  noSlot: {
    textAlign: "center",
    color: palette.sub,
    width: "100%",
    marginTop: 20,
  },
});
