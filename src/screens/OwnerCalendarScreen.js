import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { apiGet } from "../config/api";
import { palette, spacing, radius } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

export default function OwnerCalendarScreen({ route }) {
  const { user } = useAuth();
  const routeId = route?.params?.id;

  const [loading, setLoading] = useState(true);
  const [subPitches, setSubPitches] = useState([]); // [{ id, name, venueName }]
  const [selectedId, setSelectedId] = useState(routeId || null);
  const [slots, setSlots] = useState([]);

  const date = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Load owner's sub-pitches if no id passed
  useEffect(() => {
    let canceled = false;
    async function loadSubPitches() {
      try {
        setLoading(true);
        // Lấy tất cả venues rồi lọc theo ownerId
        const venuesResp = await apiGet("/api/venues");
        const venuesArr = Array.isArray(venuesResp?.data)
          ? venuesResp.data
          : Array.isArray(venuesResp)
          ? venuesResp
          : [];
        const myVenues = venuesArr.filter(
          (v) => v.ownerId === user?.id || v.ownerId?._id === user?.id
        );

        // Gọi chi tiết từng venue để lấy subPitches
        const subs = [];
        for (const v of myVenues) {
          try {
            const detail = await apiGet(`/api/venues/${v._id}`);
            const list = Array.isArray(detail?.subPitches)
              ? detail.subPitches
              : [];
            list.forEach((sp) => {
              subs.push({ id: sp._id, name: sp.name, venueName: v.name });
            });
          } catch (_) {}
        }

        if (!canceled) {
          setSubPitches(subs);
          if (!routeId && subs.length > 0) setSelectedId(subs[0].id);
        }
      } catch (e) {
        if (!canceled) {
          setSubPitches([]);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    if (!routeId) loadSubPitches();
    else setLoading(false);

    return () => {
      canceled = true;
    };
  }, [routeId, user?.id]);

  // Load slots when selectedId changes
  useEffect(() => {
    let canceled = false;
    async function loadSlots() {
      if (!selectedId) {
        setSlots([]);
        return;
      }
      try {
        setLoading(true);
        const data = await apiGet(
          `/api/owner/sub-pitches/${selectedId}/slots`,
          { date }
        );
        if (!canceled) setSlots(Array.isArray(data?.slots) ? data.slots : []);
      } catch (e) {
        if (!canceled) setSlots([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    loadSlots();
    return () => {
      canceled = true;
    };
  }, [selectedId, date]);

  if (loading && !selectedId && subPitches.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Sub-pitch selector if multiple */}
      {subPitches.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: spacing.md }}
        >
          {subPitches.map((sp) => {
            const active = sp.id === selectedId;
            return (
              <TouchableOpacity
                key={sp.id}
                onPress={() => setSelectedId(sp.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {sp.venueName} • {sp.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <Text style={styles.header}>📅 Lịch đặt sân ngày {date}</Text>

      {!selectedId && (
        <Text style={{ color: palette.sub }}>
          Bạn chưa có sân con nào hoặc chưa chọn sân con. Hãy thêm sân con cho
          sân của bạn, hoặc chọn một sân con phía trên để xem lịch.
        </Text>
      )}

      {slots.map((slot) => (
        <View key={slot.label} style={styles.card}>
          <Text style={styles.label}>{slot.label}</Text>
          <Text style={styles.info}>
            Booked: {slot.bookedCount} | Holds: {slot.holdCount}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: spacing.lg },
  header: { fontWeight: "800", fontSize: 18, marginBottom: spacing.md },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipText: { color: palette.text },
  chipTextActive: { color: palette.primaryDark, fontWeight: "700" },
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  label: { fontWeight: "700", color: palette.text },
  info: { color: palette.sub },
});
