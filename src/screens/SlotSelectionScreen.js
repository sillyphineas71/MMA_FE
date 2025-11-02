import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { API_BASE, apiPost, apiGet } from "../config/api";
import { palette, spacing, radius } from "../theme/theme";

export default function SlotSelectionScreen({ route, navigation }) {
  const { id } = route.params; // subPitchId
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentHoldId, setCurrentHoldId] = useState(null);

  const formattedDate = date.toLocaleDateString("en-CA"); // YYYY-MM-DD

  // 🛰️ Load danh sách slot
  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/api/sub-pitches/${id}/slots?date=${formattedDate}`
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const normalized = (data.available || []).map((s) => {
  let status = "available";

  if (s.booked || s.paymentResult === "success") {
    status = "booked"; // 🔴
  } else if (
    s.held &&
    (s.paymentResult === "pending" || s.paymentResult === "fail")
  ) {
    status = "hold"; // 🟡 Giữ vàng cho pending/fail
  }
  
  return {
    ...s,
    status,
    paymentResult: s.paymentResult || null,
    holdId: s._id || null,
  };
});
    
    // Cập nhật toàn bộ slots
    setSlots(normalized);

    // Đồng bộ lại selectedSlot nếu đang giữ holdId
    if (currentHoldId) {
      const updated = normalized.find((s) => s.holdId === currentHoldId);
      if (updated) {
        setSelectedSlot(updated);
      }
    }
      setSlots(normalized);
    } catch (err) {
      console.error("🚨 Fetch slots error:", err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [formattedDate]);



useFocusEffect(
  useCallback(() => {
    // Load lại slot mỗi khi màn hình được focus
    fetchSlots();
  }, [])
);


// AUTO REFRESH khi nhận deep link payment-success từ VNPay
useEffect(() => {
  const handleDeepLink = (event) => {
    const { path, queryParams } = Linking.parse(event.url || "");
    console.log("📩 Deep link received:", path, queryParams);
    if (path?.includes("payment-success")) {
      Alert.alert("🎉 Thanh toán thành công!", "Đang cập nhật sân...");
      fetchSlots(); 
      
    }
  };

  // Lắng nghe deep link khi app đang mở
  const subscription = Linking.addEventListener("url", handleDeepLink);

  // Kiểm tra URL khởi tạo khi app vừa mở (trường hợp quay lại từ VNPay)
  (async () => {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      const { path, queryParams } = Linking.parse(initialUrl);
      console.log("App opened with deep link:", path, queryParams);
      if (path?.includes("payment-success")) {
        Alert.alert("🎉 Thanh toán thành công!", "Đang cập nhật sân...");
        fetchSlots();
      }
    }
  })();

  return () => {
    subscription.remove();
  };
}, []);

// AUTO REFRESH khi quay lại màn hình (ví dụ back từ trang khác)
useEffect(() => {
  const checkBookedSlots = async () => {
    try {
      const res = await apiGet("/api/bookings/check-latest-booked");
      if (res?.bookedHolds?.length > 0) {
        console.log("🎉 Có sân mới booked:", res.bookedHolds);
        await fetchSlots();
      }
    } catch (e) {
      console.log("Không có sân mới booked");
    }
  };

  const unsubscribe = navigation.addListener("focus", checkBookedSlots);
  return unsubscribe;
}, [navigation]);

// Gọi fetchSlots khi component mount (đảm bảo load ban đầu)
useEffect(() => {
  fetchSlots();
}, []);

useEffect(() => {
  if (!currentHoldId) return; // ⚡ chỉ auto-refresh khi đang giữ slot cụ thể

  let intervalId;

  const startAutoRefresh = () => {
    intervalId = setInterval(async () => {
      console.log("🔄 Auto refreshing slots (theo holdId)...");

      try {
        const res = await fetch(`${API_BASE}/api/sub-pitches/${id}/slots?date=${formattedDate}`);
        const data = await res.json();

        const normalized = (data.available || []).map((s) => ({
          ...s,
          status: s.booked ? "booked" : s.held ? "hold" : "available",
          paymentResult: s.paymentResult || null,
          holdId: s._id || null,
        }));

        setSlots(normalized);

        // 👉 Lấy slot mà người dùng đang giữ
        const currentSlot = normalized.find((s) => s.holdId === currentHoldId);

        if (!currentSlot) {
          console.log("⚠️ Slot đã bị xóa hoặc hết hạn (Mongo TTL)");
          clearInterval(intervalId);
          return;
        }

        // Chỉ xử lý slot của mình thôi
        const { status, paymentResult } = currentSlot;

        // Thành công (kể cả lần thanh toán lại)
if (status === "booked" || paymentResult === "success") {
  console.log("🎉 Slot thanh toán thành công — refresh 1 lần rồi dừng");
  await fetchSlots();
  clearInterval(intervalId);
  return;
}

// Thất bại hoặc hủy
if (paymentResult === "fail") {
  console.log("❌ Thanh toán thất bại/hủy — giữ vàng, dừng refresh");
  clearInterval(intervalId);
  return;
}

// Chưa thanh toán (pending)
if (status === "hold" && paymentResult === "pending") {
  console.log("⏳ Chưa thanh toán — giữ vàng, đợi TTL 10p rồi auto xanh");
  clearInterval(intervalId);
  return;
}


      } catch (err) {
        console.error("🚨 Lỗi auto refresh:", err);
      }
    }, 5000);
  };

  startAutoRefresh();
  
  return () => clearInterval(intervalId);
}, [currentHoldId, selectedSlot?.paymentResult]); // chỉ chạy khi người dùng giữ chỗ mới






  // ⚡ Giữ slot (màu vàng)
  const holdSlot = async (slot) => {
    try {
      const res = await apiPost("/api/holds", {
        subPitchId: id,
        date: formattedDate,
        slotIndex: slot.slotIndex,
      });

      const holdId = res.hold?._id;
      if (!holdId) throw new Error("Không có holdId từ BE");

      setSelectedSlot({ ...slot, status: "pending", holdId });
      setCurrentHoldId(holdId);

      Alert.alert("🟡 Đã giữ chỗ", "Vui lòng thanh toán trong 10 phút!");
      fetchSlots();
    } catch (err) {
      console.error("❌ Hold slot error:", err);
      Alert.alert("❌ Giữ chỗ thất bại", "Khung giờ đã được giữ hoặc lỗi hệ thống.");
    }
  };

  // 💳 Thanh toán VNPay
  const payForSlot = async () => {
    try {
      if (!currentHoldId) {
        Alert.alert("⚠️ Thiếu thông tin", "Không tìm thấy mã giữ chỗ (holdId).");
        return;
      }

      console.log("🟡 Gọi API tạo thanh toán với holdId:", currentHoldId);

      const res = await apiPost("/api/vnpay/create", {
        holdId: currentHoldId,
        amount: selectedSlot?.price || 0,
      });

      const paymentUrl = res.paymentUrl;
      console.log("🔗 URL trả về:", paymentUrl);
      if (!paymentUrl) {
        Alert.alert("Lỗi", "Không nhận được link thanh toán!");
        return;
      }

      const canOpen = await Linking.canOpenURL(paymentUrl);
      if (canOpen) {
        await Linking.openURL(paymentUrl);
      } else {
        Alert.alert(
          "⚠️ Không thể mở link!",
          "Copy thủ công vào trình duyệt:\n" + paymentUrl
        );
      }
    } catch (err) {
      console.error("❌ payForSlot error:", err);
      Alert.alert("Lỗi", "Không thể mở trang thanh toán!");
    }
  };

  return (
    <ScrollView style={styles.container}>

      
      <Text style={styles.title}>Chọn ngày đặt sân</Text>

      {/* 🗓️ Chọn ngày */}
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>📅 {formattedDate}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            if (event.type === "dismissed") {
              setShowPicker(false);
              return;
            }
            if (selectedDate) {
              if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
                Alert.alert("⚠️ Không hợp lệ", "Không thể chọn ngày quá khứ!");
              } else {
                setDate(selectedDate);
              }
              setShowPicker(false);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.grid}>
          {slots.length === 0 ? (
            <Text style={styles.noSlot}>Không có khung giờ khả dụng</Text>
          ) : (
            slots.map((slot) => {
              let bgStyle = styles.slotAvailable;

              if (slot.status === "hold") bgStyle = styles.slotPending;
              else if (slot.status === "booked") bgStyle = styles.slotBooked;

              return (
                <TouchableOpacity
                  key={slot.slotIndex}
                  style={[styles.slot, bgStyle]}
                  disabled={slot.status === "booked"}
                  onPress={() => {
                    if (slot.status === "available") holdSlot(slot);
                    if (slot.status === "pending" || slot.status === "hold") {
                    setSelectedSlot(slot);
                    setCurrentHoldId(slot.holdId || slot._id); // 👈 khôi phục holdId nếu mất
                  }
                  }}
                >
                  <Text style={styles.slotText}>
                    ⏰ {slot.start} - {slot.end} {"\n"}💰 {slot.price.toLocaleString()}đ
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}

      {/* 💳 Nút thanh toán khi có pending */}
      {selectedSlot &&
  selectedSlot.status === "hold" &&
  selectedSlot.paymentResult !== "success" &&
  (selectedSlot.paymentResult === "pending" ||
    selectedSlot.paymentResult === "fail") && (
    <TouchableOpacity style={styles.bookBtn} onPress={payForSlot}>
      <Text style={styles.bookText}>
        💳 {selectedSlot.paymentResult === "fail" ? "Thanh toán lại" : "Thanh toán qua VNPay"}
      </Text>
    </TouchableOpacity>
)}



    </ScrollView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg || "#F5F7FA",
    padding: spacing.lg || 16,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: spacing.md || 12,
    textAlign: "center",
  },
  dateButton: {
    backgroundColor: palette.card || "#FFF",
    padding: spacing.md || 12,
    borderRadius: radius.md || 10,
    alignItems: "center",
    marginBottom: spacing.lg || 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dateText: { fontWeight: "600", color: palette.text || "#333" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  slot: {
    width: "47%",
    paddingVertical: spacing.md || 12,
    marginBottom: spacing.sm || 8,
    borderRadius: radius.md || 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  slotAvailable: { backgroundColor: "#4CAF50" },
  slotPending: { backgroundColor: "#FFB300" },
  slotBooked: { backgroundColor: "#E53935" },
  slotText: {
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  bookBtn: {
    backgroundColor: "#1976D2",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
    alignItems: "center",
  },
  bookText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  noSlot: {
    textAlign: "center",
    color: palette.sub || "#888",
    width: "100%",
    marginTop: 20,
  },
});
