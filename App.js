import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import {
  NavigationContainer,
  CommonActions,
  useNavigation,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Auth context
import { AuthProvider, useAuth } from "./src/context/AuthContext";

// 🎨 Theme
import { palette } from "./src/theme/theme";

// 🔑 Auth flow screens
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen2";
import VerifyEmailScreen from "./src/screens/VerifyEmailScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";

// Admin & Owner stacks
import AdminStack from "./src/navigation/AdminStack";
import OwnerStack from "./src/navigation/OwnerStack";

// Booking flow (Customer)
import HomeScreen from "./src/screens/HomeScreen";
import VenueDetailScreen from "./src/screens/VenueDetailScreen";
import SlotSelectionScreen from "./src/screens/SlotSelectionScreen";
import HomeDashboardScreen from "./src/screens/HomeDashboardScreen";

// Payment Screens
import PaymentSuccessScreen from "./src/screens/PaymentSuccessScreen";
import PaymentFailScreen from "./src/screens/PaymentFailScreen";
import HistoryBookingScreen from "./src/screens/HistoryBookingScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AboutUsScreen from "./src/screens/AboutUsScreen";
import ContactUsScreen from "./src/screens/ContactUsScreen";

// NEW: Import FeedbackScreen
import FeedbackScreen from "./src/screens/FeedbackScreen";

const Stack = createNativeStackNavigator();

// AUTH STACK (Login, Register, Forgot Password, v.v.)

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

// APP STACK (sau khi login thành công)
function AppStack() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();

  //  Đăng xuất và reset toàn bộ navigation về Login
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("SignOut error:", err);
    }
  };

  const SignOutButton = () => (
    <TouchableOpacity
      onPress={handleSignOut}
      activeOpacity={0.85}
      style={styles.signOutButton}
    >
      <Feather name="log-out" size={18} color={palette.primaryDark} />
    </TouchableOpacity>
  );

  //  Tùy vai trò người dùng
  if (user?.role === "admin") return <AdminStack />;
  if (user?.role === "owner") return <OwnerStack />;

  //  Flow cho khách hàng
  return (
    <Stack.Navigator
      initialRouteName="HomeDashboard"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: "Hồ sơ",
          headerRight: SignOutButton,
        }}
      />
      <Stack.Screen
        name="AboutUs"
        component={AboutUsScreen}
        options={{
          headerShown: true,
          title: "About Us",
          headerRight: SignOutButton,
        }}
      />
      <Stack.Screen
        name="ContactUs"
        component={ContactUsScreen}
        options={{
          headerShown: true,
          title: "Liên hệ",
          headerRight: SignOutButton,
        }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
          title: "Danh sách sân",
          headerRight: SignOutButton,
        }}
      />
      <Stack.Screen
        name="BookingHistory"
        component={HistoryBookingScreen}
        options={{
          headerShown: true,
          title: "Lịch sử Booking",
          headerRight: SignOutButton,
        }}
      />
      <Stack.Screen
        name="VenueDetail"
        component={VenueDetailScreen}
        options={{
          headerShown: true,
          title: "Chi tiết sân",
          headerRight: SignOutButton,
        }}
      />
      <Stack.Screen
        name="SlotSelection"
        component={SlotSelectionScreen}
        options={{
          headerShown: true,
          title: "Chọn khung giờ",
          headerRight: SignOutButton,
        }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          headerShown: true,
          title: "Thanh toán thành công",
        }}
      />
      <Stack.Screen
        name="PaymentFail"
        component={PaymentFailScreen}
        options={{
          headerShown: true,
          title: "Thanh toán thất bại",
        }}
      />

      {/* NEW: Feedback Screen */}
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          headerShown: true,
          title: "Đánh giá sân",
          headerRight: SignOutButton,
        }}
      />
      {/* ==================================== */}
    </Stack.Navigator>
  );
}

//  ROOT NAVIGATOR (phân nhánh giữa Auth / App)

function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer
      linking={{
        prefixes: [
          "exp://192.168.0.119:8081/--",
          "exp://192.168.0.119:19000/--",
          "http://192.168.0.119:8081",
          "http://192.168.0.119:8081/#",
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
            Feedback: "feedback/:bookingId", // Optional: deep link
          },
        },
      }}
    >
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// 🔹 APP ENTRY POINT

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// STYLES

const styles = StyleSheet.create({
  signOutButton: {
    marginRight: 15,
    padding: 5,
  },
});
