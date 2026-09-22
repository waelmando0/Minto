import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from "react-native";

import { colors, fonts } from "@/theme/tokens";

const variants = StyleSheet.create({
  display: { fontFamily: fonts.medium, fontSize: 34, letterSpacing: -1.2, lineHeight: 38 },
  title: { fontFamily: fonts.semibold, fontSize: 22, letterSpacing: -0.5, lineHeight: 28 },
  heading: { fontFamily: fonts.semibold, fontSize: 16, letterSpacing: -0.2, lineHeight: 21 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 19 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  micro: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },
});

export type TextVariant = keyof typeof variants;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  weight?: keyof typeof fonts;
  align?: "left" | "center" | "right";
}

/** Inter-based text with the app's type scale. */
export function Text({ variant = "body", color = colors.ink, weight, align, style, ...props }: TextProps) {
  return (
    <RNText
      {...props}
      style={[
        variants[variant],
        { color },
        weight && { fontFamily: fonts[weight] },
        align && { textAlign: align },
        style,
      ]}
    />
  );
}
