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
// Đảm bảo bạn import cả 2 hàm
import { apiPut, apiPutForm, API_BASE } from "../config/api";
import { Feather } from "@expo/vector-icons";

export default function OwnerVenueEditScreen({ navigation, route }) {
  const { venue } = route.params;

  // --- STATE ---
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState("06:00");
  const [close, setClose] = useState("23:00");
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 10.762622,
    longitude: 106.660172,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [showPicker, setShowPicker] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- EFFECT (Nạp dữ liệu) ---
  useEffect(() => {
    if (venue) {
      setName(venue.name || "");
      setAddress(venue.address || "");
      setArea(venue.area || "");
      setPhone(venue.contact?.phone || "");
      setOpen(venue.hours?.open || "06:00");
      setClose(venue.hours?.close || "23:00");
      setImages(venue.images ? [...venue.images] : []);

      const venueLocation =
        venue.location?.coordinates && venue.location.coordinates.length === 2
          ? venue.location
          : { type: "Point", coordinates: [106.660172, 10.762622] };

      setLocation(venueLocation);
      setRegion({
        latitude: venueLocation.coordinates[1],
        longitude: venueLocation.coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [venue]);

  // --- CÁC HÀM HỖ TRỢ ---

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newUris]);
    }
  };

  const removeImage = (uriToRemove) => {
    setImages((prev) => prev.filter((uri) => uri !== uriToRemove));
  };

  const onTimeChange = (event, selectedDate) => {
    setShowPicker(null);
    if (selectedDate) {
      const timeString = selectedDate.toTimeString().substring(0, 5);
      if (showPicker === "open") setOpen(timeString);
      if (showPicker === "close") setClose(timeString);
    }
  };

  // HÀM DỊCH NGƯỢC TỌA ĐỘ
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
          addr.subregion, // Phường/Xã
          addr.region, // Quận/Huyện
          addr.city, // Tỉnh/Thành phố
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

  // HÀM LẤY VỊ TRÍ
  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Quyền truy cập vị trí bị từ chối.");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    const lat = loc.coords.latitude;
    const lng = loc.coords.longitude;

    setLocation({ type: "Point", coordinates: [lng, lat] });
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    await reverseGeocodeAndUpdateUI(lat, lng); // Gọi hàm dịch ngược
  };

  // HÀM NHẤN BẢN ĐỒ
  const handleMapPress = async (e) => {
    const lat = e.nativeEvent.coordinate.latitude;
    const lng = e.nativeEvent.coordinate.longitude;

    setLocation({ type: "Point", coordinates: [lng, lat] });
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    await reverseGeocodeAndUpdateUI(lat, lng); // Gọi hàm dịch ngược
  };

  // =================================================================
  // === HÀM UPDATE (ĐÃ SỬA LỖI LOGIC GỌI HÀM VÀ FORMDATA) ===
  // =================================================================
  const handleUpdate = async () => {
    if (!name || !area) {
      Alert.alert("Lỗi", "Vui lòng nhập Tên sân và Khu vực.");
      return;
    }
    setLoading(true);

    try {
      const newImages = images.filter((uri) => uri.startsWith("file://"));
      const existingImages = images.filter((uri) => uri.startsWith("http"));
      const hasNewImages = newImages.length > 0;

      let response;

      if (hasNewImages) {
        // ========================================================
        // === TRƯỜNG HỢP 1: CÓ ẢNH MỚI (DÙNG FORMDATA) ===
        // === XÂY DỰNG FORMDATA GIỐNG HỆT POSTMAN (KHÔNG JSON.STRINGIFY) ===
        // ========================================================
        const formData = new FormData();

        formData.append("name", name);
        formData.append("address", address);
        formData.append("area", area);

        // Gửi các object lồng nhau (dùng cú pháp [key])
        if (phone) formData.append("contact[phone]", phone);

        formData.append("hours[open]", open);
        formData.append("hours[close]", close);

        if (location && location.coordinates) {
          formData.append("location[type]", location.type);
          formData.append("location[coordinates][0]", location.coordinates[0]); // Lng
          formData.append("location[coordinates][1]", location.coordinates[1]); // Lat
        }

        // Gửi mảng ảnh cũ (dùng cú pháp "[]")
        existingImages.forEach((imgUrl) => {
          formData.append("existingImages[]", imgUrl);
        });

        // Gửi các file ảnh mới (dùng cú pháp "[]")
        newImages.forEach((uri) => {
          const uriParts = uri.split(".");
          const fileType = uriParts[uriParts.length - 1];
          formData.append("images", {
            // <--- Dùng "images[]"
            uri,
            name: `photo_${Date.now()}.${fileType}`,
            type: `image/${fileType}`,
          });
        });

        // Gọi đúng hàm apiPutForm
        response = await apiPutForm(`/api/owner/venues/${venue._id}`, formData);
      } else {
        // ========================================================
        // === TRƯỜNG HỢP 2: KHÔNG CÓ ẢNH MỚI (DÙNG JSON) ===
        // === GỌI ĐÚNG HÀM apiPut ===
        // ========================================================
        const payload = {
          name,
          address,
          area,
          contact: { phone },
          hours: { open, close },
          location,
          images: existingImages, // Chỉ gửi lại mảng ảnh cũ
        };

        // Phải gọi apiPut (gửi JSON)
        response = await apiPut(`/api/owner/venues/${venue._id}`, payload);
      }

      Alert.alert("✅ Thành công", "Đã cập nhật sân thành công!");
      navigation.goBack();
    } catch (err) {
      const errorMessage =
        err.message || "Không thể cập nhật sân. Vui lòng thử lại.";
      console.error("LỖI CẬP NHẬT SÂN:", err);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- LOADING STATES ---
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <View style={{ width: 28 }} />
          <Text style={styles.headerTitle}>Đang lưu...</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#40B800" />
        </View>
      </SafeAreaView>
    );
  }

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đang tải...</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#40B800" />
        </View>
      </SafeAreaView>
    );
  }

  // --- GIAO DIỆN (JSX) ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật sân</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContainer}
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
            value={new Date()}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity style={styles.buttonOutline} onPress={pickImages}>
          <Text style={styles.buttonOutlineText}>📷 Thêm ảnh</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageContainer}
        >
          {images.map((uri, i) => {
            // --- BẮT ĐẦU LOGIC XỬ LÝ ẢNH AN TOÀN ---
            let displayUri = "https://via.placeholder.com/100x100?text=Error"; // Link dự phòng

            if (uri) {
              if (uri.startsWith("http")) {
                // 1. Link Cloudinary (https://...)
                displayUri = uri;
              } else if (uri.startsWith("file://")) {
                // 2. Link local mới chọn (file:///...)
                displayUri = uri;
              } else if (uri.startsWith("/")) {
                // 3. Link /uploads/ cũ
                displayUri = `${API_BASE}${uri}`;
              }
            }
            // --- KẾT THÚC LOGIC ---

            return (
              <View key={uri || i} style={styles.imageWrapper}>
                <Image
                  source={{ uri: displayUri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeImage(uri)}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>📍 Vị trí sân</Text>
        <View style={styles.mapContainer}>
          <MapView style={styles.map} region={region} onPress={handleMapPress}>
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
            />
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
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLESHEET (Giữ nguyên) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  backButton: {
    paddingRight: 10,
  },
  formContainer: {
    padding: 16,
    paddingBottom: 32,
  },
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
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  timeButtonText: {
    color: "#111827",
    fontWeight: "500",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#40B800",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: "#40B800",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 12,
  },
  buttonOutlineText: {
    color: "#40B800",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 16,
  },
  imageContainer: {
    paddingVertical: 4,
    gap: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  imageWrapper: {
    position: "relative",
  },
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
  removeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  mapContainer: {
    height: 240,
    marginVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  map: {
    flex: 1,
  },
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7", // Màu xanh lá mờ
  },
});
