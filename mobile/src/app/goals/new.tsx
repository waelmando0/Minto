import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PageHeader } from "@/components/page-header";
import { Text } from "@/components/text";
import { Button } from "@/components/ui";
import { goalTemplates, validateGoal, type GoalTemplate } from "@/data/goals";
import { success, tap, warn } from "@/lib/haptics";
import { useAppState } from "@/state/app-state";
import { fonts, radius, spacing } from "@/theme/tokens";
import { makeStyles, useColors } from "@/theme/theme";

export default function NewGoalScreen() {
  const colors = useColors();
  const styles = useStyles();
  const { dispatch } = useAppState();
  const insets = useSafeAreaInsets();
  const [template, setTemplate] = useState<GoalTemplate>(goalTemplates[0]);
  const [name, setName] = useState(goalTemplates[0].name);
  const [nameEdited, setNameEdited] = useState(false);
  const [target, setTarget] = useState(String(goalTemplates[0].suggested));
  const [error, setError] = useState<string>();

  const pick = (next: GoalTemplate) => {
    tap();
    setTemplate(next);
    if (!nameEdited) setName(next.name);
    setTarget(String(next.suggested));
    setError(undefined);
  };

  const create = () => {
    const message = validateGoal(name, target);
    if (message) {
      warn();
      setError(message);
      return;
    }
    const id = `g${Date.now()}`;
    dispatch({
      type: "createGoal",
      goal: { id, name: name.trim(), template: template.id, target: Number(target), saved: 0, createdAt: new Date().toISOString() },
    });
    success();
    router.replace({ pathname: "/goals/[id]", params: { id } });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 12 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.gutter}>
        <PageHeader title="New goal" />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="label" color={colors.inkMuted}>
          Choose a template
        </Text>
        <View style={styles.grid} accessibilityRole="radiogroup">
          {goalTemplates.map((t) => {
            const selected = t.id === template.id;
            const Icon = t.icon;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={t.name}
                onPress={() => pick(t)}
                style={[styles.template, selected && { borderColor: t.color, backgroundColor: t.bg }]}
              >
                <Icon size={22} color={t.color} />
                <Text variant="caption" weight="medium" align="center" numberOfLines={1}>
                  {t.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.field}>
          <Text variant="label" color={colors.inkMuted}>
            Name
          </Text>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameEdited(true);
              setError(undefined);
            }}
            accessibilityLabel="Goal name"
            maxLength={40}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text variant="label" color={colors.inkMuted}>
            Target
          </Text>
          <View style={styles.amount}>
            <Text variant="heading" color={colors.inkSubtle}>
              $
            </Text>
            <TextInput
              value={target}
              onChangeText={(text) => {
                setTarget(text.replace(/[^\d.]/g, ""));
                setError(undefined);
              }}
              accessibilityLabel="Target amount in dollars"
              keyboardType="decimal-pad"
              style={[styles.input, styles.amountInput]}
            />
          </View>
        </View>

        {error ? (
          <Text variant="caption" color={colors.negative} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </ScrollView>
      <View style={[styles.gutter, { paddingBottom: insets.bottom + 16 }]}>
        <Button label="Create goal" block onPress={create} />
      </View>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.background },
  gutter: { paddingHorizontal: spacing.xl },
  content: { padding: spacing.xl, gap: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  template: {
    width: "31%",
    flexGrow: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  field: { gap: 8 },
  input: {
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  amount: { flexDirection: "row", alignItems: "center", gap: 8 },
  amountInput: { flex: 1 },
}));
