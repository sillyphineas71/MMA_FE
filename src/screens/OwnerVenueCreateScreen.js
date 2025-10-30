import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ScrollView,
    Image,
    Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import { apiPost, apiPostForm } from "../config/api";
import { Feather } from "@expo/vector-icons";

export default function OwnerVenueCreateScreen({ navigation }) {
    // ... (Logic state và các hàm giữ nguyên) ...
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [area, setArea] = useState("");
    const [phone, setPhone] = useState("");
    const [open, setOpen] = useState("06:00");
    const [close, setClose] = useState("23:00");
    const [showPicker, setShowPicker] = useState(null);
    const [images, setImages] = useState([]);
    const [location, setLocation] = useState(null);
    const [region, setRegion] = useState({ latitude: 10.762622, longitude: 106.660172, latitudeDelta: 0.01, longitudeDelta: 0.01 });

    const pickImages = async () => { /* ... giữ nguyên ... */ };
    const removeImage = (uri) => { /* ... giữ nguyên ... */ };
    const handleGetLocation = async () => { /* ... giữ nguyên ... */ };
    const handleMapPress = async (e) => { /* ... giữ nguyên ... */ };
    const onTimeChange = (event, selectedDate) => { /* ... giữ nguyên ... */ };
    const handleCreate = async () => { /* ... giữ nguyên ... */ };

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Header Bar mới */}
            <View style={styles.headerBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thêm sân mới</Text>
                {/* Thêm 1 View trống để căn giữa title chuẩn hơn */}
                <View style={{ width: 28 }} />
            </View>

            {/* 2. Form cuộn với padding (lùi vào lề) */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContainer}
            >
                <TextInput style={styles.input} placeholder="Tên sân *" value={name} onChangeText={setName} placeholderTextColor="#9CA3AF" />
                <TextInput style={styles.input} placeholder="Địa chỉ" value={address} onChangeText={setAddress} placeholderTextColor="#9CA3AF" />
                <TextInput style={styles.input} placeholder="Khu vực *" value={area} onChangeText={setArea} placeholderTextColor="#9CA3AF" />
                <TextInput style={styles.input} placeholder="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />

                <View style={styles.row}>
                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowPicker("open")}>
                        <Text style={styles.timeButtonText}>🕓 Mở: {open}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowPicker("close")}>
                        <Text style={styles.timeButtonText}>🕘 Đóng: {close}</Text>
                    </TouchableOpacity>
                </View>

                {showPicker && (
                    <DateTimePicker value={new Date()} mode="time" is24Hour display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onTimeChange} />
                )}

                <TouchableOpacity style={styles.buttonOutline} onPress={pickImages}>
                    <Text style={styles.buttonOutlineText}>📷 Chọn ảnh</Text>
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageContainer}>
                    {images.map((uri, i) => (
                        <View key={i} style={styles.imageWrapper}>
                            <Image source={{ uri }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(uri)}><Text style={styles.removeText}>✕</Text></TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                <Text style={styles.label}>📍 Chọn vị trí trên bản đồ</Text>
                <View style={styles.mapContainer}>
                    <MapView style={styles.map} region={region} onPress={handleMapPress}>
                        {location && <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />}
                    </MapView>
                    <TouchableOpacity style={styles.locationBtn} onPress={handleGetLocation}><Text style={{ color: "#fff", fontWeight: "700" }}>Lấy vị trí</Text></TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleCreate}><Text style={styles.buttonText}>Tạo sân</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.cancelText}>Hủy</Text></TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// 3. StyleSheet đã cập nhật
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        // Bỏ padding ở đây
    },
    // Style mới cho Header Bar
    headerBar: {
        backgroundColor: "#40B800",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between", // Căn 2 bên
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
    // Style mới cho Form (lùi vào lề)
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
});