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
import OwnerCalendarScreen from "./src/screens/OwnerCalendarScreen";
import HomeDashboardScreen from "./src/screens/HomeDashboardScreen";
import OwnerVenueListScreen from "./src/screens/OwnerVenueListScreen";
import OwnerVenueCreateScreen from "./src/screens/OwnerVenueCreateScreen";
import OwnerVenueEditScreen from "./src/screens/OwnerVenueEditScreen";
import OwnerSubPitchListScreen from "./src/screens/OwnerSubPitchListScreen";
import OwnerSubPitchCreateScreen from "./src/screens/OwnerSubPitchCreateScreen";
import OwnerSubPitchEditScreen from "./src/screens/OwnerSubPitchEditScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
        <Stack.Screen
          name="OwnerCalendar"
          component={OwnerCalendarScreen}
          options={{ headerShown: true, title: "Lịch chủ sân" }}
        />
        <Stack.Screen name="Dashboard" component={HomeDashboardScreen} />
        {/* ===== Owner flow ===== */}
        <Stack.Screen
          name="OwnerVenueList"
          component={OwnerVenueListScreen}
          options={{ headerShown: true, title: "Quản lý sân" }}
        />
        <Stack.Screen name="OwnerVenueCreate" component={OwnerVenueCreateScreen} />
        <Stack.Screen name="OwnerVenueEdit" component={OwnerVenueEditScreen} />
        {/* 3. THÊM 3 MÀN HÌNH MỚI (Màn 4) VÀO ĐÂY */}
        <Stack.Screen
          name="OwnerSubPitchList" // Đây chính là tên đang bị thiếu
          component={OwnerSubPitchListScreen}
          options={{ headerShown: false }} // Đã có header riêng
        />
        <Stack.Screen
          name="OwnerSubPitchCreate"
          component={OwnerSubPitchCreateScreen}
          options={{ headerShown: false }} // Đã có header riêng
        />
        <Stack.Screen
          name="OwnerSubPitchEdit"
          component={OwnerSubPitchEditScreen}
          options={{ headerShown: false }} // Đã có header riêng
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
