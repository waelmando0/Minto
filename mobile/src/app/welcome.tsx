import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MintoMark } from "@/components/minto-mark";
import { Text } from "@/components/text";
import { Button } from "@/components/ui";
import { colors, spacing } from "@/theme/tokens";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  // Natural height of the 439×558 plate, capped so it never climbs into the headline.
  const hillsHeight = Math.min((width * 558) / 439, height * 0.6);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Image
        source={require("../../assets/welcome-hills.webp")}
        style={[styles.hills, { height: hillsHeight }]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />

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
  root: { flex: 1, backgroundColor: "#ECE9F8" },
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
