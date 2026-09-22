import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { Text } from "@/components/text";
import { tap } from "@/lib/haptics";
import { colors, radius, shadow, spacing } from "@/theme/tokens";

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Row title with an optional violet text action ("See All", "Manage"). */
export function SectionHeader({
  title,
  action,
  onAction,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text variant="heading">{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text variant="label" color={colors.violet}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface IconButtonProps extends Omit<PressableProps, "children"> {
  icon: LucideIcon;
  label: string;
  size?: number;
  tone?: "light" | "dark";
}

/** Round icon button, e.g. the notification bell. */
export function IconButton({ icon: Icon, label, size = 40, tone = "light", onPress, ...props }: IconButtonProps) {
  const dark = tone === "dark";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={(e) => {
        tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.iconButton,
        { width: size, height: size, backgroundColor: dark ? colors.graphiteRaised : colors.surface },
        !dark && shadow.card,
        pressed && styles.pressed,
      ]}
      {...props}
    >
      <Icon size={size * 0.45} color={dark ? "#fff" : colors.ink} strokeWidth={2} />
    </Pressable>
  );
}

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  tone?: "dark" | "light" | "violet";
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  block?: boolean;
}

/** Pill button used for primary and secondary actions. */
export function Button({ label, tone = "dark", icon: Icon, style, block, disabled, onPress, ...props }: ButtonProps) {
  const palette = {
    dark: { bg: colors.ink, fg: "#fff" },
    light: { bg: colors.surface, fg: colors.violet },
    violet: { bg: colors.violet, fg: "#fff" },
  }[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={(e) => {
        tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg },
        tone === "light" && shadow.card,
        block && { alignSelf: "stretch" },
        disabled && { opacity: 0.4 },
        pressed && styles.pressed,
        style,
      ]}
      {...props}
    >
      {Icon ? <Icon size={16} color={palette.fg} strokeWidth={2.4} /> : null}
      <Text variant="label" weight="semibold" color={palette.fg}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Filter chip. */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? colors.ink : colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <Text variant="label" color={selected ? "#fff" : colors.inkMuted}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Square tile holding an icon, used for merchants, holdings and banks. */
export function IconTile({
  icon: Icon,
  bg,
  fg,
  size = 40,
  mark,
}: {
  icon?: LucideIcon;
  bg: string;
  fg: string;
  size?: number;
  mark?: string;
}) {
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: bg, borderRadius: size * 0.3 }]}>
      {Icon ? <Icon size={size * 0.46} color={fg} strokeWidth={2} /> : null}
      {mark ? (
        <Text variant="heading" weight="bold" color={fg}>
          {mark}
        </Text>
      ) : null}
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
  button: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
  tile: { alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
