import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { CircleMinus, CirclePlus, TrendingDown, TrendingUp } from "lucide-react-native";

import { CandleChart } from "@/components/candle-chart";
import { HoldingRow } from "@/components/holding-row";
import { BalanceToggle, Money } from "@/components/money";
import { RangeTabs } from "@/components/range-tabs";
import { Screen } from "@/components/screen";
import { Text } from "@/components/text";
import { Button, Card, SectionHeader } from "@/components/ui";
import { holdings, ranges, type Range } from "@/data/mock";
import { useAppState } from "@/state/app-state";
import { radius } from "@/theme/tokens";
import { useColors } from "@/theme/theme";

export default function InvestScreen() {
  const colors = useColors();
  const { state, mode } = useAppState();
  const [range, setRange] = useState<Range>("1M");
  const current = ranges[range];
  const up = current.change >= 0;
  const Trend = up ? TrendingUp : TrendingDown;
  const assets = state.accounts.find((a) => a.id === "investment")?.balance ?? 0;
  // The chart and holdings are sample data: show them only in the demo, and only
  // when something is invested. Real accounts see an honest empty state.
  const invested = mode === "demo" && assets > 0;

  return (
    <Screen>
      <Text variant="title" accessibilityRole="header" style={{ paddingTop: 8 }}>
        Overview
      </Text>

      <Card style={{ gap: 18 }}>
        <View style={styles.summary}>
          <View style={{ gap: 4 }}>
            <Text variant="caption" color={colors.inkSubtle}>
              Investment Assets
            </Text>
            <View style={styles.valueRow}>
              <Money value={assets} variant="display" />
              <BalanceToggle color={colors.inkSubtle} />
            </View>
          </View>
          {invested ? (
            <View style={styles.change}>
              <View style={[styles.badge, { backgroundColor: up ? colors.violet : colors.negative }]}>
                <Trend size={12} color="#fff" strokeWidth={3} />
              </View>
              <Text variant="label" weight="semibold" color={up ? colors.violet : colors.negative}>
                {`${up ? "+" : ""}${current.change}%`}
              </Text>
            </View>
          ) : null}
        </View>
        {invested ? (
          <>
            <Text variant="caption" color={colors.inkSubtle} style={{ marginTop: -12 }}>
              {current.label}
            </Text>
            <CandleChart
              seed={current.seed}
              label={`Portfolio performance, ${range}: ${up ? "up" : "down"} ${Math.abs(current.change)} percent`}
            />
            <RangeTabs value={range} onChange={setRange} />
          </>
        ) : (
          <Text variant="caption" color={colors.inkMuted} style={{ marginTop: -8 }}>
            {assets > 0
              ? "Performance history isn't available for this account yet."
              : "You haven't invested yet. Deposit cash below to start building your portfolio."}
          </Text>
        )}
      </Card>

      <Card style={{ gap: 14 }}>
        <View>
          <Text variant="caption" color={colors.inkSubtle}>
            Investment Cash
          </Text>
          <Money value={state.investmentCash} variant="title" style={{ fontSize: 26, lineHeight: 32 }} />
        </View>
        <View style={styles.cashActions}>
          <Button
            label="Deposit"
            tone="light"
            icon={CirclePlus}
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: "/transfer", params: { kind: "deposit" } })}
          />
          <Button
            label="Withdraw"
            tone="light"
            icon={CircleMinus}
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: "/transfer", params: { kind: "withdraw" } })}
          />
        </View>
      </Card>

      <Card>
        <SectionHeader title="Portfolio" action={invested ? "Manage" : undefined} />
        {invested ? (
          <View style={{ marginTop: 6 }}>
            {holdings.map((holding) => (
              <HoldingRow key={holding.id} holding={holding} />
            ))}
          </View>
        ) : (
          <Text variant="caption" color={colors.inkMuted} style={{ marginTop: 10 }}>
            Your funds and returns will show up here once you invest.
          </Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  change: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 4 },
  badge: { width: 18, height: 18, borderRadius: radius.sm / 2, alignItems: "center", justifyContent: "center" },
  cashActions: { flexDirection: "row", gap: 12 },
});
