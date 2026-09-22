import type { ReactNode } from "react";
import { Alert, Linking, Platform, Pressable, StyleSheet, Switch, View } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight, CircleHelp, CreditCard, EyeOff, LogOut, X, type LucideIcon } from "lucide-react-native";

import { Text } from "@/components/text";
import { Card, IconButton } from "@/components/ui";
import { user } from "@/data/mock";
import { tap } from "@/lib/haptics";
import { useAppState } from "@/state/app-state";
import { useSession } from "@/state/session";
import { colors, radius, spacing } from "@/theme/tokens";

const HELP_URL = "https://creatorix-w5pn.vercel.app/#faq";

function confirmSignOut(onConfirm: () => void) {
  if (Platform.OS === "web") {
    // Alert.alert has no buttons on web.
    if (globalThis.confirm?.("Sign out of Minto?")) onConfirm();
    return;
  }
  Alert.alert("Sign out of Minto?", "You'll need a new code to sign back in.", [
    { text: "Cancel", style: "cancel" },
    { text: "Sign out", style: "destructive", onPress: onConfirm },
  ]);
}

function Row({
  icon: Icon,
  label,
  onPress,
  right,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  right?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <View style={styles.rowIcon}>
        <Icon size={18} color={colors.ink} />
      </View>
      <Text variant="label" style={{ flex: 1 }}>
        {label}
      </Text>
      {right ?? <ChevronRight size={18} color={colors.inkFaint} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useSession();
  const { state, dispatch } = useAppState();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.bar}>
        <Text variant="heading" accessibilityRole="header">
          Profile
        </Text>
        <IconButton icon={X} label="Close" onPress={close} />
      </View>

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text variant="title" color="#fff">
            {initials}
          </Text>
        </View>
        <Text variant="title">{user.name}</Text>
        <Text color={colors.inkSubtle}>{session?.email ?? user.email}</Text>
      </View>

      <Card style={{ paddingVertical: 6 }}>
        <Row
          icon={EyeOff}
          label="Hide balances"
          right={
            <Switch
              value={state.balanceHidden}
              onValueChange={() => dispatch({ type: "toggleBalance" })}
              trackColor={{ true: colors.violet, false: "#D7D7DC" }}
              accessibilityLabel="Hide balances"
            />
          }
        />
        <Row
          icon={CreditCard}
          label="Accounts & payment methods"
          onPress={() => {
            close();
            router.navigate("/wallet");
          }}
        />
        <Row icon={CircleHelp} label="Help & FAQ" onPress={() => void Linking.openURL(HELP_URL)} />
      </Card>

      <Card style={{ paddingVertical: 6 }}>
        <Row
          icon={LogOut}
          label="Sign out"
          right={<View />}
          onPress={() => confirmSignOut(() => void signOut())}
        />
      </Card>

      <Text variant="caption" color={colors.inkSubtle} align="center" style={{ marginTop: "auto" }}>
        Minto {Constants.expoConfig?.version ?? ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, gap: spacing.xl },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  identity: { alignItems: "center", gap: 4 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
});
