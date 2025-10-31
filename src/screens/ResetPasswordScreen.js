import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import IconInput from "../components/IconInput";
import GradientButton from "../components/GradientButton";
import { apiPost } from "../config/api";
import { palette, spacing, radius, shadow } from "../theme/theme";

export default function ResetPasswordScreen({ route, navigation }) {
  const { email: initialEmail } = route.params || {};
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await apiPost("/api/auth/reset-password", {
        email,
        code,
        newPassword: password,
      });
      Alert.alert(
        "Thành công",
        "Đặt lại mật khẩu thành công, vui lòng đăng nhập"
      );
      navigation.replace("Login");
    } catch (e) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>
      <Text style={styles.sub}>Nhập mã OTP và mật khẩu mới</Text>
      <View style={styles.card}>
        <IconInput
          icon="mail-outline"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <IconInput
          icon="key-outline"
          placeholder="Mã OTP"
          value={code}
          onChangeText={setCode}
          style={{ marginTop: spacing.md }}
        />
        <IconInput
          icon="lock-closed-outline"
          placeholder="Mật khẩu mới"
          value={password}
          onChangeText={setPassword}
          secure
          style={{ marginTop: spacing.md }}
        />
        <GradientButton
          title={loading ? "Đang cập nhật..." : "Cập nhật"}
          onPress={onSubmit}
          disabled={loading}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: palette.text },
  sub: { color: palette.sub, marginTop: 4 },
  card: {
    backgroundColor: palette.card,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    ...shadow.card,
  },
});
