import React from "react";
import { TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

// Owner screens
import OwnerDashboardScreen from "../screens/OwnerDashboardScreen";
import OwnerCalendarScreen from "../screens/OwnerCalendarScreen";
import WithdrawalOwnerScreen from "../screens/WithdrawalOwnerScreen";
import OwnerVenueListScreen from "../screens/OwnerVenueListScreen";
import OwnerVenueCreateScreen from "../screens/OwnerVenueCreateScreen";
import OwnerVenueEditScreen from "../screens/OwnerVenueEditScreen";
import OwnerSubPitchListScreen from "../screens/OwnerSubPitchListScreen";
import OwnerSubPitchCreateScreen from "../screens/OwnerSubPitchCreateScreen";
import OwnerSubPitchEditScreen from "../screens/OwnerSubPitchEditScreen";
import OwnerReviewListScreen from "../screens/OwnerReviewListScreen";
import OwnerBookingsScreen from "../screens/OwnerBookingsScreen";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function OwnerManageStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      initialRouteName="OwnerVenueList"
    >
      <Stack.Screen name="OwnerVenueList" component={OwnerVenueListScreen} />
      <Stack.Screen
        name="OwnerVenueCreate"
        component={OwnerVenueCreateScreen}
      />
      <Stack.Screen name="OwnerVenueEdit" component={OwnerVenueEditScreen} />
      <Stack.Screen
        name="OwnerSubPitchList"
        component={OwnerSubPitchListScreen}
      />
      <Stack.Screen
        name="OwnerSubPitchCreate"
        component={OwnerSubPitchCreateScreen}
      />
      <Stack.Screen
        name="OwnerSubPitchEdit"
        component={OwnerSubPitchEditScreen}
      />
      <Stack.Screen
        name="OwnerReviewListScreen"
        component={OwnerReviewListScreen}
      />
    </Stack.Navigator>
  );
}

export default function OwnerStack() {
  const { signOut } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "grid-outline";
          if (route.name === "Dashboard") iconName = "analytics-outline";
          else if (route.name === "Calendar") iconName = "calendar-outline";
          else if (route.name === "Withdrawals") iconName = "cash-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6FCF97",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={signOut} style={{ marginRight: 16 }}>
            <Ionicons name="log-out" size={20} color="#333" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={OwnerDashboardScreen}
        options={{ title: "Tổng quan" }}
      />
      <Tab.Screen
        name="Calendar"
        component={OwnerCalendarScreen}
        options={{ title: "Lịch sân" }}
      />
      <Tab.Screen
        name="Bookings"
        component={OwnerBookingsScreen}
        options={{ title: "Đặt sân" }}
      />
      <Tab.Screen
        name="Manage"
        component={OwnerManageStack}
        options={{
          title: "Quản lý",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Withdrawals"
        component={WithdrawalOwnerScreen}
        options={{ title: "Rút tiền" }}
      />
    </Tab.Navigator>
  );
}
