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
import DateTimePicker from "@react-native-community/datetimepicker";

const screenWidth = Dimensions.get("window").width;

// --- ĐỊNH NGHĨA NGÀY MẶC ĐỊNH BÊN NGOÀI ---
// Lấy ngày hôm nay
const defaultToDate = new Date();
// Lấy ngày 30 ngày trước
const defaultFromDate = new Date();
defaultFromDate.setDate(defaultToDate.getDate() - 30);
// -------------------------------------------

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
  const stats = {
    totalRevenue: (apiData.platformKpis.totalRevenue / 1000000).toFixed(1),
    totalBookings: apiData.platformKpis.totalSuccessfulBookings,
    newUsers: apiData.platformKpis.newUsers.customers,
    newOwners: apiData.platformKpis.newUsers.owners,
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

  const hotVenues = (apiData.hotPitches || []).map((pitch) => ({
    id: pitch.subPitchId,
    name: pitch.subPitchName || "Không xác định",
    location: pitch.venueId
      ? `Venue ID: ${pitch.venueId.slice(-6)}`
      : "Chưa có venue",
    bookings: pitch.bookingCount || 0,
  }));

  return { stats, revenueChart, hotVenues };
};

const FALLBACK_DATA_TRANSFORMED = {
  stats: { totalRevenue: 0, totalBookings: 0, newUsers: 0, newOwners: 0 },
  revenueChart: { labels: ["N/A"], datasets: [{ data: [0] }] },
  hotVenues: [],
};

export default function AdminDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(FALLBACK_DATA_TRANSFORMED);
  const [error, setError] = useState(null);

  // --- SỬ DỤNG CÁC GIÁ TRỊ MẶC ĐỊNH MỚI ---
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  // --------------------------------------

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState("from");
  const [tempDate, setTempDate] = useState(new Date());

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = format(fromDate, "yyyy-MM-dd");
      const to = format(toDate, "yyyy-MM-dd");
      const rawApiData = await apiGet(
        `/api/admin/dashboard?from=${from}&to=${to}`
      );
      const transformedData = transformApiData(rawApiData);
      setData(transformedData);
    } catch (e) {
      setError(e.message);
      Alert.alert("Lỗi tải dữ liệu", e.message + "\nSử dụng dữ liệu mẫu.");
      setData(FALLBACK_DATA_TRANSFORMED);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const openPicker = (mode) => {
    setPickerMode(mode);
    setTempDate(mode === "from" ? fromDate : toDate);
    setIsPickerVisible(true);
  };

  const onPickerChange = (event, selectedDate) => {
    if (event.type === "set" && selectedDate) {
      setTempDate(selectedDate);
    } else if (Platform.OS === "ios" && selectedDate) {
      // Cho iOS (vẫn cập nhật khi cuộn)
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

  const { stats, revenueChart, hotVenues } = data;

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
                textColor={palette.text} // Giữ lại dòng này để fix màu
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

        <View style={styles.statsRow}>
          <StatsCard
            title="Tổng Doanh thu"
            value={stats.totalRevenue}
            unit="Tr VNĐ"
          />
          <StatsCard
            title="Tổng Lượt đặt"
            value={stats.totalBookings}
            unit="lượt"
          />
        </View>
        <View style={styles.statsRow}>
          <StatsCard title="Khách mới" value={stats.newUsers} unit="users" />
          <StatsCard title="Chủ sân mới" value={stats.newOwners} unit="users" />
        </View>
        <Text style={styles.sectionTitle}>Tăng trưởng Doanh thu</Text>
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
        <Text style={styles.sectionTitle}>Sân "Hot" nhất</Text>
        <View style={styles.listContainer}>
          {hotVenues.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.listItem,
                index === hotVenues.length - 1 && { marginBottom: 0 },
              ]}
            >
              <Text style={styles.listRank}>#{index + 1}</Text>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listLocation}>{item.location}</Text>
              </View>
              <Text style={styles.listBookings}>{item.bookings} lượt</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

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
    alignItems: "center",
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  listRank: {
    fontSize: 20,
    fontWeight: "bold",
    color: palette.sub,
    width: 40,
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
  listLocation: {
    fontSize: 12,
    color: palette.sub,
    marginTop: 3,
  },
  listBookings: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.text,
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