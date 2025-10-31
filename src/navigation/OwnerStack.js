import React from "react";
import { TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

// Owner screens
import OwnerDashboardScreen from "../screens/OwnerDashboardScreen";
import OwnerCalendarScreen from "../screens/OwnerCalendarScreen";
import WithdrawalOwnerScreen from "../screens/WithdrawalOwnerScreen";

const Tab = createBottomTabNavigator();

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
        name="Withdrawals"
        component={WithdrawalOwnerScreen}
        options={{ title: "Rút tiền" }}
      />
    </Tab.Navigator>
  );
}
