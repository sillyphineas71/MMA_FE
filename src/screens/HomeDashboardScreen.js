import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, radius, spacing, shadow } from "../theme/theme";
import { useAuth } from "../context/AuthContext"; //  lấy user từ context

export default function HomeDashboardScreen({ navigation }) {
  const { user } = useAuth(); //  truy cập user đăng nhập

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.username}>
              Hey,{" "}
              {user?.fullName ||
                user?.name ||
                user?.email?.split("@")[0] ||
                "Player"}{" "}
              👋
            </Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8}>
            <Ionicons
              name="notifications-outline"
              size={26}
              color={palette.text}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={palette.sub} />
          <TextInput
            placeholder="Tìm kiếm sân bóng..."
            placeholderTextColor={palette.sub}
            style={styles.searchInput}
          />
        </View>

        {/* Banner */}
        <LinearGradient
          colors={[palette.primaryLight, palette.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Ionicons
            name="football"
            size={80}
            color="rgba(255,255,255,0.9)"
            style={{ marginBottom: spacing.sm }}
          />
          <Text style={styles.bannerText}>
            Book Venues With The Best Offers!
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bookButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.bookButtonText}>Book Now ↗</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Grid buttons */}
        <View style={styles.grid}>
          {[
            { label: "My Calendar", icon: "calendar-outline" },
            { label: "Create Activity", icon: "add-circle-outline" },
            { label: "Quick Book", icon: "flash-outline" },
            { label: "Favourite Venues", icon: "heart-outline" },
            { label: "Leaderboard", icon: "trophy-outline" },
            { label: "Offers", icon: "pricetags-outline" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.gridItem}
              activeOpacity={0.85}
            >
              <Ionicons
                name={item.icon}
                size={28}
                color={palette.primaryDark}
              />
              <Text style={styles.gridText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Ionicons name="home" size={28} color={palette.primaryDark} />
        <Ionicons name="football-outline" size={26} color={palette.sub} />
        <Ionicons name="menu-outline" size={26} color={palette.sub} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  username: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.text,
  },
  subtitle: {
    fontSize: 14,
    color: palette.sub,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: palette.text,
  },
  banner: {
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: "center",
    ...shadow.card,
  },
  bannerText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  bookButton: {
    backgroundColor: "#fff",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  bookButtonText: {
    fontWeight: "700",
    color: palette.primaryDark,
  },
  grid: {
    marginTop: spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
    paddingVertical: spacing.lg,
    ...shadow.card,
  },
  gridText: {
    marginTop: spacing.sm,
    fontWeight: "600",
    color: palette.text,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: spacing.sm,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.card,
  },
});
