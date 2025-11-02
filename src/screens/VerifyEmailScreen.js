import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import IconInput from "../components/IconInput";
import GradientButton from "../components/GradientButton";
import FooterDecor from "../components/FooterDecor";
import { apiPost } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { palette, spacing, radius, shadow } from "../theme/theme";

export default function VerifyEmailScreen({ route, navigation }) {
  const { email: initialEmail } = route.params || {};
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { signIn } = useAuth();

  const onVerify = async () => {
    try {
      if (!email || !code)
        return Alert.alert("Thiếu thông tin", "Nhập email và mã OTP");
      setLoading(true);
      const res = await apiPost("/api/auth/verify-email", { email, code });
      if (res?.token) {
        await signIn(res);
      } else {
        Alert.alert("Thành công", "Xác minh thành công, vui lòng đăng nhập");
        navigation.replace("Login");
      }
    } catch (e) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      if (!email) return Alert.alert("Thiếu email", "Vui lòng nhập email");
      setResendLoading(true);
      await apiPost("/api/auth/resend-otp", { email });
      Alert.alert(
        "Đã gửi",
        "Mã xác minh mới đã được gửi. Vui lòng kiểm tra email (có thể ở Spam)"
      );
    } catch (e) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.screen}>
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[palette.primaryLight, "#EAFBF0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Ionicons
              name="mail-open-outline"
              size={96}
              color="rgba(255,255,255,0.85)"
              style={styles.icon}
            />
            <Text style={styles.heroTitle}>Xác minh Email</Text>
            <Text style={styles.heroSub}>
              Nhập mã OTP đã gửi tới email của bạn
            </Text>
          </LinearGradient>
        </View>

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
          <GradientButton
            title={loading ? "Đang xác minh..." : "Xác minh"}
            onPress={onVerify}
            disabled={loading}
            style={{ marginTop: spacing.lg }}
          />
          <TouchableOpacity
            disabled={resendLoading}
            onPress={onResend}
            style={{ alignItems: "center", marginTop: spacing.sm }}
          >
            <Text
              style={{
                color: resendLoading ? palette.sub : palette.primaryDark,
                fontWeight: "700",
              }}
            >
              {resendLoading ? "Đang gửi lại mã..." : "Gửi lại mã"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            Không nhận được mã? Hãy kiểm tra mục Spam hoặc thử lại sau 1 phút.
          </Text>
        </View>
        <FooterDecor />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  heroWrap: { paddingBottom: spacing.xl },
  hero: {
    height: 200,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: "flex-end",
    paddingBottom: spacing.lg,
    overflow: "hidden",
  },
  icon: { position: "absolute", right: 24, top: 40 },
  heroTitle: { color: palette.text, fontSize: 22, fontWeight: "800" },
  heroSub: { color: palette.sub, marginTop: 4 },
  card: {
    backgroundColor: palette.card,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    ...shadow.card,
  },
  helpText: { color: palette.sub, marginTop: spacing.md, textAlign: "center" },
});
