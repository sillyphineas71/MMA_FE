import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { apiGet } from "../config/api";
import { palette, shadow, radius, spacing } from "../theme/theme";
import StatsCard from "../components/StatsCard";
import { format, parseISO } from "date-fns";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const screenWidth = Dimensions.get("window").width;

// --- ĐỊNH NGHĨA NGÀY MẶC ĐỊNH BÊN NGOÀI ---
// Lấy ngày hôm nay
const defaultToDate = new Date();
// Lấy ngày 30 ngày trước
const defaultFromDate = new Date();
defaultFromDate.setDate(defaultToDate.getDate() - 30);
// -------------------------------------------

// (chartConfig và hàm transformApiData giữ nguyên)
const chartConfig = {
  backgroundColor: palette.card,
  backgroundGradientFrom: palette.card,
  backgroundGradientTo: palette.card,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(125, 217, 87, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: { borderRadius: radius.lg },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: palette.primaryDark,
  },
};
const transformApiData = (apiData) => {
  const completedBookings =
    apiData.kpis.bookingStatusCounts.find((s) => s._id === "completed")?.count ||
    0;
  const confirmedBookings =
    apiData.kpis.bookingStatusCounts.find((s) => s._id === "confirmed")?.count ||
    0;
  const stats = {
    totalRevenue: (apiData.kpis.totalRevenue / 1000000).toFixed(1),
    totalBookings: apiData.kpis.totalBookings,
    completedBookings: completedBookings,
    confirmedBookings: confirmedBookings,
  };
  const chartLabels = apiData.revenueChartData.map((item) =>
    format(parseISO(item.date), "dd/MM")
  );
  const chartDataPoints = apiData.revenueChartData.map(
    (item) => item.revenue / 1000000
  );
  const revenueChart = {
    labels: chartLabels.length > 0 ? chartLabels : ["N/A"],
    datasets: [{ data: chartDataPoints.length > 0 ? chartDataPoints : [0] }],
  };
  const reviews = apiData.recentReviews.map((review) => ({
    id: review._id,
    name: review.userId.name,
    rating: review.rating,
    comment: review.comment,
    date: format(parseISO(review.createdAt), "dd/MM/yyyy"),
  }));
  return { stats, revenueChart, reviews };
};
const FALLBACK_DATA_OWNER = {
  stats: {
    totalRevenue: 0,
    totalBookings: 0,
    completedBookings: 0,
    confirmedBookings: 0,
  },
  revenueChart: { labels: ["N/A"], datasets: [{ data: [0] }] },
  reviews: [],
};

