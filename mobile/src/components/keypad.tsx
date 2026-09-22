import { Pressable, StyleSheet, View } from "react-native";
import { Delete } from "lucide-react-native";

import { Text } from "@/components/text";
import { tap } from "@/lib/haptics";
import { useColors } from "@/theme/theme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"] as const;

/** Numeric keypad for entering amounts without the system keyboard. */
export function Keypad({ onKey }: { onKey: (key: string) => void }) {
  const colors = useColors();
  return (
    <View style={styles.grid}>
      {KEYS.map((key) => (
        <Pressable
          key={key}
          accessibilityRole="button"
          accessibilityLabel={key === "back" ? "Delete" : key === "." ? "Decimal point" : key}
          onPress={() => {
            tap();
            onKey(key);
          }}
          style={({ pressed }) => [styles.key, pressed && { backgroundColor: colors.pressed }]}
        >
          {key === "back" ? (
            <Delete size={24} color={colors.ink} />
          ) : (
            <Text variant="title" weight="medium">
              {key}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap" },
  key: { width: "33.333%", height: 60, alignItems: "center", justifyContent: "center", borderRadius: 16 },
});
