import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette, radius, shadow, spacing } from "../theme/theme";

export default function ReviewCard({ review }) {
  return (
    <View style={styles.card}>
      <Text style={styles.user}>{review.user?.name || "Ẩn danh"}</Text>
      <Text style={styles.comment}>{review.comment}</Text>
      <Text style={styles.rating}>⭐ {review.rating}/5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...shadow.card,
  },
  user: { fontWeight: "700", color: palette.text },
  comment: { color: palette.sub, marginVertical: 4 },
  rating: { color: palette.primaryDark, fontWeight: "600" },
});
