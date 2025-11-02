import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import IconInput from "../components/IconInput";
import GradientButton from "../components/GradientButton";
import { apiPost } from "../config/api";
import { palette, spacing, radius, shadow } from "../theme/theme";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await apiPost("/api/auth/forgot-password", { email });
      Alert.alert("Đã gửi", "Nếu email tồn tại, mã OTP đã được gửi");
      navigation.replace("ResetPassword", { email });
    } catch (e) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.sub}>Nhập email của bạn để nhận mã OTP</Text>
      <View style={styles.card}>
        <IconInput
          icon="mail-outline"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <GradientButton
          title={loading ? "Đang gửi..." : "Gửi mã"}
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
