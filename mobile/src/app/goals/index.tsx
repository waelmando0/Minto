import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";

import { GoalCard } from "@/components/goal-card";
import { Money } from "@/components/money";
import { PageHeader } from "@/components/page-header";
import { Text } from "@/components/text";
import { Button, Card, IconButton } from "@/components/ui";
import { useAppState } from "@/state/app-state";
import { colors, spacing } from "@/theme/tokens";

export default function GoalsScreen() {
  const { state } = useAppState();
  const insets = useSafeAreaInsets();
  const saved = state.goals.reduce((sum, g) => sum + g.saved, 0);
  const target = state.goals.reduce((sum, g) => sum + g.target, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.gutter}>
        <PageHeader
          title="Goals"
          right={<IconButton icon={Plus} label="New goal" onPress={() => router.push("/goals/new")} />}
        />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Card style={styles.summary}>
          <Text variant="caption" color={colors.inkSubtle}>
            Saved towards your goals
          </Text>
          <Money value={saved} variant="display" />
          <View style={styles.row}>
            <Text variant="caption" color={colors.inkSubtle}>
              {"Target "}
            </Text>
            <Money value={target} variant="caption" color={colors.inkSubtle} />
          </View>
        </Card>

        {state.goals.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="heading" align="center">
              No goals yet
            </Text>
            <Text align="center" color={colors.inkMuted}>
              Pick from 12 templates, from an emergency fund to your first home.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {state.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} wide />
            ))}
          </View>
        )}

        <Button label="Create a goal" icon={Plus} onPress={() => router.push("/goals/new")} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  gutter: { paddingHorizontal: spacing.xl },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.xl },
  summary: { gap: 4 },
  row: { flexDirection: "row", alignItems: "baseline" },
  empty: { gap: 8, paddingVertical: 24 },
});
