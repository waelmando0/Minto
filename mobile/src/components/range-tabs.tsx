import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/text";
import type { Range } from "@/data/mock";
import { tap } from "@/lib/haptics";
import { colors, radius } from "@/theme/tokens";

const RANGES: Range[] = ["1D", "1W", "1M", "3M", "1Y"];

export function RangeTabs({ value, onChange }: { value: Range; onChange: (range: Range) => void }) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {RANGES.map((range) => {
        const selected = range === value;
        return (
          <Pressable
            key={range}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              tap();
              onChange(range);
            }}
            style={[styles.tab, selected && styles.selected]}
            hitSlop={6}
          >
            <Text variant="caption" weight="medium" color={selected ? "#fff" : colors.inkSubtle}>
              {range}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  selected: { backgroundColor: colors.tabBar },
});
