import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminVenuesScreen from "../screens/admin/AdminVenuesScreen";
import AdminBookingsScreen from "../screens/admin/AdminBookingsScreen";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/admin/DashboardScreen";

const Tab = createBottomTabNavigator();

export default function AdminStack() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === "Users") iconName = "people-outline";
                    else if (route.name === "Venues") iconName = "home-outline";
                    else if (route.name === "Bookings") iconName = "calendar-outline";
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#6FCF97",
                tabBarInactiveTintColor: "gray",
                headerShown: true,
            })}
        >
            <Tab.Screen name="Users" component={AdminUsersScreen} />
            <Tab.Screen name="Venues" component={AdminVenuesScreen} />
            <Tab.Screen name="Bookings" component={AdminBookingsScreen} />
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
        </Tab.Navigator>
    );
}
