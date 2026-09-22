import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";

import { DonutChart } from "@/components/donut-chart";
import { Money } from "@/components/money";
import { PageHeader } from "@/components/page-header";
import { Text } from "@/components/text";
import { Card, Chip, IconTile } from "@/components/ui";
import { categoryStyle } from "@/data/mock";
import { formatCurrency } from "@/lib/format";
import { categoryColor, incomeFor, periods, spendingByCategory, type Period } from "@/lib/insights";
import { useAppState } from "@/state/app-state";
import { colors, radius, spacing } from "@/theme/tokens";

export default function InsightsScreen() {
  const { state } = useAppState();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("30d");

  const breakdown = useMemo(() => spendingByCategory(state.transactions, period), [state.transactions, period]);
  const spent = breakdown.reduce((s, c) => s + c.total, 0);
  const income = incomeFor(state.transactions, period);
  const top = breakdown[0];

  const chartLabel = breakdown.length
    ? `Spending by category: ${breakdown
        .map((c) => `${c.category} ${Math.round(c.share * 100)} percent`)
        .join(", ")}`
    : "No spending in this period";

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.gutter}>
        <PageHeader title="Spending insights" />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periods}>
          {periods.map((p) => (
            <Chip key={p.id} label={p.label} selected={p.id === period} onPress={() => setPeriod(p.id)} />
          ))}
        </ScrollView>

        <Card style={styles.chartCard}>
          <DonutChart
            label={chartLabel}
            segments={breakdown.map((c) => ({ key: c.category, value: c.total, color: categoryColor[c.category] }))}
          >
            <Text variant="caption" color={colors.inkSubtle}>
              Spent
            </Text>
            <Money value={spent} variant="title" />
          </DonutChart>

          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text variant="caption" color={colors.inkSubtle}>
                Income
              </Text>
              <Money value={income} variant="heading" color={colors.positive} />
            </View>
            <View style={styles.summaryItem}>
              <Text variant="caption" color={colors.inkSubtle}>
                Net
              </Text>
              <Money value={income - spent} signed variant="heading" />
            </View>
          </View>
          {top ? (
            <Text variant="caption" color={colors.inkMuted} align="center">
              {top.category} is your biggest category: {Math.round(top.share * 100)}% of spending (
              {formatCurrency(top.total)}).
            </Text>
          ) : null}
        </Card>

        <Text variant="caption" color={colors.inkSubtle} align="center">
          Moves between your own accounts (savings goals, investment buys) aren&apos;t counted as spending.
        </Text>

        {breakdown.length === 0 ? (
          <Text align="center" color={colors.inkSubtle}>
            No spending in this period.
          </Text>
        ) : (
          <Card style={{ paddingVertical: 6 }}>
            {breakdown.map((item) => {
              const style = categoryStyle[item.category];
              return (
                <Pressable
                  key={item.category}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.category}, ${formatCurrency(item.total)}, ${Math.round(item.share * 100)} percent. Show transactions`}
                  onPress={() => router.navigate({ pathname: "/activity", params: { category: item.category } })}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
                >
                  <IconTile icon={style.icon} bg={style.bg} fg={style.fg} />
                  <View style={styles.rowMain}>
                    <View style={styles.rowTop}>
                      <Text variant="label" weight="semibold">
                        {item.category}
                      </Text>
                      <Money value={item.total} variant="label" weight="semibold" />
                    </View>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.fill,
                          { width: `${Math.max(4, item.share * 100)}%`, backgroundColor: categoryColor[item.category] },
                        ]}
                      />
                    </View>
                    <Text variant="caption" color={colors.inkSubtle}>
                      {Math.round(item.share * 100)}% · {item.count} {item.count === 1 ? "transaction" : "transactions"}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.inkFaint} />
                </Pressable>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  gutter: { paddingHorizontal: spacing.xl },
  content: { padding: spacing.xl, gap: spacing.xl },
  periods: { gap: 8 },
  chartCard: { alignItems: "center", gap: 18, paddingVertical: 24 },
  summary: { flexDirection: "row", alignSelf: "stretch" },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  rowMain: { flex: 1, gap: 6 },
  rowTop: { flexDirection: "row", justifyContent: "space-between" },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: "rgba(0,0,0,0.06)", overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.pill },
});
