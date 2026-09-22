import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { Text } from "@/components/text";
import { SectionHeader } from "@/components/ui";
import { quickActions } from "@/data/mock";
import { tap } from "@/lib/haptics";
import { colors, radius, shadow } from "@/theme/tokens";

export function QuickActions() {
  return (
    <View>
      <SectionHeader title="Quick Action" action="Customize" />
      <View style={styles.row}>
        {quickActions.map(({ label, icon: Icon, action }) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => {
              tap();
              if ("transfer" in action) router.push({ pathname: "/transfer", params: { kind: action.transfer } });
              else router.navigate(action.href);
            }}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.tile}>
              <Icon size={22} color={colors.blue} strokeWidth={2} />
              <View style={styles.dot} />
            </View>
            <Text variant="caption" color={colors.inkMuted}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  item: { alignItems: "center", gap: 8, width: 60 },
  tile: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  dot: {
    position: "absolute",
    right: 11,
    bottom: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
