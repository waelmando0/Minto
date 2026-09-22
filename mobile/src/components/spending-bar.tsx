import { StyleSheet, View } from "react-native";

import { categoryColor, type CategorySpend } from "@/lib/insights";

/** Thin stacked bar showing each category's share of spending. */
export function SpendingBar({ items, height = 10 }: { items: CategorySpend[]; height?: number }) {
  return (
    <View style={[styles.bar, { height, borderRadius: height / 2 }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {items.map((item) => (
        <View key={item.category} style={{ flex: item.share, backgroundColor: categoryColor[item.category] }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", overflow: "hidden", backgroundColor: "rgba(0,0,0,0.06)", gap: 2 },
});
