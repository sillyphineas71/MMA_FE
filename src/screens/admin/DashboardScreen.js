import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function DashboardScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Trang Quản Trị</Text>

            <Button title="Quản lý người dùng" onPress={() => navigation.navigate("Users")} />
            <Button title="Quản lý sân bóng" onPress={() => navigation.navigate("Venues")} />
            <Button title="Quản lý đặt sân" onPress={() => navigation.navigate("Bookings")} />
            <Button title="Xem doanh thu" onPress={() => navigation.navigate("Revenue")} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
});
