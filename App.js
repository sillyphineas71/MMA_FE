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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
