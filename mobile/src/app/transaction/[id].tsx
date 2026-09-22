import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";

import { Money } from "@/components/money";
import { Text } from "@/components/text";
import { Card, IconButton, IconTile } from "@/components/ui";
import { categoryStyle } from "@/data/mock";
import { formatDateTime } from "@/lib/format";
import { useAppState } from "@/state/app-state";
import { colors, spacing } from "@/theme/tokens";

export default function TransactionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useAppState();
  const insets = useSafeAreaInsets();
  const transaction = state.transactions.find((t) => t.id === id);

  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

  if (!transaction) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
        <View style={styles.bar}>
          <IconButton icon={X} label="Close" onPress={close} />
        </View>
        <Text align="center" color={colors.inkSubtle} style={{ marginTop: 40 }}>
          This transaction could not be found.
        </Text>
      </View>
    );
  }

  const style = categoryStyle[transaction.category];
  const account = state.accounts.find((a) => a.id === transaction.account);
  const rows = [
    { label: "Date", value: formatDateTime(new Date(transaction.date)) },
    { label: "Category", value: transaction.category },
    { label: "Account", value: account ? `${account.name} •••• ${account.last4}` : "—" },
    { label: "Status", value: "Completed" },
    ...(transaction.note ? [{ label: "Note", value: transaction.note }] : []),
    { label: "Reference", value: transaction.id.toUpperCase() },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.bar}>
        <IconButton icon={X} label="Close" onPress={close} />
      </View>

      <View style={styles.hero}>
        <IconTile icon={style.icon} bg={style.bg} fg={style.fg} size={64} />
        <Text variant="heading" accessibilityRole="header">
          {transaction.merchant}
        </Text>
        <Money
          value={transaction.amount}
          signed
          variant="display"
          color={transaction.amount > 0 ? colors.positive : colors.ink}
        />
      </View>

      <Card style={{ gap: 14 }}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text variant="label" color={colors.inkSubtle}>
              {row.label}
            </Text>
            <Text variant="label" weight="medium" style={{ flexShrink: 1 }} align="right">
              {row.value}
            </Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, gap: spacing.xxl },
  bar: { flexDirection: "row", justifyContent: "flex-end" },
  hero: { alignItems: "center", gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
});
