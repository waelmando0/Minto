import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Text } from "@/components/text";
import { IconButton } from "@/components/ui";

/** Back button, centred title and an optional right-hand action for pushed screens. */
export function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.bar}>
      <IconButton
        icon={ArrowLeft}
        label="Back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      />
      <Text variant="heading" accessibilityRole="header" numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: { flex: 1, textAlign: "center" },
  side: { width: 40, alignItems: "flex-end" },
});
