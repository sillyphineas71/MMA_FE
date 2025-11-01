import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 🧩 Auth Screens
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen2";

// ⚽ Booking Screens
import HomeScreen from "./src/screens/HomeScreen";
import VenueDetailScreen from "./src/screens/VenueDetailScreen";
import SlotSelectionScreen from "./src/screens/SlotSelectionScreen";
import HomeDashboardScreen from "./src/screens/HomeDashboardScreen";

// 💳 Payment Screens
import PaymentSuccessScreen from "./src/screens/PaymentSuccessScreen";
import PaymentFailScreen from "./src/screens/PaymentFailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer
      linking={{
        // Thêm deep link exp:// để app nhận redirect từ backend sau OTP
        prefixes: [
          "exp://192.168.68.2:8081/--", // đúng cổng 8081 (Expo Go web dev)
          "exp://192.168.68.2:19000/--", // dự phòng cổng dev Metro
          // (tuỳ chọn) nếu vẫn muốn thử theo http, đảm bảo IP trùng FE_BASE cũ
          "http://192.168.68.2:8081",
          "http://192.168.68.2:8081/#",
          // local dev trên iOS simulator
          "http://localhost:8081",
          "http://localhost:8081/#",
        ],
        config: {
          screens: {
            Login: "login",
            Register: "register",
            Home: "home",
            VenueDetail: "venue/:id",
            SlotSelection: "slot/:id",
            PaymentSuccess: "payment-success",
            PaymentFail: "payment-fail",
          },
        },
      }}
    >
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {/* ===== Auth flow ===== */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* ===== Booking flow ===== */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: true, title: "Danh sách sân" }}
        />
        <Stack.Screen
          name="VenueDetail"
          component={VenueDetailScreen}
          options={{ headerShown: true, title: "Chi tiết sân" }}
        />
        <Stack.Screen
          name="SlotSelection"
          component={SlotSelectionScreen}
          options={{ headerShown: true, title: "Chọn khung giờ" }}
        />
        <Stack.Screen name="Dashboard" component={HomeDashboardScreen} />

        {/* ===== Payment flow ===== */}
        <Stack.Screen
          name="PaymentSuccess"
          component={PaymentSuccessScreen}
          options={{ headerShown: true, title: "Thanh toán thành công" }}
        />
        <Stack.Screen
          name="PaymentFail"
          component={PaymentFailScreen}
          options={{ headerShown: true, title: "Thanh toán thất bại" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
