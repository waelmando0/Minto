import { Pressable, StyleSheet, View } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { Text, type TextProps } from "@/components/text";
import { formatCurrency, maskCurrency } from "@/lib/format";
import { tap } from "@/lib/haptics";
import { useAppState } from "@/state/app-state";

/** A balance that respects the global "hide balances" toggle. */
export function Money({ value, signed, ...props }: TextProps & { value: number; signed?: boolean }) {
  const { state } = useAppState();
  const text = formatCurrency(value, { signed });
  return (
    <Text {...props} accessibilityLabel={state.balanceHidden ? "Hidden amount" : text}>
      {state.balanceHidden ? maskCurrency(text) : text}
    </Text>
  );
}

/** Eye button that hides or shows every balance in the app. */
export function BalanceToggle({ color }: { color: string }) {
  const { state, dispatch } = useAppState();
  const Icon = state.balanceHidden ? EyeOff : Eye;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={state.balanceHidden ? "Show balances" : "Hide balances"}
      hitSlop={12}
      onPress={() => {
        tap();
        dispatch({ type: "toggleBalance" });
      }}
    >
      <View style={styles.eye}>
        <Icon size={16} color={color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({ eye: { padding: 2 } });
