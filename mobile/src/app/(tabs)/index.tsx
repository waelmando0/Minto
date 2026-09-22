import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Bell, CircleUserRound } from "lucide-react-native";

import { GoalCard } from "@/components/goal-card";
import { QuickActions } from "@/components/quick-actions";
import { Screen } from "@/components/screen";
import { Text } from "@/components/text";
import { TransactionRow } from "@/components/transaction-row";
import { Button, Card, IconButton, SectionHeader } from "@/components/ui";
import { WalletStack } from "@/components/wallet-stack";
import { user } from "@/data/mock";
import { useAppState } from "@/state/app-state";
import { useColors } from "@/theme/theme";

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return "Good Morning,";
  if (hour < 18) return "Good Afternoon,";
  return "Good Evening,";
}

export default function HomeScreen() {
  const colors = useColors();
  const { state, actions, sync } = useAppState();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        // Demo mode has nothing to fetch; keep the gesture feeling responsive.
        void Promise.all([actions.refresh(), new Promise((r) => setTimeout(r, 400))]).finally(() =>
          setRefreshing(false),
        );
      }}
    >
      <View style={styles.header}>
        <View>
          <Text variant="caption" color={colors.inkSubtle}>
            {greeting()}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {state.displayName ?? user.name}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton icon={Bell} label="Notifications" onPress={() => router.navigate("/activity")} />
          <IconButton icon={CircleUserRound} label="Profile" onPress={() => router.push("/profile")} />
        </View>
      </View>

      {sync.state === "error" ? (
        <Card style={{ gap: 10 }}>
          <Text variant="label" weight="semibold">
            Couldn&apos;t refresh your data
          </Text>
          <Text variant="caption" color={colors.inkMuted}>
            {sync.message} You&apos;re seeing the last saved copy.
          </Text>
          <Button label="Try again" tone="light" onPress={() => void actions.refresh()} />
        </Card>
      ) : null}

      <WalletStack />
      <QuickActions />

      <View style={{ gap: 12 }}>
        <SectionHeader
          title="Goals"
          action={state.goals.length ? "See All" : "Create"}
          onAction={() => router.push(state.goals.length ? "/goals" : "/goals/new")}
        />
        {state.goals.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.goals}
            style={styles.goalsScroller}
          >
            {state.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </ScrollView>
        ) : null}
      </View>

      <Card>
        <SectionHeader title="Recent Transactions" action="See All" onAction={() => router.navigate("/activity")} />
        <View style={{ marginTop: 6 }}>
          {state.transactions.slice(0, 5).map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8 },
  headerActions: { flexDirection: "row", gap: 10 },
  // Bleed the strip to the screen edges while keeping cards aligned with the gutter.
  goalsScroller: { marginHorizontal: -20 },
  goals: { gap: 12, paddingHorizontal: 20, paddingVertical: 4 },
});
