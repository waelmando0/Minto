import { StyleSheet, View } from "react-native";

import { BalanceToggle, Money } from "@/components/money";
import { MintoMark } from "@/components/minto-mark";
import { Text } from "@/components/text";
import { totalBalance, useAppState } from "@/state/app-state";
import { colors, radius } from "@/theme/tokens";

/** The dark wallet with account cards tucked into it and the total balance. */
export function WalletStack() {
  const { state } = useAppState();

  return (
    <View style={styles.wallet}>
      <View style={styles.stitch}>
        <View style={styles.pocket}>
          {state.accounts.map((account, index) => (
            <View
              key={account.id}
              style={[
                styles.card,
                { backgroundColor: account.color },
                index === 0 ? { top: 10, left: 22, right: 12 } : { top: 40, left: 12, right: 18 },
              ]}
            >
              <View style={styles.cardRow}>
                <View style={styles.cardName}>
                  <MintoMark size={13} color="#fff" />
                  <Text variant="caption" weight="medium" color="#fff">
                    {account.name}
                  </Text>
                </View>
                <Money value={account.balance} variant="caption" weight="medium" color="rgba(255,255,255,0.92)" />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.total}>
          <Text variant="caption" color="rgba(255,255,255,0.45)">
            Total Balance
          </Text>
          <View style={styles.totalRow}>
            <Money value={totalBalance(state)} variant="display" color="#fff" style={styles.totalValue} />
            <BalanceToggle color="rgba(255,255,255,0.7)" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wallet: {
    backgroundColor: colors.graphite,
    borderRadius: radius.xl,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  stitch: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  pocket: { height: 72 },
  card: {
    position: "absolute",
    height: 60,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardName: { flexDirection: "row", alignItems: "center", gap: 6 },
  total: {
    backgroundColor: colors.graphite,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -6 },
    elevation: 6,
  },
  totalRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  totalValue: { fontSize: 30, lineHeight: 36 },
});
