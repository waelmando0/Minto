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
import { colors, radius } from "@/theme/tokens";

export default function InvestScreen() {
  const { state } = useAppState();
  const [range, setRange] = useState<Range>("1M");
  const current = ranges[range];
  const up = current.change >= 0;
  const Trend = up ? TrendingUp : TrendingDown;
  const assets = state.accounts.find((a) => a.id === "investment")?.balance ?? 0;

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
          <View style={styles.change}>
            <View style={[styles.badge, { backgroundColor: up ? colors.violet : colors.negative }]}>
              <Trend size={12} color="#fff" strokeWidth={3} />
            </View>
            <Text variant="label" weight="semibold" color={up ? colors.violet : colors.negative}>
              {`${up ? "+" : ""}${current.change}%`}
            </Text>
          </View>
        </View>
        <Text variant="caption" color={colors.inkSubtle} style={{ marginTop: -12 }}>
          {current.label}
        </Text>
        <CandleChart
          seed={current.seed}
          label={`Portfolio performance, ${range}: ${up ? "up" : "down"} ${Math.abs(current.change)} percent`}
        />
        <RangeTabs value={range} onChange={setRange} />
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
        <SectionHeader title="Portfolio" action="Manage" />
        <View style={{ marginTop: 6 }}>
          {holdings.map((holding) => (
            <HoldingRow key={holding.id} holding={holding} />
          ))}
        </View>
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
