import React, { useEffect, useMemo, useRef, useState } from "react";
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
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
export default function HomeScreen({ navigation }) {
  const [venues, setVenues] = useState([]); // ✅ đảm bảo luôn là mảng
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // ✅ HÀM CHÍNH: fetch sân theo search
  async function fetchVenues() {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/venues?search=${encodeURIComponent(search)}`;

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
  const handleGetLocation = async () => {
    try {
      // Nếu map đang bật: tắt map và trả giao diện về như ban đầu
      if (showMap) {
        setShowMap(false);
        return;
      }
      // Hiển thị nhanh: bật icon loading cho chip
      setNearbyLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("⚠️ Bạn cần cấp quyền truy cập vị trí để xem sân gần bạn!");
        setNearbyLoading(false);
        return;
      }
      // Dùng vị trí gần nhất (nếu có) để hiển thị ngay
      const last = await Location.getLastKnownPositionAsync();
      if (last?.coords) {
        const { latitude, longitude } = last.coords;
        setShowMap(true);
        setUserLocation({ lat: latitude, lng: longitude });
        const region1 = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setMapRegion(region1);
        mapRef.current?.animateToRegion?.(region1, 400);
      } else {
        setShowMap(true);
      }

      // Lấy vị trí chính xác hơn ở background, không chặn UI
      (async () => {
        try {
          const fine = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const { latitude, longitude } = fine.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const region2 = {
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setMapRegion(region2);
          mapRef.current?.animateToRegion?.(region2, 500);
        } catch (e) {
          // ignore
        } finally {
          setNearbyLoading(false);
        }
      })();
    } catch (err) {
      console.error("❌ Lỗi lấy vị trí:", err);
      alert("Không thể lấy vị trí hiện tại!");
      setNearbyLoading(false);
    }
  };

  // ✅ Gọi lần đầu khi mở màn hình (tránh refetch theo vị trí)
  useEffect(() => {
    fetchVenues();
  }, []);

  // 🗺️ Tính region cho bản đồ
  const initialRegion = useMemo(() => {
    if (userLocation?.lat && userLocation?.lng) {
      return {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    const first = venues.find((v) => v?.location?.coordinates?.length >= 2);
    if (first) {
      const [lng, lat] = first.location.coordinates;
      return {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }
    return { latitude: 0, longitude: 0, latitudeDelta: 1, longitudeDelta: 1 };
  }, [userLocation, venues]);

  // Cập nhật region điều khiển ban đầu khi đã có initialRegion
  useEffect(() => {
    if (initialRegion && !mapRegion) {
      setMapRegion(initialRegion);
    }
  }, [initialRegion]);

  // 🔒 Tạo vị trí ảo (obfuscation) nhưng vẫn gần vị trí thật
  const obfuscateCoord = (lat, lng, seedStr) => {
    try {
      // djb2 hash to seed
      let hash = 5381;
      const s = String(seedStr || "seed");
      for (let i = 0; i < s.length; i++)
        hash = (hash << 5) + hash + s.charCodeAt(i);
      // deterministic pseudo random 0..1
      const rand = (min = 0, max = 1) => {
        hash = (hash * 9301 + 49297) % 233280;
        const rnd = hash / 233280;
        return min + rnd * (max - min);
      };
      const meters = rand(120, 400); // 120-400m offset
      const theta = rand(0, Math.PI * 2);
      const dLat = (meters * Math.cos(theta)) / 111320; // meters to degrees
      const dLng =
        (meters * Math.sin(theta)) / (111320 * Math.cos((lat * Math.PI) / 180));
      return { lat: lat + dLat, lng: lng + dLng };
    } catch (e) {
      return { lat, lng };
    }
  };

  // Tính khoảng cách Haversine (km)
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Khi bật map và có vị trí, tự zoom để thấy chấm đỏ của sân gần nhất
  useEffect(() => {
    if (!showMap || !userLocation || !venues?.length || !mapRef.current) return;
    const candidates = venues.filter(
      (v) => v?.location?.coordinates?.length >= 2
    );
    if (!candidates.length) return;
    let nearest = null;
    let best = Infinity;
    for (const v of candidates) {
      const [lng, lat] = v.location.coordinates;
      const d = haversineKm(userLocation.lat, userLocation.lng, lat, lng);
      if (d < best) {
        best = d;
        nearest = { v, lat, lng };
      }
    }
    if (!nearest) return;
    const j = obfuscateCoord(
      nearest.lat,
      nearest.lng,
      nearest.v._id || nearest.v.id || nearest.v.name
    );
    const coords = [
      { latitude: userLocation.lat, longitude: userLocation.lng },
      { latitude: j.lat, longitude: j.lng },
    ];
    try {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    } catch (e) {
      mapRef.current.animateToRegion(
        {
          latitude: j.lat,
          longitude: j.lng,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        500
      );
    }
  }, [showMap, userLocation, venues]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚽ Football Booking</Text>

      {/* 🔍 Thanh tìm kiếm */}
      <View style={styles.searchRow}>
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
      </View>

      {/* 📍 Nhanh: Sân gần tôi nhất */}
      <View style={styles.quickRow}>
        <TouchableOpacity
          style={showMap ? styles.quickChipActive : styles.quickChip}
          onPress={handleGetLocation}
          activeOpacity={0.9}
          disabled={nearbyLoading}
        >
          {nearbyLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="navigate" size={16} color="#fff" />
          )}
          <Text style={styles.quickText}> Sân gần tôi nhất</Text>
        </TouchableOpacity>
      </View>

      {/* 🗺️ Bản đồ hiển thị các sân (dấu chấm đỏ) - Ẩn mặc định */}
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            region={mapRegion || initialRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {venues
              .filter((v) => v?.location?.coordinates?.length >= 2)
              .map((v) => {
                const [origLng, origLat] = v.location.coordinates;
                const jitter = obfuscateCoord(
                  origLat,
                  origLng,
                  v._id || v.id || v.name
                );
                return (
                  <Marker
                    key={v._id || v.id}
                    coordinate={{ latitude: jitter.lat, longitude: jitter.lng }}
                    pinColor="#FF3B30"
                    title={v.name}
                    description={v.address}
                    onPress={() =>
                      navigation.navigate("VenueDetail", { id: v._id || v.id })
                    }
                  />
                );
              })}
          </MapView>
        </View>
      )}

      {/* 🏟️ Danh sách sân như ban đầu (ẩn khi map bật) */}
      {!showMap &&
        (loading ? (
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
        ))}
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
  quickRow: {
    flexDirection: "row",
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  quickChipActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.primaryDark || "#0B5ED7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  quickText: { color: "#fff", fontWeight: "700" },
  mapContainer: {
    height: 240,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  venueRow: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  venueName: { fontSize: 16, fontWeight: "700", color: palette.text },
  venueAddr: { color: palette.sub, marginTop: 2 },
});
