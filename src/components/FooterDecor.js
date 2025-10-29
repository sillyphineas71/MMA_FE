import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { palette, radius } from "../theme/theme";

// Decorative footer using icon chips (no external image)
export default function FooterDecor() {
  return (
    <LinearGradient
      colors={["#F7FAF7", "#EEF8F1"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.footerWrap}
    >
      <View style={styles.iconChipsRow}>
        <View style={styles.chip}>
          <Ionicons name="football" size={18} color={palette.primaryDark} />
        </View>
        <View style={styles.chip}>
          <Ionicons name="flag-outline" size={18} color={palette.primaryDark} />
        </View>
        <View style={styles.chip}>
          <Ionicons
            name="trophy-outline"
            size={18}
            color={palette.primaryDark}
          />
        </View>
        <View style={styles.chip}>
          <Ionicons name="time-outline" size={18} color={palette.primaryDark} />
        </View>
        <View style={styles.chip}>
          <Ionicons
            name="location-outline"
            size={18}
            color={palette.primaryDark}
          />
        </View>
      </View>
      <Text style={styles.caption}>Book your perfect pitch</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  footerWrap: {
    marginTop: 16,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingVertical: 16,
    alignItems: "center",
  },
  iconChipsRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  chip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E6EFE7",
  },
  caption: { color: palette.sub, fontSize: 12 },
});
