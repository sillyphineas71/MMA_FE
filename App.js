import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { palette } from "./src/theme/theme";

// Import các màn hình
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import AdminDashboardScreen from "./src/screens/AdminDashboardScreen";
import OwnerDashboardScreen from "./src/screens/OwnerDashboardScreen";
import { Feather } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();

// Stack cho người dùng CHƯA đăng nhập
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Stack cho người dùng ĐÃ đăng nhập (Dựa trên role)
function AppStack() {
  const { user, signOut } = useAuth(); // Lấy thông tin user và hàm signOut

  // Nút đăng xuất
  const SignOutButton = () => (
    <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
      <Feather name="log-out" size={20} color={palette.primaryDark} />
    </TouchableOpacity>
  );

  return (
    <Stack.Navigator>
      {user?.role === "admin" ? (
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            title: "Admin Dashboard",
            headerRight: SignOutButton,
          }}
        />
      ) : (
        // Mặc định là Owner nếu không phải Admin
        <Stack.Screen
          name="OwnerDashboard"
          component={OwnerDashboardScreen}
          options={{
            title: "Owner Dashboard",
            headerRight: SignOutButton,
          }}
        />
      )}
    </Stack.Navigator>
  );
}

// Component điều hướng chính
function RootNavigator() {
  const { user } = useAuth(); // Lấy user từ context

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// App chính
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