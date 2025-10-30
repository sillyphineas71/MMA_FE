import React from "react";
import { TouchableOpacity, Text, Image, View, StyleSheet } from "react-native";
import { palette, radius, shadow, spacing } from "../theme/theme";

export default function VenueCard({ venue, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{
          uri: venue.image || "https://placehold.co/400x200?text=Football+Venue",
        }}
        style={styles.image}
      />
      <View style={{ padding: spacing.md }}>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.address}>{venue.address}</Text>
        <Text style={styles.price}>
          💸 {venue.minPrice} – {venue.maxPrice} VND/h
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
  },
  address: { color: palette.sub, marginVertical: 4 },
  price: { color: palette.primaryDark, fontWeight: "600" },
});
