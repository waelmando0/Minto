import { StyleSheet, View } from "react-native";

import { Money } from "@/components/money";
import { Text } from "@/components/text";
import { IconTile } from "@/components/ui";
import type { Holding } from "@/data/mock";
import { useColors } from "@/theme/theme";

export function HoldingRow({ holding }: { holding: Holding }) {
  const colors = useColors();
  return (
    <View style={styles.row} accessible>
      <IconTile icon={holding.icon} bg={holding.bg} fg={holding.fg} />
      <View style={styles.main}>
        <Text variant="caption" color={colors.inkSubtle}>
          {holding.name}
        </Text>
        <Money value={holding.value} variant="label" weight="semibold" />
      </View>
      <View style={styles.end}>
        <Text variant="caption" color={colors.inkSubtle}>
          Total Return
        </Text>
        <Money
          value={holding.totalReturn}
          signed
          variant="label"
          weight="semibold"
          color={holding.totalReturn >= 0 ? colors.violet : colors.negative}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  main: { flex: 1, gap: 2 },
  end: { alignItems: "flex-end", gap: 2 },
});
