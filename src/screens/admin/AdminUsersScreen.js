import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiGet, apiPatch } from "../../config/api"; // dùng apiPatch cho PATCH
import { palette, spacing, radius, shadow } from "../../theme/theme";

const ROLE_FILTERS = ["All roles", "Owner", "Customer"];
const STATUS_FILTERS = ["All", "Active", "Banned"];

export default function AdminUsersScreen() {
  const [selectedRole, setSelectedRole] = useState("All roles");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user list
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        role: selectedRole === "All roles" ? "" : selectedRole.toLowerCase(),
        status: selectedStatus === "All" ? "" : selectedStatus.toLowerCase(),
        search,
      };
      const res = await apiGet("/api/admin/users", params);
      // Normalize response to list then filter out admin accounts
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.users)
        ? res.users
        : Array.isArray(res?.results)
        ? res.results
        : [];
      const filtered = list.filter((user) => {
        const roles = Array.isArray(user.roles)
          ? user.roles
          : user.role
          ? [user.role]
          : [];
        return !roles.includes("admin");
      });
      setUsers(filtered);
    } catch (e) {
      console.error("Fetch users error:", e.message);
      Alert.alert("Lỗi tải Users", e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedRole, selectedStatus, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toggle ban/activate user (updates local list optimistically)

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchUsers();
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "banned" ? "active" : "banned";

      await apiPatch(`/api/admin/users/${userId}/status`, {
        status: newStatus,
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );

      Alert.alert(
        "Thành công",
        `Người dùng đã được ${newStatus === "banned" ? "cấm" : "kích hoạt"}.`
      );
    } catch (error) {
      console.error("Toggle status error:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái người dùng.");
    }
  };

  const Badge = ({ text, color = palette.primary }) => (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + "22", borderColor: color + "55" },
      ]}
    >
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );

  const Chip = ({ text, active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {text}
      </Text>
    </TouchableOpacity>
  );

  const EmptyState = ({
    title = "Không có dữ liệu",
    subtitle = "Hãy đổi bộ lọc hoặc tìm kiếm khác",
  }) => (
    <View style={styles.emptyBox}>
      <Ionicons name="file-tray-outline" size={36} color={palette.sub} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{subtitle}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const roles = Array.isArray(item.roles)
      ? item.roles
      : item.role
      ? [item.role]
      : [];
    const isBanned = item.status === "banned";
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.name || item.email || "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name || "(No name)"}</Text>
            <Text style={styles.info}>{item.email || "(No email)"}</Text>
          </View>
          <Badge
            text={isBanned ? "Banned" : "Active"}
            color={isBanned ? "#FF6B6B" : "#6FCF97"}
          />
        </View>
        <View style={styles.rolesRow}>
          {roles.length === 0 ? (
            <Badge text="No role" color={palette.sub} />
          ) : (
            roles.map((r) => (
              <Badge
                key={r}
                text={r}
                color={
                  r === "admin"
                    ? "#7DD957"
                    : r === "owner"
                    ? "#6FCF97"
                    : "#4E9F69"
                }
              />
            ))
          )}
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isBanned ? styles.btnActivate : styles.btnBan,
            ]}
            activeOpacity={0.85}
            onPress={() => handleToggleStatus(item._id, item.status)}
          >
            <Ionicons
              name={isBanned ? "checkmark-circle-outline" : "ban-outline"}
              size={16}
              color="#fff"
            />
            <Text style={styles.actionText}>
              {isBanned ? "Activate" : "Ban"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Quản lý người dùng</Text>

      {/* Search box */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={18}
          color={palette.sub}
          style={{ marginHorizontal: 8 }}
        />
        <TextInput
          placeholder="Search user (name, email, phone)"
          placeholderTextColor={palette.sub}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchUsers}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* Role & Status filters */}
      <View style={styles.filterSection}>
        <FlatList
          data={ROLE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: spacing.xs }}
          renderItem={({ item }) => (
            <Chip
              text={item}
              active={selectedRole === item}
              onPress={() => setSelectedRole(item)}
            />
          )}
        />
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{
            paddingHorizontal: spacing.xs,
            marginTop: spacing.xs,
          }}
          renderItem={({ item }) => (
            <Chip
              text={item}
              active={selectedStatus === item}
              onPress={() => setSelectedStatus(item)}
            />
          )}
        />
      </View>

      {/* User list */}
      {loading ? (
        <View style={{ paddingTop: spacing.lg }}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : users.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: spacing.md },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.text,
    marginBottom: spacing.sm,
  },
  searchBox: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    paddingVertical: Platform.select({ ios: spacing.sm, android: 0 }),
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: palette.text,
    paddingHorizontal: spacing.xs,
    paddingVertical: Platform.select({ ios: 6, android: 8 }),
  },
  filterSection: {
    marginTop: spacing.md,
  },
  chip: {
    backgroundColor: "#F0F7F3",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primaryDark,
  },
  chipText: { color: palette.sub, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  card: {
    backgroundColor: palette.card,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAFBEF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  avatarText: { color: "#4E9F69", fontWeight: "800" },
  name: { fontWeight: "800", fontSize: 16, color: palette.text },
  info: { color: palette.sub, marginTop: 2, fontSize: 12 },
  rolesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  btnBan: { backgroundColor: "#FF6B6B" },
  btnActivate: { backgroundColor: "#6FCF97" },
  actionText: { color: "#fff", fontWeight: "700" },
  badge: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginLeft: 8,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  emptyBox: { alignItems: "center", marginTop: spacing.xl },
  emptyTitle: { color: palette.text, fontWeight: "700", marginTop: spacing.sm },
  emptySub: { color: palette.sub, marginTop: 2 },
});
