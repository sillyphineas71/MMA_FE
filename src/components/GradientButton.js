import React from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { palette, radius } from "../theme/theme";

export default function GradientButton({
  title,
  onPress,
  disabled,
  style,
  textStyle,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      style={[style, disabled && { opacity: 0.6 }]}
    >
      <LinearGradient
        colors={[palette.primary, palette.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.btn}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
