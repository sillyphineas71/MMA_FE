import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPost, apiPostForm } from "../config/api";

export default function OwnerVenueCreateScreen({ navigation }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState("08:00");
  const [close, setClose] = useState("22:00");
  const [showPicker, setShowPicker] = useState(null);
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 10.762622,
    longitude: 106.660172,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem("token");
      if (t) setToken(t);
    })();
  }, []);

  // Chọn ảnh
  const pickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Cần quyền truy cập ảnh để chọn ảnh!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        let uris = [];
        if (result.assets && Array.isArray(result.assets)) {
          uris = result.assets.map((a) => {
            let u = a.uri;
            if (Platform.OS === "android" && !u.startsWith("file://")) {
              u = "file://" + u;
            }
            return u;
          });
        } else if (result.uri) {
          let u = result.uri;
          if (Platform.OS === "android" && !u.startsWith("file://")) {
            u = "file://" + u;
          }
          uris = [u];
        }

        console.log("✅ Ảnh được chọn:", uris);
        setImages((prev) => [...prev, ...uris]);
      } else {
        console.log("❌ Người dùng hủy chọn ảnh");
      }
    } catch (err) {
      console.error("pickImages error:", err);
      Alert.alert("Lỗi chọn ảnh", err.message || String(err));
    }
  };

  const removeImage = (uri) =>
    setImages((prev) => prev.filter((i) => i !== uri));

  // Dịch ngược tọa độ
  const reverseGeocodeAndUpdateUI = async (latitude, longitude) => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (results.length > 0) {
        const addr = results[0];
        const formattedAddress = [
          addr.streetNumber,
          addr.street,
          addr.subregion,
          addr.region,
          addr.city,
          addr.country,
        ]
          .filter(Boolean)
          .join(", ");
        setAddress(formattedAddress);
        setArea(addr.city || addr.region || "");
      }
    } catch (e) {
      console.warn("Lỗi khi dịch ngược tọa độ:", e);
    }
  };

  // Lấy vị trí hiện tại
  const handleGetLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return Alert.alert("Cần quyền truy cập vị trí!");
    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;
    setLocation({ type: "Point", coordinates: [longitude, latitude] });
    setRegion((r) => ({ ...r, latitude, longitude }));
    await reverseGeocodeAndUpdateUI(latitude, longitude);
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation({ type: "Point", coordinates: [longitude, latitude] });
    setRegion((r) => ({ ...r, latitude, longitude }));
    await reverseGeocodeAndUpdateUI(latitude, longitude);
  };

  // Chuyển "HH:mm" → Date
  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const onTimeChange = (event, selectedTime) => {
    // selectedTime === undefined khi cancel trên Android
    if (Platform.OS === "android") setShowPicker(null);
    if (!selectedTime) return;
    const h = selectedTime.getHours().toString().padStart(2, "0");
    const m = selectedTime.getMinutes().toString().padStart(2, "0");
    if (showPicker === "open") setOpen(`${h}:${m}`);
    if (showPicker === "close") setClose(`${h}:${m}`);
  };

  // ======== HANDLE CREATE (FormData) ========
  const handleCreate = async () => {
    if (!name?.trim() || !area?.trim() || !location) {
      return Alert.alert(
        "Lỗi",
        "Vui lòng nhập Tên sân, Khu vực và chọn Vị trí!"
      );
    }
    setLoading(true);

    try {
      // nếu không có ảnh thì gửi JSON bình thường (server đã accept)
      if (images.length === 0) {
        const payload = {
          name: name.trim(),
          address: address.trim(),
          area: area.trim(),
          contact: { phone: phone.trim() || "" },
          hours: { open, close },
          location,
          images: [],
        };
        const resp = await apiPost("/api/owner/venues", payload);
        if (resp?._id) {
          Alert.alert("✅ Thành công", "Tạo sân thành công!");
          navigation.goBack();
        } else {
          throw new Error(resp?.message || "Tạo sân thất bại");
        }
        return;
      }

      // Nếu có ảnh: build FormData
      const formData = new FormData();

      formData.append("name", name);
      formData.append("address", address);
      formData.append("area", area);
      formData.append("contact[phone]", phone);

      // toạ độ, giờ, location...
      formData.append("hours[open]", open);
      formData.append("hours[close]", close);
      formData.append("location[type]", "Point");
      formData.append("location[coordinates][]", region.longitude);
      formData.append("location[coordinates][]", region.latitude);

      // 4) images: append file objects (RN expects { uri, name, type })
      images.forEach((image, index) => {
        formData.append("images", {
          uri: image, // đường dẫn từ ImagePicker
          name: `photo_${index}.jpg`,
          type: "image/jpeg", // hoặc image/png nếu cần
        });
      });

      // Debug: liệt kê entries của FormData (sẽ in [object Object] cho file)
      console.log("🧾 FormData entries:");
      try {
        for (const pair of formData.entries()) {
          console.log("->", pair[0], pair[1]);
        }
      } catch (e) {
        console.log(
          "Không thể iterate FormData entries (runtime may not allow)."
        );
      }

      // Gửi
      const response = await apiPostForm("/api/owner/venues", formData);

      // Kiểm tra kết quả
      if (response && response._id) {
        Alert.alert("✅ Thành công", "Tạo sân + ảnh thành công!");
        navigation.goBack();
      } else {
        throw new Error(response?.message || "Tạo sân thất bại");
      }
    } catch (err) {
      console.error("❌ LỖI TẠO SÂN:", err);
      Alert.alert(
        "Lỗi",
        err.message || "Lỗi kết nối hoặc dữ liệu không hợp lệ!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm sân mới</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          style={styles.input}
          placeholder="Tên sân *"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ"
          value={address}
          onChangeText={setAddress}
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          placeholder="Khu vực *"
          value={area}
          onChangeText={setArea}
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#9CA3AF"
        />

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowPicker("open")}
          >
            <Text style={styles.timeButtonText}>🕓 Mở: {open}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowPicker("close")}
          >
            <Text style={styles.timeButtonText}>🕘 Đóng: {close}</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={showPicker === "open" ? parseTime(open) : parseTime(close)}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity style={styles.buttonOutline} onPress={pickImages}>
          <Text style={styles.buttonOutlineText}>📷 Chọn ảnh</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageContainer}
        >
          {images.map((uri, i) => (
            <View key={uri + i} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeImage(uri)}
              >
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.label}>📍 Chọn vị trí trên bản đồ</Text>
        <View style={styles.mapContainer}>
          <MapView style={styles.map} region={region} onPress={handleMapPress}>
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coordinates[1],
                  longitude: location.coordinates[0],
                }}
              />
            )}
          </MapView>
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={handleGetLocation}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Lấy vị trí</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Đang tạo..." : "Tạo sân"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#40B800" />
          <Text style={{ color: "#40B800", marginTop: 10 }}>
            Đang tạo sân...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerBar: {
    backgroundColor: "#40B800",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  backButton: { paddingRight: 10 },
  formContainer: { padding: 16, paddingBottom: 32 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginVertical: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 12,
    fontSize: 16,
    color: "#111827",
  },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  timeButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  timeButtonText: { color: "#111827", fontWeight: "500", fontSize: 16 },
  button: {
    backgroundColor: "#40B800",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: "#40B800",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 12,
  },
  buttonOutlineText: { color: "#40B800", fontWeight: "600", fontSize: 16 },
  cancelText: { textAlign: "center", color: "#6B7280", marginTop: 16 },
  imageContainer: { paddingVertical: 4, gap: 10 },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  imageWrapper: { position: "relative" },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  removeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  mapContainer: {
    height: 240,
    marginVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  map: { flex: 1 },
  locationBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#40B800",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    elevation: 20,
  },
  buttonDisabled: { backgroundColor: "#A5D6A7" },
});
