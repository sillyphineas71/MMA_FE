import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
// THÊM IMPORT MỚI
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// GIỮ NGUYÊN STACK NAVIGATOR
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { palette } from "./src/theme/theme";
import { Feather } from "@expo/vector-icons";

// Import các màn hình
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import AdminDashboardScreen from "./src/screens/AdminDashboardScreen";
import OwnerDashboardScreen from "./src/screens/OwnerDashboardScreen";
// THÊM 2 MÀN HÌNH RÚT TIỀN
import WithdrawalOwnerScreen from "./src/screens/WithdrawalOwnerScreen";
import WithdrawalAdminScreen from "./src/screens/WithdrawalAdminScreen";

// Khởi tạo cả hai navigator
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack cho người dùng CHƯA đăng nhập (Không thay đổi)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Stack cho người dùng ĐÃ đăng nhập (BÂY GIỜ LÀ TAB NAVIGATOR)
function AppStack() {
  const { user, signOut } = useAuth(); // Lấy thông tin user và hàm signOut

  // Nút đăng xuất (Vẫn dùng chung)
  const SignOutButton = () => (
    <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
      <Feather name="log-out" size={20} color={palette.primaryDark} />
    </TouchableOpacity>
  );

  // Tùy chọn chung cho các màn hình trong Tab
  const screenOptions = {
    headerRight: SignOutButton,
    headerStyle: { backgroundColor: palette.card },
    headerTitleStyle: { fontWeight: "700" },
    headerShadowVisible: false, // Bỏ bóng gạch dưới header
    tabBarActiveTintColor: palette.primaryDark,
    tabBarInactiveTintColor: palette.sub,
    tabBarStyle: { 
      backgroundColor: palette.card, 
      borderTopWidth: 0,
      elevation: 10, // Shadow cho Android
      shadowColor: '#000', // Shadow cho iOS
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
  };

  return (
    // Dùng Tab.Navigator làm gốc
    <Tab.Navigator screenOptions={screenOptions}>
      {user?.role === "admin" ? 
      
        // ===================

        // === LUỒNG CỦA ADMIN ===
        <>
          <Tab.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color, size }) => (
                <Feather name="grid" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="WithdrawalAdmin"
            component={WithdrawalAdminScreen}
            options={{
              title: "Quản lý Rút tiền",
              tabBarIcon: ({ color, size }) => (
                <Feather name="dollar-sign" size={size} color={color} />
              ),
            }}
          />
        </>
      : 
        // === LUỒNG CỦA OWNER ===
        <>
          <Tab.Screen
            name="OwnerDashboard"
            component={OwnerDashboardScreen}
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color, size }) => (
                <Feather name="grid" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="WithdrawalOwner"
            component={WithdrawalOwnerScreen}
            options={{
              title: "Quản lý Rút tiền",
              tabBarIcon: ({ color, size }) => (
                <Feather name="dollar-sign" size={size} color={color} />
              ),
            }}
          />
        </>
      }
    </Tab.Navigator>
  );
}

// Component điều hướng chính (Không thay đổi)
function RootNavigator() {
  const { user } = useAuth(); // Lấy user từ context

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// App chính (Không thay đổi)
export default function App() {
  return (
    // Bọc toàn bộ ứng dụng trong AuthProvider
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    marginRight: 15,
    padding: 5,
  },
});

