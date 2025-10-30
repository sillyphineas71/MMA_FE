import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { apiGet, apiPatch } from "../../config/api"; // dùng apiPatch cho PATCH
import { palette, spacing, radius, shadow } from "../../theme/theme";

const ROLE_FILTERS = ["All roles", "Admin", "Owner", "Customer"];
const STATUS_FILTERS = ["All", "Active", "Banned"];

export default function AdminUsersScreen() {
  const [selectedRole, setSelectedRole] = useState("All roles");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user list
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        role: selectedRole === "All roles" ? "" : selectedRole.toLowerCase(),
        status: selectedStatus === "All" ? "" : selectedStatus.toLowerCase(),
        search,
      };
      const res = await apiGet("/api/admin/users", params);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Fetch users error:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedStatus]);

  // Toggle user status between "active" and "banned"
  const handleToggleStatus = (userId, currentStatus) => {
    const nextStatus = currentStatus === "banned" ? "active" : "banned";
    Alert.alert(
      "Confirm Status Change",
      `Are you sure you want to set this user to "${nextStatus}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setLoading(true);
              await apiPatch(`/api/admin/users/${userId}/status`, { status: nextStatus });
              // Cập nhật trực tiếp UI
              setUsers((prev) =>
                prev.map((user) =>
                  user._id === userId ? { ...user, status: nextStatus } : user
                )
              );
            } catch (e) {
              console.error("Update status error:", e.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Search box */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search user"
          placeholderTextColor={palette.sub}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchUsers}
          style={styles.searchInput}
        />
      </View>

      {/* Role & Status filters */}
      <View style={styles.filterSection}>
        <FlatList
          data={ROLE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedRole === item && styles.chipActive]}
              onPress={() => setSelectedRole(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedRole === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedStatus === item && styles.chipActive]}
              onPress={() => setSelectedStatus(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedStatus === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* User list */}
      {loading ? (
        <ActivityIndicator size="large" color={palette.primary} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.info}>
                {item.email} •{" "}
                {item.roles && item.roles.join
                  ? item.roles.join("/")
                  : item.role || ""}{" "}
                • {item.status}
              </Text>

              {/* Toggle status button */}
              <TouchableOpacity
                style={[
                  styles.banButton,
                  { backgroundColor: item.status === "banned" ? "#6FCF97" : "#FF6B6B" },
                ]}
                onPress={() => handleToggleStatus(item._id, item.status)}
              >
                <Text style={styles.banButtonText}>
                  {item.status === "banned" ? "Activate" : "Ban"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FAF8", padding: spacing.md },
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    padding: spacing.sm,
    ...shadow.card,
  },
  searchInput: {
    fontSize: 16,
    color: palette.text,
    paddingHorizontal: spacing.sm,
  },
  filterSection: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: "#EAFBEF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: "#6FCF97",
  },
  chipText: { color: "#4E9F69", fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    marginTop: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  name: { fontWeight: "700", fontSize: 16, color: palette.text },
  info: { color: palette.sub, marginTop: 4 },
  banButton: {
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    alignSelf: "flex-start",
  },
  banButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
