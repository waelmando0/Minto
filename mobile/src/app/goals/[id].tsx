import { Alert, Platform, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CirclePlus, Trash2 } from "lucide-react-native";

import { Money } from "@/components/money";
import { PageHeader } from "@/components/page-header";
import { ProgressRing } from "@/components/progress-ring";
import { Text } from "@/components/text";
import { TransactionRow } from "@/components/transaction-row";
import { Button, Card, IconButton } from "@/components/ui";
import { goalProgress, templateById } from "@/data/goals";
import { formatCurrency } from "@/lib/format";
import { useAppState } from "@/state/app-state";
import { spacing } from "@/theme/tokens";
import { makeStyles, useColors } from "@/theme/theme";

function confirmDelete(name: string, saved: number, onConfirm: () => void) {
  const message =
    saved > 0 ? `${formatCurrency(saved)} goes back to your Personal account.` : "This goal has no savings yet.";
  if (Platform.OS === "web") {
    if (globalThis.confirm?.(`Close “${name}”?\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(`Close “${name}”?`, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Close goal", style: "destructive", onPress: onConfirm },
  ]);
}

export default function GoalDetailScreen() {
  const colors = useColors();
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useAppState();
  const insets = useSafeAreaInsets();
  const goal = state.goals.find((g) => g.id === id);

  if (!goal) {
    return (
      <View style={[styles.root, styles.gutter, { paddingTop: insets.top + 12 }]}>
        <PageHeader title="Goal" />
        <Text align="center" color={colors.inkSubtle} style={{ marginTop: 40 }}>
          This goal no longer exists.
        </Text>
      </View>
    );
  }

  const template = templateById(goal.template);
  const Icon = template.icon;
  const progress = goalProgress(goal);
  const remaining = Math.max(0, goal.target - goal.saved);
  const complete = remaining === 0;
  const history = state.transactions.filter((t) => t.category === "Savings" && t.merchant === goal.name);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.gutter}>
        <PageHeader
          title={goal.name}
          right={
            <IconButton
              icon={Trash2}
              label="Close goal"
              onPress={() =>
                confirmDelete(goal.name, goal.saved, () => {
                  dispatch({ type: "deleteGoal", id: goal.id });
                  if (router.canGoBack()) router.back();
                  else router.replace("/goals");
                })
              }
            />
          }
        />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.hero}>
          <ProgressRing progress={progress} size={180} stroke={14} color={template.color} track={template.bg}>
            <Icon size={28} color={template.color} />
            <Text variant="title" style={{ marginTop: 6 }}>
              {Math.round(progress * 100)}%
            </Text>
          </ProgressRing>
          <Money value={goal.saved} variant="display" />
          <View style={styles.row}>
            <Text color={colors.inkSubtle}>{"saved of "}</Text>
            <Money value={goal.target} color={colors.inkSubtle} />
          </View>
        </View>

        <Card style={styles.stats}>
          <View style={styles.stat}>
            <Text variant="caption" color={colors.inkSubtle}>
              Left to save
            </Text>
            <Money value={remaining} variant="heading" />
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text variant="caption" color={colors.inkSubtle}>
              Category
            </Text>
            <Text variant="heading">{template.name}</Text>
          </View>
        </Card>

        {complete ? (
          <Card style={{ backgroundColor: colors.mint }}>
            <Text variant="label" weight="semibold" color={colors.mintInk} align="center">
              Goal reached. Nicely done!
            </Text>
          </Card>
        ) : (
          <Button
            label="Add money"
            icon={CirclePlus}
            onPress={() => router.push({ pathname: "/transfer", params: { kind: "goal", goalId: goal.id } })}
          />
        )}

        {history.length > 0 ? (
          <Card>
            <Text variant="heading">History</Text>
            <View style={{ marginTop: 6 }}>
              {history.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.background },
  gutter: { paddingHorizontal: spacing.xl },
  content: { padding: spacing.xl, gap: spacing.xl },
  hero: { alignItems: "center", gap: 8 },
  row: { flexDirection: "row", alignItems: "baseline" },
  stats: { flexDirection: "row", alignItems: "center" },
  stat: { flex: 1, gap: 4, alignItems: "center" },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border },
}));
