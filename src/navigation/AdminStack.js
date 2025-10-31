import React from "react";
import { TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminVenuesScreen from "../screens/admin/AdminVenuesScreen";
import AdminBookingsScreen from "../screens/admin/AdminBookingsScreen";
import { Ionicons } from "@expo/vector-icons";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();

export default function AdminStack() {
  const { signOut } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "grid-outline";
          if (route.name === "Users") iconName = "people-outline";
          else if (route.name === "Venues") iconName = "home-outline";
          else if (route.name === "Bookings") iconName = "calendar-outline";
          else if (route.name === "Dashboard") iconName = "analytics-outline";
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
      <Tab.Screen name="Users" component={AdminUsersScreen} />
      <Tab.Screen name="Venues" component={AdminVenuesScreen} />
      <Tab.Screen name="Bookings" component={AdminBookingsScreen} />
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
    </Tab.Navigator>
  );
}
