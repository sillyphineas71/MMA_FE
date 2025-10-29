import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { apiPost } from "../config/api";
import GradientButton from "../components/GradientButton";
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
    <View style={styles.screen}>
      <LinearGradient
        colors={[palette.primaryLight, "#EAFBF0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>Create Account</Text>
        <Text style={styles.heroSub}>Join and start booking today</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.title}>Đăng ký</Text>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          placeholder="Nguyễn Văn A"
          placeholderTextColor={palette.sub}
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={palette.sub}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={palette.sub}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <GradientButton
          title={loading ? "Đang xử lý..." : "Đăng ký"}
          onPress={onRegister}
          disabled={loading}
          style={{ marginTop: spacing.md }}
        />
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  hero: {
    height: 200,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: "flex-end",
    paddingBottom: spacing.lg,
  },
  heroTitle: { color: palette.text, fontSize: 22, fontWeight: "800" },
  heroSub: { color: palette.sub, marginTop: 4 },
  card: {
    backgroundColor: palette.card,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.xl,
    ...shadow.card,
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },
  label: {
    color: palette.sub,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: "#FAFBFC",
    color: palette.text,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  linkBtn: { alignItems: "center", padding: spacing.md },
  linkText: { color: palette.sub },
});
