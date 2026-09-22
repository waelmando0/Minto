import { Tabs } from "expo-router";

import { FloatingTabBar } from "@/components/floating-tab-bar";
import { colors } from "@/theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="invest" options={{ title: "Invest" }} />
      <Tabs.Screen name="activity" options={{ title: "Activity" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
    </Tabs>
  );
}
