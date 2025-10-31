import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ScrollView, // Thêm ScrollView cho modal
  // === THÊM 2 DÒNG SAU ===
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { apiGet, apiPost } from "../config/api";
import { palette, spacing, radius, shadow } from "../theme/theme";
import GradientButton from "../components/GradientButton";
import { Feather } from "@expo/vector-icons";

// Hàm format tiền VND
const formatCurrency = (value) => {
  if (typeof value !== "number") return "0";
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

// Component Card Số dư
function BalanceCard({ balance, onWithdrawPress }) {
  return (
    <View style={styles.card}>
      <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
      <Text style={styles.balanceAmount}>
        {formatCurrency(balance?.availableBalance)}
      </Text>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceSubText}>Tổng doanh thu:</Text>
        <Text style={styles.balanceSubValue}>
          {formatCurrency(balance?.totalRevenue)}
        </Text>
      </View>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceSubText}>Đã rút / Chờ rút:</Text>
        <Text style={styles.balanceSubValue}>
          {formatCurrency(balance?.totalWithdrawn)}
        </Text>
      </View>
      <GradientButton
        title="Yêu cầu rút tiền"
        onPress={onWithdrawPress}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
}

// Component Modal Rút tiền
function WithdrawalModal({ visible, onClose, availableBalance, onComplete }) {
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return Alert.alert("Lỗi", "Số tiền không hợp lệ.");
    }
    if (numAmount > availableBalance) {
      return Alert.alert("Lỗi", "Số tiền vượt quá số dư khả dụng.");
    }
    if (!accountName || !accountNumber || !bankName) {
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin ngân hàng.");
    }

    try {
      setLoading(true);
      await apiPost("/api/withdrawals/owner/request", {
        amount: numAmount,
        bankInfo: { accountName, accountNumber, bankName },
      });
      Alert.alert("Thành công", "Đã gửi yêu cầu rút tiền.");
      // Reset form
      setAmount("");
      setAccountName("");
      setAccountNumber("");
      setBankName("");
      onComplete(); // Gọi callback để tải lại dữ liệu
      onClose(); // Đóng modal
    } catch (e) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setAmount("");
    setAccountName("");
    setAccountNumber("");
    setBankName("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={resetForm}
    >
      {/* === THAY ĐỔI 1: Thay View bằng KeyboardAvoidingView === */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalBackdrop}
      >
        <View style={styles.modalContainer}>
          <ScrollView>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo yêu cầu rút tiền</Text>
              <TouchableOpacity onPress={resetForm}>
                <Feather name="x" size={24} color={palette.sub} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Số tiền (Khả dụng: {formatCurrency(availableBalance)})</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số tiền"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            
            {/* === PHẦN CODE BỊ THIẾU ĐƯỢC THÊM LẠI === */}
            <Text style={styles.label}>Tên chủ tài khoản</Text>
            <TextInput
              style={styles.input}
              placeholder="NGUYEN VAN A"
              autoCapitalize="characters"
              value={accountName}
              onChangeText={setAccountName}
            />
            
            <Text style={styles.label}>Số tài khoản</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số tài khoản"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Text style={styles.label}>Tên ngân hàng</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Techcombank, Vietcombank..."
              value={bankName}
              onChangeText={setBankName}
            />

            <GradientButton
              title={loading ? "Đang gửi..." : "Xác nhận"}
              onPress={handleSubmit}
              disabled={loading}
              style={{ marginTop: spacing.lg, marginBottom: spacing.md }}
            />
            {/* === KẾT THÚC PHẦN BỊ THIẾU === */}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      {/* === KẾT THÚC THAY ĐỔI 1 === */}
    </Modal>
  );
}

// Component chính
export default function WithdrawalOwnerScreen() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Dùng Promise.all để tải song song
      const [balanceData, historyData] = await Promise.all([
         apiGet("/api/withdrawals/owner/balance"),
         apiGet("/api/withdrawals/owner/history")
      ]);
      setBalance(balanceData);
      setHistory(historyData);
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
      setLoading(true);
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  const getStatusStyle = (status) => {
    if (status === 'success') return { color: 'green', text: 'Thành công' };
    if (status === 'rejected') return { color: 'red', text: 'Bị từ chối' };
    if (status === 'processing') return { color: 'blue', text: 'Đang xử lý' };
    return { color: palette.sub, text: 'Đang chờ' };
  };

  const renderHistoryItem = ({ item }) => {
    const status = getStatusStyle(item.status);
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemRow}>
          {/* === THAY ĐỔI 2: Thêm View để chứa STK === */}
          <View>
            <Text style={styles.itemBank}>{item.bankInfo.bankName}</Text>
            {/* Dòng mới hiển thị số tài khoản */}
            <Text style={styles.itemAccount}>{item.bankInfo.accountNumber}</Text>
          </View>
          {/* === KẾT THÚC THAY ĐỔI 2 === */}
          <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemDate}>
            {new Date(item.requestedAt).toLocaleDateString("vi-VN")}
          </Text>
          <Text style={[styles.itemStatus, { color: status.color }]}>
            {status.text}
          </Text>
        </View>
         {item.status === 'rejected' && (
          <Text style={styles.itemReason}>Lý do: {item.rejectionReason}</Text>
        )}
      </View>
    );
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
      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        renderItem={renderHistoryItem}
        ListHeaderComponent={
          <>
            <BalanceCard
              balance={balance}
              onWithdrawPress={() => setModalVisible(true)}
            />
            <Text style={styles.sectionTitle}>Lịch sử rút tiền</Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có lịch sử rút tiền.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />
        }
        contentContainerStyle={{ padding: spacing.lg }}
      />
      <WithdrawalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        availableBalance={balance?.availableBalance || 0}
        onComplete={fetchData} // Tải lại dữ liệu sau khi yêu cầu thành công
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.card,
    marginBottom: spacing.xl,
  },
  balanceLabel: { color: palette.sub, fontSize: 16 },
  balanceAmount: {
    color: palette.primaryDark,
    fontSize: 32,
    fontWeight: "800",
    marginVertical: spacing.xs,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  balanceSubText: { color: palette.sub },
  balanceSubValue: { color: palette.text, fontWeight: "600" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
    marginBottom: spacing.md,
  },
  itemCard: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.border
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  itemBank: { fontSize: 16, fontWeight: "600", color: palette.text },
  itemAmount: { fontSize: 16, fontWeight: "700", color: palette.text },
  itemDate: { color: palette.sub },
  itemStatus: { fontWeight: "700" },
  itemReason: { color: 'red', fontStyle: 'italic', marginTop: spacing.xs },
  emptyText: { color: palette.sub, textAlign: 'center', marginTop: spacing.lg },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: palette.card,
    maxHeight: '85%', // Giới hạn chiều cao modal
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: 40, // Cho an toàn
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: palette.text },
  label: {
    color: palette.sub,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: palette.bg,
    color: palette.text,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  itemBank: { fontSize: 16, fontWeight: "600", color: palette.text },
  itemAmount: { fontSize: 16, fontWeight: "700", color: palette.text },
  itemDate: { color: palette.sub },
  itemStatus: { fontWeight: "700" },
  itemReason: { color: 'red', fontStyle: 'italic', marginTop: spacing.xs },
  emptyText: { color: palette.sub, textAlign: 'center', marginTop: spacing.lg },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: palette.card,
    maxHeight: '85%', // Giới hạn chiều cao modal
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: 40, // Cho an toàn
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: palette.text },
  label: {
    color: palette.sub,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: palette.bg,
    color: palette.text,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
});
