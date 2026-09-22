import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MintoMark } from "@/components/minto-mark";
import { Text } from "@/components/text";
import { Button } from "@/components/ui";
import { spacing } from "@/theme/tokens";
import { useColors } from "@/theme/theme";

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  // Natural height of the 439×558 plate, capped so it never climbs into the headline.
  const hillsHeight = Math.min((width * 558) / 439, height * 0.6);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, backgroundColor: colors.welcome }]}>
      <Image
        source={require("../../assets/welcome-hills.webp")}
        style={[styles.hills, { height: hillsHeight }]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      {/* Fades the top of the photo into the background in both light and dark themes. */}
      <Svg
        width={width}
        height={hillsHeight * 0.45}
        style={[styles.fade, { bottom: hillsHeight * 0.55 }]}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.welcome} stopOpacity={1} />
            <Stop offset="1" stopColor={colors.welcome} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#fade)" />
      </Svg>

      <View style={styles.brand}>
        <MintoMark size={26} />
        <Text variant="title">Minto</Text>
      </View>

      <View style={styles.copy}>
        <Text variant="display" align="center" style={styles.headline} accessibilityRole="header">
          Make your money work smarter for you.
        </Text>
        <Text align="center" color={colors.inkMuted}>
          Track spending, grow investments and stay in control, all in one place.
        </Text>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 20 }]}>
        <Button label="Get started" block onPress={() => router.push("/sign-in")} />
        <Button
          label="I already have an account"
          tone="light"
          block
          onPress={() => router.push({ pathname: "/sign-in", params: { returning: "1" } })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fade: { position: "absolute", left: 0, right: 0 },
  brand: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  copy: { paddingHorizontal: spacing.xxl, marginTop: 36, gap: 14 },
  headline: { fontSize: 34, lineHeight: 38 },
  // Right-hand crop of the website hero (439×558), faded into the background at the top.
  hills: { position: "absolute", left: 0, right: 0, bottom: 0, width: "100%" },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: 40,
    gap: 12,
  },
});
