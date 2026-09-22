import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { Money } from "@/components/money";
import { Text } from "@/components/text";
import { IconTile } from "@/components/ui";
import { categoryStyle, type Transaction } from "@/data/mock";
import { formatDateTime } from "@/lib/format";
import { colors } from "@/theme/tokens";

export function TransactionRow({ transaction, showDate = true }: { transaction: Transaction; showDate?: boolean }) {
  const style = categoryStyle[transaction.category];
  const date = new Date(transaction.date);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Opens transaction details"
      onPress={() => router.push({ pathname: "/transaction/[id]", params: { id: transaction.id } })}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <IconTile icon={style.icon} bg={style.bg} fg={style.fg} />
      <View style={styles.main}>
        <Text variant="label" weight="semibold" numberOfLines={1}>
          {transaction.merchant}
        </Text>
        <Text variant="caption" color={colors.inkSubtle} numberOfLines={1}>
          {transaction.category}
        </Text>
      </View>
      <View style={styles.end}>
        <Money
          value={transaction.amount}
          signed
          variant="label"
          weight="semibold"
          color={transaction.amount > 0 ? colors.positive : colors.ink}
        />
        {showDate ? (
          <Text variant="caption" color={colors.inkSubtle}>
            {formatDateTime(date)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  main: { flex: 1, gap: 2 },
  end: { alignItems: "flex-end", gap: 2 },
});
