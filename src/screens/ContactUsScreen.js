import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette, spacing, radius } from "../theme/theme";

export default function ContactUsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Contact Us</Text>
        <Text style={styles.text}>
          Liên hệ hỗ trợ: support@example.com\n Số điện thoại: 0123 456 789\n
          Thời gian làm việc: 8:00 - 18:00 (T2 - T7)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: spacing.lg },
  card: {
    backgroundColor: "#fff",
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.text,
    marginBottom: spacing.sm,
  },
  text: { color: palette.text, lineHeight: 20 },
});
