import React, { useRef, useState } from "react";
import {
  Text,
  Image,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { palette, radius, shadow, spacing } from "../theme/theme";

export default function VenueCard({ venue, onPress }) {
  const { width: screenWidth } = Dimensions.get("window");
  const cardWidth = screenWidth - spacing.lg * 2;

  const hasMultipleImages =
    Array.isArray(venue.images) && venue.images.length > 1;

  const images =
    Array.isArray(venue.images) && venue.images.length > 0
      ? venue.images
      : ["https://placehold.co/400x200?text=Football+Venue"];

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const onScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / cardWidth);
    if (newIndex !== activeIndex) setActiveIndex(newIndex);
  };

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      {/*  Phần ảnh chỉ để vuốt, không bấm */}
      {hasMultipleImages ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          scrollEnabled
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={{ width: cardWidth }}
        >
          {images.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={[styles.image, { width: cardWidth }]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <Image
          source={{ uri: images[0] }}
          style={[styles.image, { width: cardWidth }]}
          resizeMode="cover"
        />
      )}

      {/*  Dot indicator */}
      {hasMultipleImages && (
        <View style={styles.dotsContainer}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { opacity: i === activeIndex ? 1 : 0.3 }]}
            />
          ))}
        </View>
      )}

      {/*  Phần text mới có thể bấm */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.infoContainer}
      >
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.address}>{venue.address}</Text>
        <Text style={styles.price}>
          💸{" "}
          {venue.minPrice
            ? `${venue.minPrice} – ${venue.maxPrice} VND/Slot`
            : "Chưa có giá"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    overflow: "hidden",
    ...shadow.card,
  },
  image: {
    height: 180,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 8,
    width: "100%",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 3,
  },
  infoContainer: {
    padding: spacing.md,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
  },
  address: { color: palette.sub, marginVertical: 4 },
  price: { color: palette.primaryDark, fontWeight: "600" },
});
// End of VenueCard.js