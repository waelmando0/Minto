import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_CLEARANCE } from "@/components/floating-tab-bar";
import { colors, spacing } from "@/theme/tokens";

interface ScreenProps {
  children: ReactNode;
  /** Pinned content above the scroll area, e.g. a search field. */
  header?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}

/** Tab screen scaffold: safe-area top, horizontal gutter and room for the floating tab bar. */
export function Screen({ children, header, refreshing, onRefresh }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {header}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_CLEARANCE + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, gap: spacing.xxl },
});
