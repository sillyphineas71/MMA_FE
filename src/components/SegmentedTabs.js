import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { palette, radius, shadow } from "../theme/theme";

// Animated segmented control with sliding pill indicator
export default function SegmentedTabs({
  leftLabel = "Đăng nhập",
  rightLabel = "Đăng ký",
  active = "left", // 'left' | 'right'
  onLeftPress,
  onRightPress,
  style,
}) {
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(active === "left" ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(x, {
      toValue: active === "left" ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [active]);

  const indicatorStyle = {
    width: w ? w / 2 - 6 : 0,
    transform: [
      {
        translateX: x.interpolate({
          inputRange: [0, 1],
          outputRange: [4, w ? w / 2 + 2 : 0],
        }),
      },
    ],
  };

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[styles.segment, style]}
    >
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      <TouchableOpacity
        style={styles.btn}
        onPress={onLeftPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, active === "left" && styles.textActive]}>
          {leftLabel}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
        onPress={onRightPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, active === "right" && styles.textActive]}>
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    backgroundColor: "#fff",
    flexDirection: "row",
    borderRadius: radius.pill,
    padding: 4,
    ...shadow.card,
    overflow: "hidden",
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
  },
  text: { color: palette.sub, fontWeight: "700" },
  textActive: { color: "#fff" },
});
