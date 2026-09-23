import { useState } from "react";
import { TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CircleCheck, X } from "lucide-react-native";

import { Keypad } from "@/components/keypad";
import { Money } from "@/components/money";
import { Text } from "@/components/text";
import { Button, IconButton } from "@/components/ui";
import { transferLimits, type TransferKind } from "@/data/mock";
import { applyKey, formatAmountInput, formatCurrency, validateAmount } from "@/lib/format";
import { success, warn } from "@/lib/haptics";
import { availableFor, transferConfig, useAppState } from "@/state/app-state";
import { fonts, radius, spacing } from "@/theme/tokens";
import { makeStyles, useColors } from "@/theme/theme";

const KINDS: TransferKind[] = ["send", "topup", "deposit", "withdraw", "goal"];

/** Amount-entry sheet shared by Send, Top Up, Deposit and Withdraw. */
export default function TransferScreen() {
  const colors = useColors();
  const styles = useStyles();
  const params = useLocalSearchParams<{ kind?: string; goalId?: string }>();
  const kind: TransferKind = KINDS.includes(params.kind as TransferKind) ? (params.kind as TransferKind) : "send";
  const config = transferConfig[kind];
  const { state, actions } = useAppState();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string>();
  const [done, setDone] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  const goal = kind === "goal" ? state.goals.find((g) => g.id === params.goalId) : undefined;
  const available = availableFor(state, kind);
  const remaining = goal ? Math.round((goal.target - goal.saved) * 100) / 100 : undefined;
  const title = goal ? `Add to ${goal.name}` : config.title;
  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const submit = async () => {
    if (pending) return;
    const message =
      (kind === "goal" && !goal ? "This goal no longer exists" : undefined) ??
      validateAmount(amount, { ...transferLimits, available }) ??
      (remaining !== undefined && Number(amount) > remaining
        ? `Only ${formatCurrency(remaining)} left to reach this goal`
        : undefined) ??
      (kind === "send" && !recipient.trim() ? "Add who you're sending to" : undefined);
    if (message) {
      warn();
      setError(message);
      return;
    }
    const value = Number(amount);
    setPending(true);
    try {
      await actions.transfer({
        kind,
        amount: value,
        counterparty: kind === "send" ? recipient : undefined,
        goalId: goal?.id,
      });
      success();
      setDone(value);
    } catch (e) {
      warn();
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  if (done !== null) {
    return (
      <View style={[styles.root, styles.done, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.doneBody}>
          <CircleCheck size={64} color={colors.positive} strokeWidth={1.8} />
          <Text variant="title" align="center" accessibilityRole="header">
            {config.verb} complete
          </Text>
          <Text align="center" color={colors.inkMuted}>
            {formatCurrency(done)}{" "}
            {goal
              ? `added to ${goal.name}`
              : kind === "send" && recipient.trim()
                ? `sent to ${recipient.trim()}`
                : "has been processed"}
            .
          </Text>
        </View>
        <Button label="Done" block onPress={close} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.bar}>
        <Text variant="heading" accessibilityRole="header" numberOfLines={1} style={{ flex: 1 }}>
          {title}
        </Text>
        <IconButton icon={X} label="Close" onPress={close} />
      </View>

      {kind === "send" ? (
        <TextInput
          value={recipient}
          onChangeText={(text) => {
            setRecipient(text);
            setError(undefined);
          }}
          placeholder="Recipient name or @handle"
          placeholderTextColor={colors.inkSubtle}
          accessibilityLabel="Recipient"
          style={styles.recipient}
          autoCapitalize="words"
        />
      ) : null}

      <View style={styles.amountBox} accessibilityLiveRegion="polite">
        <Text variant="caption" color={colors.inkSubtle}>
          Enter Amount
        </Text>
        <View style={styles.amountRow} accessible accessibilityLabel={`Amount ${amount || "0"} dollars`}>
          <Text style={styles.currency} color={colors.inkFaint}>
            $
          </Text>
          <Text style={styles.amount} color={amount ? colors.ink : colors.inkFaint}>
            {formatAmountInput(amount)}
          </Text>
        </View>
        <Text variant="caption" color={error ? colors.negative : colors.inkSubtle} align="center">
          {error ?? `Min. ${formatCurrency(transferLimits.min)} · Max. ${formatCurrency(transferLimits.max)} per transaction`}
        </Text>
        {available !== undefined ? (
          <View style={styles.available}>
            <Text variant="caption" color={colors.inkSubtle}>
              Available:
            </Text>
            <Money value={available} variant="caption" weight="semibold" color={colors.violet} />
            {remaining !== undefined ? (
              <>
                <Text variant="caption" color={colors.inkSubtle}>
                  {" · Left to save:"}
                </Text>
                <Money value={remaining} variant="caption" weight="semibold" color={colors.violet} />
              </>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={{ gap: spacing.lg }}>
        <Keypad
          onKey={(key) => {
            setAmount((current) => applyKey(current, key));
            setError(undefined);
          }}
        />
        <Button label={pending ? "Processing…" : config.verb} block disabled={pending} onPress={() => void submit()} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, justifyContent: "space-between" },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  recipient: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  amountBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
  },
  amountRow: { flexDirection: "row", alignItems: "flex-start", gap: 4 },
  currency: { fontFamily: fonts.medium, fontSize: 28, lineHeight: 44 },
  amount: { fontFamily: fonts.medium, fontSize: 48, lineHeight: 56, letterSpacing: -1.5 },
  available: { flexDirection: "row", alignItems: "center", gap: 4 },
  done: { justifyContent: "space-between" },
  doneBody: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
}));
