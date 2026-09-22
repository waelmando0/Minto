import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";

import { AppStateProvider, useAppState } from "@/state/app-state";
import { SessionProvider, useSession } from "@/state/session";
import { colors } from "@/theme/tokens";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  // Fall back to system fonts rather than blocking the app if Inter fails to load.
  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <AppStateProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </AppStateProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Signed-in users get the app; everyone else only reaches the auth screens. */
function RootNavigator() {
  const { status } = useSession();
  const { ready } = useAppState();
  const loading = status === "loading" || !ready;

  useEffect(() => {
    if (!loading) void SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;
  const signedIn = status === "signedIn";

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="transaction/[id]" options={{ presentation: "modal" }} />
        <Stack.Screen name="transfer" options={{ presentation: "modal" }} />
        <Stack.Screen name="profile" options={{ presentation: "modal" }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="verify" />
      </Stack.Protected>
    </Stack>
  );
}
