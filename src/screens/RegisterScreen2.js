import React, { useState } from "react";
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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    try {
      setLoading(true);
      const res = await apiPost("/api/auth/register", {
        name,
        email,
        password,
      });
      Alert.alert("Thành công", "Đăng ký thành công");
      console.log("TOKEN", res.token);
      navigation.replace("Login");
    } catch (e) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
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
            <Ionicons
              name="football"
              size={96}
              color="rgba(255,255,255,0.85)"
              style={styles.ballIcon}
            />
            <Text style={styles.heroTitle}>Create Account</Text>
            <Text style={styles.heroSub}>Join and start booking today</Text>
          </LinearGradient>

          <View style={styles.segment}>
            <TouchableOpacity
              style={styles.segmentBtn}
              onPress={() => navigation.replace("Login")}
            >
              <Text style={styles.segmentText}>Đăng nhập</Text>
            </TouchableOpacity>
            <View style={[styles.segmentBtn, styles.segmentActive]}>
              <Text style={[styles.segmentText, styles.segmentTextActive]}>
                Đăng ký
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          <View style={styles.card}>
            <IconInput
              icon="person-outline"
              placeholder="Họ và tên"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <IconInput
              icon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={{ marginTop: spacing.md }}
            />
            <IconInput
              icon="lock-closed-outline"
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secure
              style={{ marginTop: spacing.md }}
            />

            <View style={[styles.rowCenter, { marginTop: spacing.sm }]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={palette.primaryDark}
              />
              <Text style={styles.mutedSmall}> 8+ ký tự, gồm chữ và số</Text>
            </View>

            <GradientButton
              title={loading ? "Đang xử lý..." : "Đăng ký"}
              onPress={onRegister}
              disabled={loading}
              style={{ marginTop: spacing.lg }}
            />

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
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.linkText}>
                Đã có tài khoản?{" "}
                <Text style={{ color: palette.primaryDark, fontWeight: "700" }}>
                  Đăng nhập
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
          <FooterDecor />
        </ScrollView>
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
  card: {
    backgroundColor: palette.card,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    ...shadow.card,
  },
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
