import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { API_BASE } from "../config/api";
import { palette, spacing, radius } from "../theme/theme";
import VenueCard from "../components/VenueCard";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
export default function HomeScreen({ navigation }) {
  const [venues, setVenues] = useState([]); // ✅ đảm bảo luôn là mảng
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  
   // ✅ HÀM CHÍNH: fetch sân theo search + (nếu có) vị trí
  async function fetchVenues() {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/venues?search=${encodeURIComponent(search)}`;

      // Nếu có vị trí người dùng → thêm lat/lng vào URL
      if (userLocation?.lat && userLocation?.lng) {
        url += `&lat=${userLocation.lat}&lng=${userLocation.lng}&radius=100`;
      }

      const res = await fetch(url);
      const data = await res.json();
      console.log("📦 Fetch venues:", data);

      if (Array.isArray(data)) setVenues(data);
      else if (Array.isArray(data?.venues)) setVenues(data.venues);
      else setVenues([]);
    } catch (err) {
      console.error("❌ Fetch venues error:", err.message);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }

  // 📍 Hàm lấy vị trí hiện tại và lọc sân gần tôi
  const handleGetLocation  = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("⚠️ Bạn cần cấp quyền truy cập vị trí để xem sân gần bạn!");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation({ lat: latitude, lng: longitude });
      fetchVenues(latitude, longitude);
    } catch (err) {
      console.error("❌ Lỗi lấy vị trí:", err);
      alert("Không thể lấy vị trí hiện tại!");
    }
  };

  // ✅ Gọi lần đầu khi mở màn hình
  useEffect(() => {
    fetchVenues();
  }, [userLocation]); // tự refetch khi có vị trí

  return (
  <View style={styles.container}>
    <Text style={styles.header}>⚽ Football Booking</Text>

    {/* 🔍 Thanh tìm kiếm + nút vị trí */}
    <View style={styles.searchRow}>
  {/* 🔍 Ô tìm kiếm */}
  <View
    style={{
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFFFF", 
      borderRadius: 50,          
      paddingHorizontal: spacing.md + 2,
      paddingVertical: 6,
      borderWidth: 1.2,           
      borderColor: "#E0E0E0",     
      shadowColor: "#000",        
      shadowOpacity: 0.06,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,               
    }}
  >
    <Ionicons name="search-outline" size={18} color={palette.sub} />
    <TextInput
      placeholder="Tìm kiếm sân bóng..."
      value={search}
      onChangeText={setSearch}
      onSubmitEditing={fetchVenues}
      placeholderTextColor="#9E9E9E" //  placeholder dịu mắt
      style={{
        flex: 1,
        marginLeft: 6,
        fontSize: 15,
        color: palette.text,
      }}
    />
  </View>

  {/*  Nút “Sân gần tôi” */}
  <TouchableOpacity
    style={{
      backgroundColor: "#4CAF50", //  xanh lá tươi hơn
      width: 34,
      height: 34,
      marginLeft: spacing.sm,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    }}
    onPress={handleGetLocation}
    activeOpacity={0.85}
  >
    <Ionicons name="location-outline" size={20} color="#fff" />
  </TouchableOpacity>
</View>



    {/* 🏟️ Danh sách sân */}
    {loading ? (
      <ActivityIndicator size="large" color={palette.primary} />
    ) : venues.length > 0 ? (
      <ScrollView showsVerticalScrollIndicator={false}>
        {venues.map((v) => (
          <VenueCard
            key={v._id || v.id}
            venue={v}
            onPress={() =>
              navigation.navigate("VenueDetail", { id: v._id || v.id })
            }
          />
        ))}
      </ScrollView>
    ) : (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>😔 Không tìm thấy sân nào</Text>
      </View>
    )}
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    padding: spacing.lg,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.text,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.lg,
  },
  empty: {
    marginTop: 80,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: palette.sub,
  },
  searchRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.lg,
},
nearbyButton: {
  backgroundColor: palette.primary,
  padding: spacing.sm,
  borderRadius: radius.lg,
  marginLeft: spacing.sm,
},

});
