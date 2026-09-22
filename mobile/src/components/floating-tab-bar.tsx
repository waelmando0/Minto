import { Pressable, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChartColumn, House, ReceiptText, Wallet, type LucideIcon } from "lucide-react-native";

import { Text } from "@/components/text";
import { tap } from "@/lib/haptics";
import { radius, shadow } from "@/theme/tokens";
import { makeStyles } from "@/theme/theme";

const ICONS: Record<string, LucideIcon> = {
  index: House,
  invest: ChartColumn,
  activity: ReceiptText,
  wallet: Wallet,
};

/** Height the scroll views reserve so content clears the floating bar. */
export const TAB_BAR_CLEARANCE = 96;

/** The dark floating pill from the website mockups: the active tab expands to show its label. */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = typeof options.title === "string" ? options.title : route.name;
          const Icon = ICONS[route.name] ?? House;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  tap();
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={[styles.tab, focused && styles.active]}
            >
              <Icon size={20} color={focused ? "#fff" : "rgba(255,255,255,0.55)"} strokeWidth={2} />
              {focused ? (
                <Text variant="label" weight="medium" color="#fff">
                  {label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.tabBar,
    ...shadow.floating,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    minWidth: 52,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    justifyContent: "center",
  },
  active: { backgroundColor: "rgba(255,255,255,0.12)" },
}));
