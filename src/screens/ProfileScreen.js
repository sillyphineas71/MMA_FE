import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { palette, spacing, radius } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user } = useAuth();

  const name = user?.fullName || user?.name || "User";
  const email = user?.email || "(no email)";
  const role = user?.role || "customer";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: "https://placehold.co/120x120?text=Avatar" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{role.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Thông tin</Text>
        <Text style={styles.infoItem}>• Họ tên: {name}</Text>
        <Text style={styles.infoItem}>• Email: {email}</Text>
        <Text style={styles.infoItem}>• Vai trò: {role}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: spacing.lg },
  card: {
    alignItems: "center",
    backgroundColor: palette.card,
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
    backgroundColor: "#eee",
  },
  name: { fontSize: 20, fontWeight: "800", color: palette.text },
  email: { color: palette.sub, marginTop: 4 },
  badge: {
    marginTop: spacing.sm,
    backgroundColor: palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.sm,
    color: palette.text,
  },
  infoItem: { color: palette.text, marginBottom: 6 },
});
