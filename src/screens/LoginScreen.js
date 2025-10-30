import React, { useState, useContext } from "react"; // THÊM useContext
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { apiPost } from "../config/api";
import GradientButton from "../components/GradientButton";
import IconInput from "../components/IconInput";
import FooterDecor from "../components/FooterDecor";
import { palette, shadow, radius, spacing } from "../theme/theme";
import { useAuth } from "../context/AuthContext"; // THÊM

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth(); // THÊM

  const onLogin = async () => {
    try {
      setLoading(true);
      const res = await apiPost("/api/auth/login", { email, password });
      // API trả về { token: '...', user?: {...} }
      if (res && res.token) {
        await signIn(res); // nếu có user sẽ dùng luôn, nếu không sẽ decode token
        // Root navigator will switch stacks once user is set in context
      } else {
        throw new Error(res?.message || "Phản hồi đăng nhập không hợp lệ");
      }
    } catch (e) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (Phần return và styles của bạn giữ nguyên, KHÔNG CẦN SỬA) ...
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.screen}>
        {/* Hero header with splashy gradient and decorative circles */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[palette.primaryLight, "#EAFBF0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroCircles}>
              <View
                style={[
                  styles.circle,
                  { width: 140, height: 140, right: -30, top: -30 },
                ]}
              />
              <View
                style={[
                  styles.circle,
                  { width: 90, height: 90, left: -20, bottom: -10 },
                ]}
              />
            </View>
            {/* Football watermark to emphasize theme */}
            <Ionicons
              name="football"
              size={96}
              color="rgba(255,255,255,0.85)"
              style={styles.ballIcon}
            />
            <Text style={styles.heroTitle}>Welcome Back</Text>
            <Text style={styles.heroSub}>Book venues with the best offers</Text>
          </LinearGradient>

          {/* Segmented switch - simple, calm style */}
          <View style={styles.segment}>
            <View style={[styles.segmentBtn, styles.segmentActive]}>
              <Text style={[styles.segmentText, styles.segmentTextActive]}>
                Đăng nhập
              </Text>
            </View>
            <TouchableOpacity
              style={styles.segmentBtn}
              onPress={() => navigation.replace("Register")}
            >
              <Text style={styles.segmentText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card content inside a ScrollView so keyboard doesn't cover fields */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          <View style={styles.card}>
            <IconInput
              icon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <IconInput
              icon="lock-closed-outline"
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secure
              style={{ marginTop: spacing.md }}
            />

            <View style={styles.rowBetween}>
              <View style={styles.rowCenter}>
                <Ionicons
                  name="checkmark-circle"
                  color={palette.primaryDark}
                  size={18}
                />
                <Text style={styles.mutedSmall}> Nhớ đăng nhập</Text>
              </View>
              <TouchableOpacity>
                <Text
                  style={[
                    styles.mutedSmall,
                    { color: palette.primaryDark, fontWeight: "700" },
                  ]}
                >
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>
            </View>

            <GradientButton
              title={loading ? "Đang xử lý..." : "Đăng nhập"}
              onPress={onLogin}
              disabled={loading}
              style={{ marginTop: spacing.lg }}
            />

            {/* Social row */}
            <View style={styles.socialRow}>
              <View style={styles.socialBtn}>
                <Ionicons name="logo-google" size={18} color="#EA4335" />
              </View>
              <View style={styles.socialBtn}>
                <Ionicons name="logo-facebook" size={18} color="#1877F2" />
              </View>
              <View style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={18} color="#111" />
              </View>
            </View>

            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.linkText}>
                Chưa có tài khoản?{" "}
                <Text style={{ color: palette.primaryDark, fontWeight: "700" }}>
                  Đăng ký
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <FooterDecor />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  heroWrap: { paddingBottom: spacing.xl },
  hero: {
    height: 220,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: "flex-end",
    paddingBottom: spacing.lg,
    overflow: "hidden",
  },
  heroCircles: { position: "absolute", inset: 0 },
  circle: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 999,
  },
  heroTitle: { color: palette.text, fontSize: 22, fontWeight: "800" },
  heroSub: { color: palette.sub, marginTop: 4 },
  ballIcon: { position: "absolute", right: 24, top: 40 },
  segment: {
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    marginTop: -spacing.md,
    flexDirection: "row",
    borderRadius: radius.pill,
    padding: 4,
    ...shadow.card,
  },
  segmentBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
  },
  segmentActive: { backgroundColor: palette.primary },
  segmentText: { color: palette.sub, fontWeight: "700" },
  segmentTextActive: { color: "#fff" },
  card: {
    backgroundColor: palette.card,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    ...shadow.card,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  mutedSmall: { color: palette.sub, fontSize: 12 },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: spacing.lg,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F4F6F8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border,
  },
  linkBtn: { alignItems: "center", padding: spacing.md },
  linkText: { color: palette.sub },
});
