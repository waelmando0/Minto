import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Bell, CircleUserRound } from "lucide-react-native";

import { GoalCard } from "@/components/goal-card";
import { QuickActions } from "@/components/quick-actions";
import { Screen } from "@/components/screen";
import { Text } from "@/components/text";
import { TransactionRow } from "@/components/transaction-row";
import { Card, IconButton, SectionHeader } from "@/components/ui";
import { WalletStack } from "@/components/wallet-stack";
import { user } from "@/data/mock";
import { useAppState } from "@/state/app-state";
import { colors } from "@/theme/tokens";

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return "Good Morning,";
  if (hour < 18) return "Good Afternoon,";
  return "Good Evening,";
}

export default function HomeScreen() {
  const { state } = useAppState();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
      }}
    >
      <View style={styles.header}>
        <View>
          <Text variant="caption" color={colors.inkSubtle}>
            {greeting()}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {user.name}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton icon={Bell} label="Notifications" onPress={() => router.navigate("/activity")} />
          <IconButton icon={CircleUserRound} label="Profile" onPress={() => router.push("/profile")} />
        </View>
      </View>

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
