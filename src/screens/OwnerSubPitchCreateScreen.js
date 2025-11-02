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
  Switch,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { apiPost } from "../config/api";
import { Feather } from "@expo/vector-icons";

// 1. Định nghĩa các loại sân hợp lệ
const PITCH_TYPES = ["5v5", "7v7", "9v9", "11v11"];

export default function OwnerSubPitchCreateScreen({ navigation, route }) {
  const { venueId } = route.params;

  const [name, setName] = useState("");
  const [type, setType] = useState(""); // State để lưu loại sân được chọn
  const [active, setActive] = useState(true);
  const [blocks, setBlocks] = useState([]);

  // State cho Time Picker
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(null); // null, 'start', 'end'

  const handleAddBlock = () => {
    if (!newStart || !newEnd || !newPrice) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập Giờ bắt đầu, Giờ kết thúc và Giá."
      );
      return;
    }
    setBlocks([
      ...blocks,
      { start: newStart, end: newEnd, price: parseInt(newPrice) || 0 },
    ]);
    setNewStart("");
    setNewEnd("");
    setNewPrice("");
  };

  const handleRemoveBlock = (indexToRemove) => {
    setBlocks(blocks.filter((_, index) => index !== indexToRemove));
  };

  const handleCreate = async () => {
    // Cập nhật kiểm tra validation
    if (!name || !type) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên sân và chọn Loại sân.");
      return;
    }
    if (blocks.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng thêm ít nhất một khung giờ.");
      return;
    }

    const bookableBlocks = blocks.map((b) => ({
      start: b.start,
      end: b.end,
      label: `${b.start}-${b.end}`,
    }));

    const blockPrices = blocks.reduce((acc, b) => {
      acc[`${b.start}-${b.end}`] = b.price;
      return acc;
    }, {});

    const payload = {
      venueId,
      name,
      type, // Gửi đi type đã chọn
      active,
      bookableBlocks,
      blockPrices,
    };

    try {
      await apiPost(`/api/owner/venues/${venueId}/sub-pitches`, payload);
      Alert.alert("✅ Thành công", "Đã tạo sân con mới!");
      navigation.goBack();
    } catch (err) {
      console.error(
        "L_ERROR_RESPONSE_DATA:",
        JSON.stringify(err.response?.data, null, 2)
      );
      const errorMessage =
        err.response?.data?.message || err.message || "Không thể tạo sân con.";
      Alert.alert("Lỗi", errorMessage);
    }
  };

  const onTimeChange = (event, selectedDate) => {
    const mode = showTimePicker;
    setShowTimePicker(null);

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    const hh = selectedDate.getHours().toString().padStart(2, "0");
    const mm = selectedDate.getMinutes().toString().padStart(2, "0");
    const timeString = `${hh}:${mm}`;

    if (mode === "start") {
      setNewStart(timeString);
    } else if (mode === "end") {
      setNewEnd(timeString);
    }
  };

  const getPickerTime = () => {
    const now = new Date();
    const timeToParse = showTimePicker === "start" ? newStart : newEnd;

    if (timeToParse) {
      const [hours, minutes] = timeToParse.split(":");
      now.setHours(parseInt(hours, 10));
      now.setMinutes(parseInt(minutes, 10));
    }
    return now;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm sân con</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContainer}
      >
        <Text style={styles.label}>Thông tin cơ bản</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên sân (Sân 1, Sân 2...)"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9CA3AF"
        />

        {/* 2. Thay thế TextInput bằng Bộ chọn Type */}
        <Text style={styles.label}>Loại sân *</Text>
        <View style={styles.typeContainer}>
          {PITCH_TYPES.map((pitchType) => (
            <TouchableOpacity
              key={pitchType}
              style={[
                styles.typeButton,
                type === pitchType && styles.typeButtonActive,
              ]}
              onPress={() => setType(pitchType)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === pitchType && styles.typeButtonTextActive,
                ]}
              >
                {pitchType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Trạng thái hoạt động</Text>
          <Switch
            trackColor={{ false: "#E5E7EB", true: "#86EFAC" }}
            thumbColor={active ? "#40B800" : "#F3F4F6"}
            onValueChange={setActive}
            value={active}
          />
        </View>

        <Text style={styles.label}>Khung giờ và giá</Text>
        <View style={styles.addBlockContainer}>
          <View style={styles.timeRow}>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setShowTimePicker("start")}
            >
              <Text
                style={[
                  styles.timePickerText,
                  !newStart && styles.timePickerPlaceholder,
                ]}
              >
                {newStart || "Giờ bắt đầu"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setShowTimePicker("end")}
            >
              <Text
                style={[
                  styles.timePickerText,
                  !newEnd && styles.timePickerPlaceholder,
                ]}
              >
                {newEnd || "Giờ kết thúc"}
              </Text>
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={getPickerTime()}
              mode="time"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Giá (VD: 200000)"
            value={newPrice}
            onChangeText={setNewPrice}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={handleAddBlock}
          >
            <Text style={styles.buttonOutlineText}>+ Thêm khung giờ</Text>
          </TouchableOpacity>
        </View>

        {blocks.map((block, index) => (
          <View key={index} style={styles.blockItem}>
            <View>
              <Text style={styles.blockTime}>
                Khung: {block.start} - {block.end}
              </Text>
              <Text style={styles.blockPrice}>
                Giá: {block.price.toLocaleString("vi-VN")} VNĐ
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveBlock(index)}>
              <Feather name="x-circle" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Tạo sân con</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// 3. StyleSheet SẠCH (đã xoá ký tự lạ)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  backButton: { paddingRight: 10 },
  formContainer: { padding: 16, paddingBottom: 32 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginVertical: 8,
    marginTop: 10,
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
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  typeButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  typeButtonActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#40B800",
  },
  typeButtonText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: "#40B800",
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  addBlockContainer: {
    padding: 12,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  timeRow: { flexDirection: "row", gap: 12 },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 12,
    justifyContent: "center",
  },
  timePickerText: {
    fontSize: 16,
    color: "#111827",
  },
  timePickerPlaceholder: {
    color: "#9CA3AF",
  },
  button: {
    backgroundColor: "#40B800",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: "#40B800",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 4,
  },
  buttonOutlineText: { color: "#40B800", fontWeight: "600", fontSize: 16 },
  blockItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    marginBottom: 8,
  },
  blockTime: { fontSize: 16, fontWeight: "500", color: "#111827" },
  blockPrice: { fontSize: 14, color: "#6B7280" },
});
