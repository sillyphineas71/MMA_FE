import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, radius } from "../theme/theme";

// A rounded input with a leading icon and optional password toggle
export default function IconInput({
  icon = "person-outline",
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize = "none",
  secure = false,
  style,
}) {
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={[styles.wrapper, style]}>
      <Ionicons
        name={icon}
        size={20}
        color={palette.sub}
        style={styles.leading}
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={palette.sub}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={hidden}
        style={styles.input}
      />
      {secure && (
        <TouchableOpacity onPress={() => setHidden((s) => !s)}>
          <Ionicons
            name={hidden ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={palette.sub}
            style={styles.trailing}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    height: 52,
  },
  leading: { marginRight: 8 },
  input: { flex: 1, color: palette.text, paddingVertical: 12 },
  trailing: { marginLeft: 8 },
});
