import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SectionList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  TextInput, // Thêm TextInput
  Modal, // Thêm Modal
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { apiGet, apiPost } from "../config/api";
import { palette, spacing, radius, shadow } from "../theme/theme";
import { Feather } from "@expo/vector-icons";
import GradientButton from "../components/GradientButton";

// Hàm format tiền VND
const formatCurrency = (value) => {
  if (typeof value !== "number") return "0";
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

// Modal để nhập lý do từ chối
const RejectModal = ({ visible, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return Alert.alert("Lỗi", "Vui lòng nhập lý do từ chối.");
    setLoading(true);
    await onSubmit(reason); // Gọi hàm submit từ ngoài
    setLoading(false);
    setReason(""); // Reset
    onClose();
  };
  
  const handleClose = () => {
     setReason("");
     onClose();
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.reasonModalContainer}>
          <Text style={styles.modalTitle}>Lý do từ chối</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Nhập lý do..."
            multiline
            value={reason}
            onChangeText={setReason}
          />
          <View style={styles.modalButtonRow}>
             <TouchableOpacity style={styles.modalButton} onPress={handleClose}>
                <Text style={styles.modalButtonText}>Hủy</Text>
             </TouchableOpacity>
             <GradientButton
                title={loading ? "Đang gửi..." : "Xác nhận"}
                onPress={handleSubmit}
                disabled={loading}
                style={{ flex: 1, marginLeft: spacing.sm }}
              />
          </View>
        </View>
      </View>
    </Modal>
  );
};


// Component Item Yêu cầu
const RequestItem = ({ item, onProcess }) => {
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  // Xử lý chung
  const runAction = async (action, reason) => {
     try {
      setLoading(true);
      const body = action === 'reject' ? { reason } : {};
      await apiPost(`/api/withdrawals/admin/${action}/${item._id}`, body);
      
      Alert.alert("Thành công", `Đã ${action === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu.`);
      onProcess(); // Gọi callback để tải lại danh sách
    } catch (e) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
    }
  }

  // Bấm nút Duyệt
  const handleApprove = () => {
     Alert.alert(
      `Xác nhận Duyệt`,
      `Bạn có chắc muốn DUYỆT yêu cầu ${formatCurrency(item.amount)} cho ${item.ownerId?.name}?`,
      [
        { text: "Hủy" },
        { text: "Xác nhận", onPress: () => runAction('approve', null) }
      ]
    );
  };
  
  // Bấm nút Từ chối (mở modal)
  const handleReject = () => {
    setRejectModalVisible(true);
  };
  
  // Gửi lý do từ modal
  const submitReject = async (reason) => {
    await runAction('reject', reason);
    setRejectModalVisible(false); // Đóng modal sau khi submit
  };

  const getStatusStyle = (status) => {
    if (status === 'success') return { color: 'green', text: 'Thành công' };
    if (status === 'rejected') return { color: 'red', text: 'Bị từ chối' };
    if (status === 'processing') return { color: 'blue', text: 'Đang xử lý' };
    return { color: palette.sub, text: 'Đang chờ' };
  };
  const status = getStatusStyle(item.status);

  return (
    <>
      <View style={styles.itemCard}>
        <View style={styles.itemRow}>
          <Text style={styles.itemOwner}>{item.ownerId?.name || "Không rõ"}</Text>
          <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
        </View>
        <Text style={styles.itemSubText}>Email: {item.ownerId?.email}</Text>
        <Text style={styles.itemSubText}>Ngân hàng: {item.bankInfo.bankName}</Text>
        <Text style={styles.itemSubText}>STK: {item.bankInfo.accountNumber}</Text>
        <Text style={styles.itemSubText}>Chủ TK: {item.bankInfo.accountName}</Text>
        <Text style={styles.itemSubText}>
          Ngày yêu cầu: {new Date(item.requestedAt).toLocaleString("vi-VN")}
        </Text>
        
        {item.status !== 'pending' && (
           <Text style={[styles.itemStatus, { color: status.color }]}>
              {status.text}
              {item.status === 'rejected' && ` (Lý do: ${item.rejectionReason})`}
           </Text>
        )}

        {item.status === "pending" && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={loading}
            >
              <Feather name="x" size={16} color="red" />
              <Text style={[styles.actionText, { color: "red" }]}>Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={palette.primaryDark} />
              ) : (
                 <>
                  <Feather name="check" size={16} color={palette.primaryDark} />
                  <Text style={[styles.actionText, { color: palette.primaryDark }]}>
                    Duyệt
                  </Text>
                 </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Modal cho item này */}
      <RejectModal 
        visible={rejectModalVisible}
        onClose={() => setRejectModalVisible(false)}
        onSubmit={submitReject}
      />
    </>
  );
};

// Component chính
export default function WithdrawalAdminScreen() {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/api/withdrawals/admin/list");
      setAllData(data);
    } catch (e) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tải dữ liệu khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );
  
  // Phân loại dữ liệu (dùng useMemo để tối ưu)
  const sections = useMemo(() => {
      const pending = allData.filter((d) => d.status === "pending" || d.status === "processing");
      const history = allData.filter((d) => d.status === "success" || d.status === "rejected");
      
      return [
        { title: `Chờ xử lý (${pending.length})`, data: pending },
        { title: "Lịch sử đã xử lý", data: history },
      ];
  }, [allData]); // Chỉ tính toán lại khi allData thay đổi

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <RequestItem item={item} onProcess={fetchData} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />
        }
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
            <Text style={styles.emptyText}>Không có yêu cầu nào.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
    backgroundColor: palette.bg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  itemCard: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  itemOwner: { fontSize: 16, fontWeight: "600", color: palette.text },
  itemAmount: { fontSize: 16, fontWeight: "700", color: palette.primaryDark },
  itemSubText: { color: palette.sub, fontSize: 14, marginBottom: 2 },
  itemStatus: { fontWeight: "700", marginTop: spacing.sm },
  emptyText: { color: palette.sub, textAlign: 'center', marginTop: spacing.lg },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    marginLeft: spacing.sm,
  },
  actionText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: "#FFF1F2", // Red light
  },
  approveButton: {
    backgroundColor: "#F0FDF4", // Green light
  },
  
  // Modal Lý do
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  reasonModalContainer: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    ...shadow.card,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: palette.text,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: palette.bg,
    color: palette.text,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.md,
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  modalButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.border,
    borderRadius: radius.pill,
  },
   modalButtonText: {
    color: palette.sub,
    fontSize: 16,
    fontWeight: "700",
  }
});
