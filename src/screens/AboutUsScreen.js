import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette, spacing, radius } from "../theme/theme";

export default function AboutUsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.text}>
          Ứng dụng đặt sân bóng giúp bạn tìm và đặt sân nhanh chóng, minh bạch,
          và tiện lợi. Đây là nội dung giới thiệu mẫu để trình diễn giao diện.
          Bạn có thể thay đổi sau.
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
