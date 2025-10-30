import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

// 🔐 Auth context
import { AuthProvider, useAuth } from "./src/context/AuthContext";

// 🎨 Theme
import { palette } from "./src/theme/theme";

// ==========================
// 🧩 Screens import
// ==========================

// Auth flow
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

// Admin / Owner dashboards
import AdminStack from "./src/navigation/AdminStack";
import OwnerDashboardScreen from "./src/screens/OwnerDashboardScreen";

// Booking flow
import HomeScreen from "./src/screens/HomeScreen";
import VenueDetailScreen from "./src/screens/VenueDetailScreen";
import SlotSelectionScreen from "./src/screens/SlotSelectionScreen";
import OwnerCalendarScreen from "./src/screens/OwnerCalendarScreen";
import HomeDashboardScreen from "./src/screens/HomeDashboardScreen";

const Stack = createNativeStackNavigator();

// ---------------------------------
// Stack cho người dùng CHƯA đăng nhập
// ---------------------------------
function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ---------------------------------
// Stack cho người dùng ĐÃ đăng nhập
// (phụ thuộc role: admin / owner)
// ---------------------------------
function AppStack() {
  const { user, signOut } = useAuth();

  // nút logout hiển thị trên headerRight
  const SignOutButton = () => (
    <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
      <Feather name="log-out" size={20} color={palette.primaryDark} />
    </TouchableOpacity>
  );

  // Nếu admin → dùng bottom tabs AdminStack
  if (user?.role === "admin") {
    return <AdminStack />;
  }

  // Còn lại coi như chủ sân / khách đặt sân
  return (
    <Stack.Navigator
      initialRouteName={user?.role === "owner" ? "OwnerDashboard" : "Home"}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* Owner tổng quan */}
      <Stack.Screen
        name="OwnerDashboard"
        component={OwnerDashboardScreen}
        options={{
          headerShown: true,
          title: "Owner Dashboard",
          headerRight: SignOutButton,
        }}
      />

      {/* Trang home cho người dùng đặt sân */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
          title: "Danh sách sân",
          headerRight: SignOutButton,
        }}
      />

      {/* Chi tiết sân */}
      <Stack.Screen
        name="VenueDetail"
        component={VenueDetailScreen}
        options={{
          headerShown: true,
          title: "Chi tiết sân",
          headerRight: SignOutButton,
        }}
      />

      {/* Chọn khung giờ */}
      <Stack.Screen
        name="SlotSelection"
        component={SlotSelectionScreen}
        options={{
          headerShown: true,
          title: "Chọn khung giờ",
          headerRight: SignOutButton,
        }}
      />

      {/* Lịch của chủ sân */}
      <Stack.Screen
        name="OwnerCalendar"
        component={OwnerCalendarScreen}
        options={{
          headerShown: true,
          title: "Lịch chủ sân",
          headerRight: SignOutButton,
        }}
      />

      {/* Dashboard tổng hợp / home sau login */}
      <Stack.Screen
        name="Dashboard"
        component={HomeDashboardScreen}
        options={{
          headerShown: true,
          title: "Tổng quan",
          headerRight: SignOutButton,
        }}
      />
    </Stack.Navigator>
  );
}

// ---------------------------------
// RootNavigator: chọn stack dựa trên user login hay chưa
// ---------------------------------
function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// ---------------------------------
// App gốc: wrap bằng AuthProvider
// ---------------------------------
export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

// ---------------------------------
// Styles
// ---------------------------------
const styles = StyleSheet.create({
  signOutButton: {
    marginRight: 15,
    padding: 5,
  },
});
