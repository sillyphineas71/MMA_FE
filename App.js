import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

// Auth context
import { AuthProvider, useAuth } from "./src/context/AuthContext";

// Theme
import { palette } from "./src/theme/theme";

// Auth flow screens
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen2";
import VerifyEmailScreen from "./src/screens/VerifyEmailScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";

// Admin (tabs) and Owner/Customer flows
import AdminStack from "./src/navigation/AdminStack";
import OwnerDashboardScreen from "./src/screens/OwnerDashboardScreen";
import OwnerStack from "./src/navigation/OwnerStack";

// Booking flow
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
import OwnerReviewListScreen from "./src/screens/OwnerReviewListScreen";

const Stack = createNativeStackNavigator();

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

function AppStack() {
  const { user, signOut } = useAuth();

  const SignOutButton = () => (
    <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
      <Feather name="log-out" size={20} color={palette.primaryDark} />
    </TouchableOpacity>
  );

  // Admin uses dedicated bottom tabs
  if (user?.role === "admin") return <AdminStack />;

  // Owner uses dedicated bottom tabs
  if (user?.role === "owner") return <OwnerStack />;

  // Customer flow
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
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
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  signOutButton: { marginRight: 15, padding: 5 },
});
