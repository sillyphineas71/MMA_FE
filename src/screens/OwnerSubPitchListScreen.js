import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { apiGet, apiDelete } from "../config/api"; // Cần có apiDelete
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";

export default function OwnerSubPitchListScreen({ navigation, route }) {
    const { venueId, venueName } = route.params;
    const [subPitches, setSubPitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSubPitches = async () => {
        try {
            const data = await apiGet(`/owner/venues/${venueId}/sub-pitches`);
            setSubPitches(data || []);
        } catch (err) {
            Alert.alert("Lỗi", "Không tải được danh sách sân con.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchSubPitches();
        }, [venueId])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSubPitches();
        setRefreshing(false);
    };

    const handleDelete = (subPitch) => {
        Alert.alert("Xác nhận xoá", `Bạn có chắc muốn xoá "${subPitch.name}"?`, [
            { text: "Huỷ" },
            {
                text: "Xoá",
                onPress: async () => {
                    try {
                        await apiDelete(`/owner/sub-pitches/${subPitch._id}`);
                        Alert.alert("✅ Đã xoá", "Xoá sân con thành công.");
                        fetchSubPitches();
                    } catch (err) {
                        Alert.alert("Lỗi", "Không thể xoá sân con này.");
                    }
                },
                style: "destructive",
            },
        ]);
    };

    const createSubPitch = () => navigation.navigate("OwnerSubPitchCreate", { venueId });
    const editSubPitch = (subPitch) => navigation.navigate("OwnerSubPitchEdit", { subPitch });

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.type}>{item.type}</Text>
                </View>
                <Text style={[styles.status, { color: item.active ? "#40B800" : "#EF4444" }]}>
                    {item.active ? "🟢 Đang hoạt động" : "⚪ Đang ẩn"}
                </Text>
                <Text style={styles.blocks}>
                    <Ionicons name="time-outline" size={14} /> {item.bookableBlocks?.length || 0} khung giờ
                </Text>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => editSubPitch(item)}>
                        <Feather name="edit" size={18} color="#40B800" />
                        <Text style={styles.actionText}>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
                        <Feather name="trash-2" size={18} color="#EF4444" />
                        <Text style={[styles.actionText, { color: "#EF4444" }]}>Xoá</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#40B800" />
                <Text style={{ marginTop: 8, color: "#40B800" }}>Đang tải danh sách sân con...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    Sân con ({venueName})
                </Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={subPitches}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>Chưa có sân con nào</Text>}
                contentContainerStyle={{ paddingBottom: 100, padding: 16 }}
            />

            <TouchableOpacity style={styles.fab} onPress={createSubPitch}>
                <AntDesign name="plus" size={26} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF" },
    headerBar: {
        backgroundColor: "#40B800",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#FFFFFF",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 10,
    },
    backButton: { paddingRight: 10 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF" },
    emptyText: { textAlign: "center", color: "#6B7280", marginTop: 40, fontSize: 16 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    cardContent: { padding: 12 },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    name: { fontSize: 18, fontWeight: "700", color: "#40B800" },
    type: {
        fontSize: 14,
        fontWeight: "600",
        color: "#40B800",
        backgroundColor: "#F0FDF4",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    status: { fontWeight: "600", marginTop: 4 },
    blocks: { color: "#6B7280", marginVertical: 4, marginTop: 8 },
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
    fab: {
        position: "absolute",
        right: 20,
        bottom: 80,
        backgroundColor: "#40B800",
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