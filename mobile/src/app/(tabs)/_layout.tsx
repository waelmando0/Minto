import { Tabs } from "expo-router";

import { FloatingTabBar } from "@/components/floating-tab-bar";
import { useColors } from "@/theme/theme";

export default function TabsLayout() {
  const colors = useColors();
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
