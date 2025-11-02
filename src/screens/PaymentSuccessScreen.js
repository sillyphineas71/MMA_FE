import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { apiPost } from "../config/api";

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const [params, setParams] = useState({ holdId: null, subPitchId: null });

    // 🧩 Lấy params từ deep link (Expo Go) — hỗ trợ cả khi app đang mở sẵn
  useEffect(() => {
    const handleDeepLink = (event) => {
      console.log("📦 Deep link URL:", event.url);
      const { queryParams } = Linking.parse(event.url);
      console.log("📦 Query params:", queryParams);
      setParams({
        holdId: queryParams.holdId,
        subPitchId: queryParams.subPitchId,
      });
    };

  
    const subscription = Linking.addEventListener("url", handleDeepLink);

   
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

   
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const confirmBooking = async () => {
      if (!params.holdId || !params.subPitchId) return;

      try {
        console.log("✅ Gọi API xác nhận thanh toán cho holdId:", params.holdId);
        await apiPost(`/api/bookings/confirm/${params.holdId}`);

        Alert.alert("🎉 Thành công!", "Thanh toán hoàn tất, sân đã được đặt.");
      } catch (err) {
        console.error("❌ Xác nhận thanh toán thất bại:", err);
        Alert.alert("Lỗi", "Không thể xác nhận thanh toán.");
      }
    };

    confirmBooking();
  }, [params]);

  if (!params.holdId)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#22c55e" />
        <Text>Đang lấy thông tin giao dịch...</Text>
      </View>
    );

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#e7fbe7",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#22c55e" }}>
        ✅ Thanh toán thành công!
      </Text>
      <Text style={{ marginTop: 10, color: "#333", textAlign: "center" }}>
        Giao dịch đã hoàn tất, sân đã được xác nhận.
      </Text>
      <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 20 }} />

      <Button
        title="🔙 Quay lại trang đặt sân"
        onPress={() => navigation.replace("SlotSelection", { id: params.subPitchId })}
      />
    </View>
  );
}
