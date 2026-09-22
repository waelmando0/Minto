import { StyleSheet, View } from "react-native";

import { categoryColor, type CategorySpend } from "@/lib/insights";
import { useColors } from "@/theme/theme";

/** Thin stacked bar showing each category's share of spending. */
export function SpendingBar({ items, height = 10 }: { items: CategorySpend[]; height?: number }) {
  const colors = useColors();
  return (
    <View style={[styles.bar, { height, borderRadius: height / 2, backgroundColor: colors.track }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {items.map((item) => (
        <View key={item.category} style={{ flex: item.share, backgroundColor: categoryColor[item.category] }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", overflow: "hidden", gap: 2 },
});
