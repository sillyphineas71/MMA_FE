import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";

export default function PaymentFailScreen() {
  const navigation = useNavigation();
  const [params, setParams] = useState({ subPitchId: null });

  // Lấy params từ deep link (Expo Go hoặc app đang mở)
  useEffect(() => {
    const handleDeepLink = (event) => {
      console.log("📦 Deep link URL (fail):", event.url);
      const { queryParams } = Linking.parse(event.url);
      console.log("📦 Query params (fail):", queryParams);
      setParams({
        subPitchId: queryParams.subPitchId,
      });
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Nếu app được mở từ deep link ban đầu
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  if (!params.subPitchId)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#ef4444" />
        <Text>Đang lấy thông tin giao dịch...</Text>
      </View>
    );

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fee2e2",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#dc2626" }}>
        ❌ Thanh toán thất bại
      </Text>

      <Text style={{ marginTop: 10, color: "#555", textAlign: "center" }}>
        Giao dịch không thành công hoặc bị hủy.  
        Vui lòng thử lại thanh toán hoặc chọn khung giờ khác.
      </Text>

      <ActivityIndicator size="large" color="#ef4444" style={{ marginTop: 20 }} />

      <Button
        title="🔙 Quay lại trang đặt sân"
        color="#b91c1c"
        onPress={() =>
          navigation.replace("SlotSelection", { id: params.subPitchId })
        }
      />
    </View>
  );
}
