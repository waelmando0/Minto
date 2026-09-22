import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { Money } from "@/components/money";
import { ProgressRing } from "@/components/progress-ring";
import { Text } from "@/components/text";
import { goalProgress, templateById, type Goal } from "@/data/goals";
import { colors, radius, shadow } from "@/theme/tokens";

/** Compact goal tile used on Home and in the Goals list. */
export function GoalCard({ goal, wide }: { goal: Goal; wide?: boolean }) {
  const template = templateById(goal.template);
  const Icon = template.icon;
  const progress = goalProgress(goal);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${goal.name}, ${Math.round(progress * 100)} percent saved`}
      onPress={() => router.push({ pathname: "/goals/[id]", params: { id: goal.id } })}
      style={({ pressed }) => [styles.card, wide ? styles.wide : styles.compact, pressed && { opacity: 0.8 }]}
    >
      <ProgressRing progress={progress} color={template.color} track={template.bg} size={52} stroke={5}>
        <Icon size={20} color={template.color} />
      </ProgressRing>
      <View style={{ gap: 2, flex: wide ? 1 : undefined }}>
        <Text variant="label" weight="semibold" numberOfLines={1}>
          {goal.name}
        </Text>
        <View style={styles.amounts}>
          <Money value={goal.saved} variant="caption" weight="semibold" />
          <Text variant="caption" color={colors.inkSubtle}>
            {" of "}
          </Text>
          <Money value={goal.target} variant="caption" color={colors.inkSubtle} />
        </View>
      </View>
      {wide ? (
        <Text variant="label" weight="semibold" color={template.color}>
          {Math.round(progress * 100)}%
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, ...shadow.card },
  compact: { width: 168, gap: 12 },
  wide: { flexDirection: "row", alignItems: "center", gap: 14 },
  amounts: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" },
});
