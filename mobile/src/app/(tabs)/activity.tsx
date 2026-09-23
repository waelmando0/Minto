import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChartPie, ChevronRight, Search, X } from "lucide-react-native";

import { Money } from "@/components/money";
import { Screen } from "@/components/screen";
import { Text } from "@/components/text";
import { TransactionRow } from "@/components/transaction-row";
import { SpendingBar } from "@/components/spending-bar";
import { Card, Chip } from "@/components/ui";
import { categoryStyle, type Category } from "@/data/mock";
import { groupByDay } from "@/lib/group";
import { spendingByCategory } from "@/lib/insights";
import { useAppState } from "@/state/app-state";
import { fonts, radius, spacing } from "@/theme/tokens";
import { makeStyles, useColors } from "@/theme/theme";

type Filter = "All" | "Income" | Category;

export default function ActivityScreen() {
  const colors = useColors();
  const styles = useStyles();
  const { state } = useAppState();
  const params = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  // Insights links here with ?category=…; apply it whenever that link changes.
  const linked = params.category && params.category in categoryStyle ? (params.category as Category) : undefined;
  const [appliedLink, setAppliedLink] = useState<Category | undefined>(undefined);
  if (linked !== appliedLink) {
    setAppliedLink(linked);
    if (linked) setFilter(linked);
  }

  const monthly = useMemo(() => spendingByCategory(state.transactions, "30d"), [state.transactions]);
  const monthlyTotal = monthly.reduce((s, c) => s + c.total, 0);

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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open spending insights"
        onPress={() => router.push("/insights")}
        style={({ pressed }) => pressed && { opacity: 0.8 }}
      >
        <Card style={styles.insights}>
          <View style={styles.insightsTop}>
            <View style={styles.insightsTitle}>
              <ChartPie size={18} color={colors.violet} />
              <Text variant="label" weight="semibold">
                Spending, last 30 days
              </Text>
            </View>
            <ChevronRight size={18} color={colors.inkFaint} />
          </View>
          <Money value={monthlyTotal} variant="title" />
          <SpendingBar items={monthly} />
          <Text variant="caption" color={colors.inkSubtle}>
            {monthly.length
              ? `Top: ${monthly
                  .slice(0, 3)
                  .map((c) => `${c.category} ${Math.round(c.share * 100)}%`)
                  .join(" · ")}`
              : "No spending yet this month."}
          </Text>
        </Card>
      </Pressable>

      {filter !== "All" ? (
        <View style={styles.activeFilter} accessibilityLiveRegion="polite">
          <Text variant="label" color={colors.inkMuted}>
            Showing: <Text variant="label" weight="semibold">{filter}</Text>
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear filter"
            hitSlop={10}
            onPress={() => setFilter("All")}
            style={styles.clear}
          >
            <X size={14} color={colors.ink} />
            <Text variant="label" weight="medium">
              Clear
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.totals}>
        <Card style={styles.total}>
          <Text variant="caption" color={colors.inkSubtle}>
            Money out
          </Text>
          <Money value={Math.abs(spent)} variant="heading" />
        </Card>
        <Card style={styles.total}>
          <Text variant="caption" color={colors.inkSubtle}>
            Money in
          </Text>
          <Money value={received} variant="heading" color={colors.positive} />
        </Card>
      </View>

      {visible.length === 0 ? (
        <Text align="center" color={colors.inkSubtle} style={{ paddingVertical: 40 }}>
          {state.transactions.length ? "No transactions match your search." : "No transactions yet."}
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

const useStyles = makeStyles((colors) => ({
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
  insights: { gap: 10 },
  activeFilter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  clear: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  insightsTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  insightsTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  total: { flex: 1, gap: 4, paddingVertical: 14 },
  day: { paddingHorizontal: 4 },
}));
