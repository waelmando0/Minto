import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

import { Text } from "@/components/text";
import { Button, IconButton } from "@/components/ui";
import { requestCode, validateEmail } from "@/lib/auth";
import { warn } from "@/lib/haptics";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export default function SignInScreen() {
  const { returning } = useLocalSearchParams<{ returning?: string }>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const submit = async () => {
    const message = validateEmail(email);
    if (message) {
      warn();
      setError(message);
      return;
    }
    setPending(true);
    try {
      await requestCode(email);
      router.push({ pathname: "/verify", params: { email: email.trim() } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <IconButton icon={ArrowLeft} label="Back" onPress={() => router.back()} />

      <View style={styles.body}>
        <Text variant="title" accessibilityRole="header">
          {returning ? "Welcome back" : "Create your account"}
        </Text>
        <Text color={colors.inkMuted}>
          Enter your email and we&apos;ll send you a 6-digit code. No password needed.
        </Text>

        <TextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(undefined);
          }}
          onSubmitEditing={submit}
          placeholder="you@example.com"
          placeholderTextColor={colors.inkSubtle}
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="send"
          autoFocus
          style={[styles.input, error && { borderColor: colors.negative }]}
        />
        {error ? (
          <Text variant="caption" color={colors.negative} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </View>

      <Button label={pending ? "Sending code…" : "Continue"} block disabled={pending} onPress={submit} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  body: { flex: 1, gap: 12, marginTop: 28 },
  input: {
    marginTop: 12,
    height: 54,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
});