export default function OwnerDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(FALLBACK_DATA_OWNER);
  const [error, setError] = useState(null);

  // --- SỬ DỤNG CÁC GIÁ TRỊ MẶC ĐỊNH MỚI ---
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  // --------------------------------------

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState("from");
  const [tempDate, setTempDate] = useState(new Date());

  // (fetchDashboard và useEffect giữ nguyên)
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = format(fromDate, "yyyy-MM-dd");
      const to = format(toDate, "yyyy-MM-dd");
      const rawApiData = await apiGet(
        `/api/owner/dashboard?from=${from}&to=${to}`
      );
      const transformedData = transformApiData(rawApiData);
      setData(transformedData);
    } catch (e) {
      setError(e.message);
      Alert.alert("Lỗi tải dữ liệu", e.message + "\nSử dụng dữ liệu mẫu.");
      setData(FALLBACK_DATA_OWNER);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // (Các hàm modal giữ nguyên)
  const openPicker = (mode) => {
    setPickerMode(mode);
    setTempDate(mode === "from" ? fromDate : toDate);
    setIsPickerVisible(true);
  };

  const onPickerChange = (event, selectedDate) => {
    if (event.type === "set" && selectedDate) {
      setTempDate(selectedDate);
    } else if (Platform.OS === "ios" && selectedDate) {
      // Cập nhật cho iOS khi cuộn
      setTempDate(selectedDate);
    }
  };

  const onConfirmDate = () => {
    if (pickerMode === "from") {
      setFromDate(tempDate);
    } else {
      setToDate(tempDate);
    }
    setIsPickerVisible(false);
  };

  const onCancelPicker = () => {
    setIsPickerVisible(false);
  };

  const { stats, revenueChart, reviews } = data;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primaryDark} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.dateFilterContainer}>
          <TouchableOpacity
            onPress={() => openPicker("from")}
            style={styles.dateButton}
          >
            <Text style={styles.dateText}>
              Từ: {format(fromDate, "dd/MM/yy")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openPicker("to")}
            style={styles.dateButton}
          >
            <Text style={styles.dateText}>
              Đến: {format(toDate, "dd/MM/yy")}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          transparent={true}
          visible={isPickerVisible}
          animationType="fade"
          onRequestClose={onCancelPicker}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="inline"
                onChange={onPickerChange}
                style={{ width: 320, height: 320 }}
                textColor={palette.text}
                // --- THÊM DÒNG NÀY ĐỂ SỬA LỖI --- (Bạn đã thêm)
                // theme="light" // Prop này có thể không chuẩn, 'textColor' là đủ
              />
              <View style={styles.modalActions}>
                <Pressable
                  onPress={onCancelPicker}
                  style={[styles.modalButton, styles.buttonCancel]}
                >
                  <Text style={styles.buttonCancelText}>Hủy</Text>
                </Pressable>
                <Pressable
                  onPress={onConfirmDate}
                  style={[styles.modalButton, styles.buttonConfirm]}
                >
                  <Text style={styles.buttonConfirmText}>Xác nhận</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* (Phần còn lại của JSX giữ nguyên) */}
        <View style={styles.statsRow}>
          <StatsCard
            title="Doanh thu sân"
            value={stats.totalRevenue}
            unit="Tr VNĐ"
            iconName="dollar-sign"
          />
          <StatsCard
            title="Tổng lượt đặt"
            value={stats.totalBookings}
            unit="lượt"
            iconName="calendar"
          />
        </View>
        <View style={styles.statsRow}>
          <StatsCard
            title="Đã hoàn thành"
            value={stats.completedBookings}
            unit="lượt"
            iconName="check-circle"
          />
          <StatsCard
            title="Chờ check-in"
            value={stats.confirmedBookings}
            unit="lượt"
            iconName="clock"
          />
        </View>
        <Text style={styles.sectionTitle}>Biểu đồ doanh thu (sân của bạn)</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={revenueChart}
            width={screenWidth - spacing.lg * 2}
            height={220}
            yAxisSuffix="Tr"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
        <Text style={styles.sectionTitle}>Đánh giá gần đây</Text>
        <View style={styles.listContainer}>
          {reviews.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.listItem,
                index === reviews.length - 1 && {
                  marginBottom: 0,
                  borderBottomWidth: 0,
                },
              ]}
            >
              <View style={styles.listRankIcon}>
                <Feather name="star" size={20} color="#FFD700" />
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listComment}>{item.comment}</Text>
              </View>
              <View style={styles.listRatingContainer}>
                <Text style={styles.listRating}>{item.rating}/5</Text>
                <Text style={styles.listDate}>{item.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// (Styles giữ nguyên)
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.bg,
  },
  dateFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  dateButton: {
    backgroundColor: palette.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    ...shadow.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  dateText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: -spacing.sm / 2,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  chartContainer: {
    ...shadow.card,
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  chart: {
    borderRadius: radius.lg,
  },
  listContainer: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    ...shadow.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  listRankIcon: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  listInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  listName: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.text,
  },
  listComment: {
    fontSize: 14,
    color: palette.sub,
    marginTop: spacing.xs,
  },
  listRatingContainer: {
    alignItems: "flex-end",
  },
  listRating: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.text,
  },
  listDate: {
    fontSize: 12,
    color: palette.sub,
    marginTop: spacing.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadow.card,
    width: "90%",
    maxWidth: 340,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: spacing.md,
  },
  modalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginLeft: spacing.sm,
  },
  buttonCancel: {
    backgroundColor: palette.border,
  },
  buttonCancelText: {
    color: palette.sub,
    fontWeight: "600",
  },
  buttonConfirm: {
    backgroundColor: palette.primary,
  },
  buttonConfirmText: {
    color: palette.text,
    fontWeight: "700",
  },
});