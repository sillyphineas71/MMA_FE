import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette, shadow, radius, spacing } from "../theme/theme"; 
import { Feather } from "@expo/vector-icons"; 

// Thêm prop 'iconName' vào
export default function StatsCard({ iconName, title, value, unit }) {
  // Map này chỉ dùng cho Admin
  const adminIconMap = {
    "Tổng Doanh thu": "help-circle",
    "Tổng Lượt đặt": "calendar",
    "Khách mới": "user-plus",
    "Chủ sân mới": "home",
  };

  // Ưu tiên prop 'iconName' nếu được truyền vào
  // Nếu không, thử tìm trong map (cho Admin)
  // Nếu không thấy, dùng icon mặc định
  const finalIconName = iconName || adminIconMap[title] || "alert-circle";

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {/* Sử dụng 'finalIconName' */}
        <Feather name={finalIconName} size={20} color={palette.primaryDark} />
      </View>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>
          {value} <Text style={styles.unit}>{unit}</Text>
        </Text>
      </View>
    </View>
  );
}

// ... (Phần styles giữ nguyên y hệt) ...
const styles = StyleSheet.create({
  card: {
    flex: 1, 
    backgroundColor: palette.card,
    borderRadius: radius.lg, 
    ...shadow.card, 
    padding: spacing.md, 
    margin: spacing.sm / 2, 
    minHeight: 120,
    justifyContent: "space-between",
  },
  iconContainer: {
    backgroundColor: palette.primaryLight,
    width: 40,
    height: 40,
    borderRadius: radius.pill, 
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm, 
  },
  title: {
    color: palette.sub,
    fontSize: 14,
  },
  value: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: spacing.xs, 
  },
  unit: {
    color: palette.sub,
    fontSize: 16,
    fontWeight: "500",
  },
});