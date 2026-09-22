import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Search } from "lucide-react-native";

import { Money } from "@/components/money";
import { Screen } from "@/components/screen";
import { Text } from "@/components/text";
import { TransactionRow } from "@/components/transaction-row";
import { Card, Chip } from "@/components/ui";
import type { Category } from "@/data/mock";
import { groupByDay } from "@/lib/group";
import { useAppState } from "@/state/app-state";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

type Filter = "All" | "Income" | Category;

export default function ActivityScreen() {
  const { state } = useAppState();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filters = useMemo<Filter[]>(() => {
    const used = Array.from(new Set(state.transactions.map((t) => t.category)));
    return ["All", "Income", ...used];
  }, [state.transactions]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.transactions.filter((t) => {
      if (filter === "Income" && t.amount <= 0) return false;
      if (filter !== "All" && filter !== "Income" && t.category !== filter) return false;
      return !q || t.merchant.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    });
  }, [state.transactions, filter, query]);

  const spent = visible.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
  const received = visible.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

  return (
    <Screen
      header={
        <View style={[styles.header, { paddingTop: 8 }]}>
          <Text variant="title" accessibilityRole="header">
            Activity
          </Text>
          <View style={styles.search}>
            <Search size={18} color={colors.inkSubtle} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search transactions"
              placeholderTextColor={colors.inkSubtle}
              accessibilityLabel="Search transactions"
              style={styles.input}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {filters.map((f) => (
              <Chip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} />
            ))}
          </ScrollView>
        </View>
      }
    >
      <View style={styles.totals}>
        <Card style={styles.total}>
          <Text variant="caption" color={colors.inkSubtle}>
            Spent
          </Text>
          <Money value={Math.abs(spent)} variant="heading" />
        </Card>
        <Card style={styles.total}>
          <Text variant="caption" color={colors.inkSubtle}>
            Received
          </Text>
          <Money value={received} variant="heading" color={colors.positive} />
        </Card>
      </View>

      {visible.length === 0 ? (
        <Text align="center" color={colors.inkSubtle} style={{ paddingVertical: 40 }}>
          No transactions match your search.
        </Text>
      ) : (
        groupByDay(visible).map((group) => (
          <View key={group.day} style={{ gap: 8 }}>
            <Text variant="micro" color={colors.inkSubtle} style={styles.day}>
              {group.day.toUpperCase()}
            </Text>
            <Card style={{ paddingVertical: 8 }}>
              {group.items.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </Card>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, gap: 12, paddingBottom: 12 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 44,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.ink, height: "100%" },
  chips: { gap: 8 },
  totals: { flexDirection: "row", gap: 12 },
  total: { flex: 1, gap: 4, paddingVertical: 14 },
  day: { paddingHorizontal: 4 },
});
