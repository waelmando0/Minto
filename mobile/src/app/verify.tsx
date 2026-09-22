import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

import { Text } from "@/components/text";
import { Button, IconButton } from "@/components/ui";
import { CODE_LENGTH, DEMO_CODE, requestCode, verifyCode } from "@/lib/auth";
import { success, warn } from "@/lib/haptics";
import { useSession } from "@/state/session";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

const RESEND_AFTER = 30;

export default function VerifyScreen() {
  const { email = "" } = useLocalSearchParams<{ email?: string }>();
  const { signIn } = useSession();
  const insets = useSafeAreaInsets();
  const input = useRef<TextInput>(null);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_AFTER);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const submit = async (value = code) => {
    if (pending) return;
    setPending(true);
    setError(undefined);
    try {
      const session = await verifyCode(email, value);
      success();
      // The protected stack swaps to the app as soon as the session exists.
      await signIn(session);
    } catch (e) {
      warn();
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setCode("");
      input.current?.focus();
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
          Check your email
        </Text>
        <Text color={colors.inkMuted}>
          Enter the 6-digit code we sent to <Text weight="semibold">{email}</Text>.
        </Text>

        {/* One real input drives six display boxes, so paste and autofill work. */}
        <Pressable onPress={() => input.current?.focus()} style={styles.boxes} accessible={false}>
          {Array.from({ length: CODE_LENGTH }, (_, i) => {
            const active = i === code.length && !pending;
            return (
              <View
                key={i}
                style={[
                  styles.box,
                  active && { borderColor: colors.ink },
                  error ? { borderColor: colors.negative } : null,
                ]}
              >
                <Text variant="title">{code[i] ?? ""}</Text>
              </View>
            );
          })}
          <TextInput
            ref={input}
            value={code}
            onChangeText={(text) => {
              const digits = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
              setCode(digits);
              setError(undefined);
              if (digits.length === CODE_LENGTH) void submit(digits);
            }}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            autoFocus
            accessibilityLabel="Verification code"
            style={styles.hiddenInput}
            caretHidden
          />
        </Pressable>

        {error ? (
          <Text variant="caption" color={colors.negative} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <Pressable
          disabled={resendIn > 0}
          accessibilityRole="button"
          accessibilityState={{ disabled: resendIn > 0 }}
          onPress={async () => {
            await requestCode(email, { delay: 300 });
            setResendIn(RESEND_AFTER);
          }}
          style={{ alignSelf: "flex-start", paddingVertical: 6 }}
        >
          <Text variant="label" color={resendIn > 0 ? colors.inkSubtle : colors.violet}>
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </Text>
        </Pressable>

        <View style={styles.demo}>
          <Text variant="caption" color={colors.mintInk}>
            Demo build: use code <Text variant="caption" weight="bold" color={colors.mintInk}>{DEMO_CODE}</Text>
          </Text>
        </View>
      </View>

      <Button
        label={pending ? "Verifying…" : "Verify"}
        block
        disabled={pending || code.length !== CODE_LENGTH}
        onPress={() => void submit()}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  body: { flex: 1, gap: 12, marginTop: 28 },
  boxes: { flexDirection: "row", gap: 8, marginTop: 12 },
  box: {
    flex: 1,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.011,
    color: "transparent",
    fontFamily: fonts.regular,
  },
  demo: { backgroundColor: colors.mint, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8 },
});
