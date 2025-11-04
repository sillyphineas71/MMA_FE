import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";
import { palette, spacing, radius } from "../theme/theme";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../config/api";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [showChange, setShowChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const name = user?.fullName || user?.name || "User";
  const email = user?.email || "(no email)";
  const role = user?.role || "customer";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.containerScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.containerInner}>
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

              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => setShowChange((s) => !s)}
              >
                <Text style={styles.changeBtnText}>
                  {showChange ? "Hủy" : "Đổi mật khẩu"}
                </Text>
              </TouchableOpacity>

              {showChange && (
                <View style={{ marginTop: spacing.md }}>
                  <TextInput
                    placeholder="Mật khẩu hiện tại"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Mật khẩu mới"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    style={[styles.input, { marginTop: spacing.sm }]}
                  />
                  <TouchableOpacity
                    style={[styles.changeBtn, { marginTop: spacing.sm }]}
                    onPress={async () => {
                      if (!currentPassword || !newPassword) {
                        Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin");
                        return;
                      }
                      try {
                        setChanging(true);
                        await apiPost("/api/auth/change-password", {
                          currentPassword,
                          newPassword,
                        });
                        Alert.alert("Thành công", "Đổi mật khẩu thành công");
                        setShowChange(false);
                        setCurrentPassword("");
                        setNewPassword("");
                      } catch (err) {
                        Alert.alert(
                          "Lỗi",
                          err.message || "Không thể đổi mật khẩu"
                        );
                      } finally {
                        setChanging(false);
                      }
                    }}
                  >
                    <Text style={styles.changeBtnText}>
                      {changing ? "Đang..." : "Xác nhận"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  changeBtn: {
    marginTop: spacing.md,
    backgroundColor: palette.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  changeBtnText: { color: "#fff", fontWeight: "700" },
  input: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: palette.text,
  },
  containerScroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
    backgroundColor: palette.bg,
  },
  containerInner: { flex: 1 },
});
