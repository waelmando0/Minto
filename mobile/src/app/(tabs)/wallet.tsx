import { Pressable, Share, View } from "react-native";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { Check, Copy, Share2 } from "lucide-react-native";

import { MintoMark } from "@/components/minto-mark";
import { Money } from "@/components/money";
import { Screen } from "@/components/screen";
import { Text } from "@/components/text";
import { Button, Card, IconTile, SectionHeader } from "@/components/ui";
import { paymentMethods, user } from "@/data/mock";
import { tap } from "@/lib/haptics";
import { useAppState } from "@/state/app-state";
import { radius } from "@/theme/tokens";
import { makeStyles, useColors } from "@/theme/theme";

const RECEIVE_DETAILS = [
  { label: "Account holder", value: user.name },
  { label: "Account number", value: "4829 1047 2207" },
  { label: "Routing number", value: "026 073 150" },
];

export default function WalletScreen() {
  const colors = useColors();
  const styles = useStyles();
  const { state, dispatch } = useAppState();
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <Screen>
      <Text variant="title" accessibilityRole="header" style={{ paddingTop: 8 }}>
        Wallet
      </Text>

      <View style={{ gap: 12 }}>
        {state.accounts.map((account) => (
          <View key={account.id} style={[styles.accountCard, { backgroundColor: account.color }]} accessible>
            <View style={styles.accountTop}>
              <View style={styles.row}>
                <MintoMark size={18} color="#fff" />
                <Text variant="label" weight="semibold" color="#fff">
                  {account.name}
                </Text>
              </View>
              <Text variant="caption" color="rgba(255,255,255,0.85)">
                •••• {account.last4}
              </Text>
            </View>
            <View>
              <Text variant="caption" color="rgba(255,255,255,0.8)">
                Available balance
              </Text>
              <Money value={account.balance} variant="display" color="#fff" style={{ fontSize: 28, lineHeight: 34 }} />
            </View>
          </View>
        ))}
      </View>

      <Card>
        <SectionHeader title="Payment methods" />
        <View style={{ marginTop: 8 }} accessibilityRole="radiogroup">
          {paymentMethods.map((method) => {
            const selected = method.id === state.paymentMethodId;
            return (
              <Pressable
                key={method.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${method.bank}, ${method.account}`}
                onPress={() => {
                  tap();
                  dispatch({ type: "selectPaymentMethod", id: method.id });
                }}
                style={({ pressed }) => [styles.method, pressed && { opacity: 0.6 }]}
              >
                <IconTile bg={method.color} fg="#fff" mark={method.mark} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="label" weight="semibold">
                    {method.bank}
                  </Text>
                  <Text variant="caption" color={colors.inkSubtle}>
                    {method.account}
                  </Text>
                </View>
                <View style={[styles.radio, selected && { borderColor: colors.violet }]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <SectionHeader title="Receive money" />
        <Text variant="caption" color={colors.inkSubtle}>
          Share these details to get paid into your Personal account.
        </Text>
        {RECEIVE_DETAILS.map((d) => (
          <Pressable
            key={d.label}
            accessibilityRole="button"
            accessibilityLabel={`Copy ${d.label}: ${d.value}`}
            onPress={() => {
              tap();
              void Clipboard.setStringAsync(d.value);
              setCopied(d.label);
              setTimeout(() => setCopied((current) => (current === d.label ? null : current)), 1500);
            }}
            style={({ pressed }) => [styles.detail, pressed && { opacity: 0.6 }]}
          >
            <Text variant="caption" color={colors.inkSubtle}>
              {d.label}
            </Text>
            <View style={styles.row}>
              <Text variant="label" weight="semibold">
                {d.value}
              </Text>
              {copied === d.label ? (
                <Check size={14} color={colors.positive} />
              ) : (
                <Copy size={14} color={colors.inkFaint} />
              )}
            </View>
          </Pressable>
        ))}
        <Button
          label="Share details"
          icon={Share2}
          onPress={() =>
            void Share.share({
              message: RECEIVE_DETAILS.map((d) => `${d.label}: ${d.value}`).join("\n"),
            })
          }
        />
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  accountCard: { borderRadius: radius.xl, padding: 20, height: 170, justifyContent: "space-between" },
  accountTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  method: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.radioOff,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.violet },
  detail: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
}));
