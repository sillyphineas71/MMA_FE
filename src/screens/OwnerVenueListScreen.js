import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    RefreshControl,
    Alert,
    TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { apiGet, apiPatch } from "../config/api"; // 1. Giữ nguyên import
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons"; // 2. Thêm Ionicons

export default function OwnerVenueListScreen({ navigation }) {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const fetchVenues = async () => {
        try {
            const data = await apiGet("/owner/venues");
            setVenues(data || []);
        } catch (err) {
            Alert.alert("Lỗi", "Không tải được danh sách sân.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchVenues();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchVenues();
        setRefreshing(false);
    };

    const toggleStatus = async (venue) => {
        const newStatus = venue.status === "active" ? "hidden" : "active";
        try {
            await apiPatch(`/owner/venues/${venue._id}/status`, { status: newStatus });
            Alert.alert("✅ Thành công", `Sân đã được ${newStatus === "active" ? "hiển thị" : "ẩn"}.`);
            fetchVenues();
        } catch {
            Alert.alert("Lỗi", "Không thể thay đổi trạng thái sân.");
        }
    };

    const createVenue = () => navigation.navigate("OwnerVenueCreate");
    const editVenue = (venue) => navigation.navigate("OwnerVenueEdit", { venue });

    // 3. Thêm hàm điều hướng đến Màn 4
    const manageSubPitches = (venue) => {
        navigation.navigate("OwnerSubPitchList", {
            venueId: venue._id,
            venueName: venue.name,
        });
    };

    const filteredVenues = useMemo(() => {
        return venues
            .filter((venue) => {
                if (activeFilter === "all") return true;
                return venue.status === activeFilter;
            })
            .filter((venue) => {
                if (searchText === "") return true;
                return venue.name.toLowerCase().includes(searchText.toLowerCase());
            });
    }, [venues, activeFilter, searchText]);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.images?.[0] || "https://via.placeholder.com/400x200?text=No+Image" }}
                style={styles.image}
            />
            <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.address}>{item.address}</Text>
                <Text style={[styles.status, { color: item.status === "active" ? "#40B800" : "#EF4444" }]}>
                    {item.status === "active" ? "🟢 Đang hoạt động" : "⚪ Đang ẩn"}
                </Text>
                <Text style={styles.rating}>
                    ⭐ {item.ratingAvg ? `${item.ratingAvg} (${item.ratingCount})` : "Chưa có đánh giá"}
                </Text>

                {/* 4. Cập nhật actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => manageSubPitches(item)}>
                        <Ionicons name="football-outline" size={18} color="#0EA5E9" />
                        <Text style={[styles.actionText, { color: "#0EA5E9" }]}>Sân con</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => editVenue(item)}>
                        <Feather name="edit" size={18} color="#40B800" />
                        <Text style={styles.actionText}>Sửa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => toggleStatus(item)}>
                        <Feather
                            name={item.status === "active" ? "eye-off" : "eye"}
                            size={18}
                            color="#EF4444"
                        />
                        <Text style={[styles.actionText, { color: "#EF4444" }]}>
                            {item.status === "active" ? "Ẩn" : "Hiện"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // ... (Phần còn lại của JSX và Styles giữ nguyên)
    if (loading)
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#40B800" />
                <Text style={{ marginTop: 8, color: "#40B800" }}>Đang tải danh sách sân...</Text>
            </View>
        );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.filterContainer}>
                <View style={styles.searchBox}>
                    <TextInput
                        placeholder="Search venue"
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
                <View style={styles.filterButtonsContainer}>
                    {/* ... (Các nút filter giữ nguyên) ... */}
                </View>
            </View>

            <FlatList
                data={filteredVenues}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy sân nào</Text>}
                contentContainerStyle={{ paddingBottom: 100 }}
                style={{ paddingHorizontal: 16 }}
            />

            <TouchableOpacity style={styles.fab} onPress={createVenue}>
                <AntDesign name="plus" size={26} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF" },
    filterContainer: {
        padding: 16,
        backgroundColor: "#F9FAFB",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 16,
    },
    searchBox: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    searchInput: {
        fontSize: 16,
        color: "#111827",
    },
    filterButtonsContainer: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
    },
    filterButton: {
        backgroundColor: "#F3F4F6",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    activeFilterButton: {
        backgroundColor: "#40B800",
    },
    filterButtonText: {
        color: "#374151",
        fontWeight: "500",
        fontSize: 14,
    },
    activeFilterButtonText: {
        color: "#FFF",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
        smarginBottom: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    image: { width: "100%", height: 160 },
    cardContent: { padding: 12 },
    name: { fontSize: 18, fontWeight: "700", color: "#40B800" },
    address: { color: "#6B7280", marginVertical: 4 },
    status: { fontWeight: "600", marginTop: 4 },
    rating: { color: "#FACC15", marginTop: 4 },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 8,
        gap: 20,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        paddingTop: 12,
    },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    actionText: { fontWeight: "600", color: "#40B800" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF" },
    emptyText: { textAlign: "center", color: "#6B7280", marginTop: 40, fontSize: 16 },

    // 6. THÊM LẠI STYLE CHO FAB
    fab: {
        position: "absolute",
        right: 20,
        bottom: 80, // Khoảng cách 80px từ đáy (thường để né Tab Navigator)
        backgroundColor: "#40B800", // Đồng bộ màu xanh
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
});