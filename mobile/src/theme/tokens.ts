/** Design tokens shared with the Minto website (see app/globals.css there). */
export const lightColors = {
  background: "#F5F5F7",
  surface: "#FFFFFF",
  surfaceMuted: "#F3F3F1",
  /** Secondary buttons sitting on a surface (white + shadow in light, lifted grey in dark). */
  raised: "#FFFFFF",
  ink: "#141414",
  /** Text / icons drawn on an `ink` background (e.g. primary buttons, selected chips). */
  onInk: "#FFFFFF",
  inkMuted: "#6B6B70",
  inkSubtle: "#8A8A8F",
  inkFaint: "#B5B5BA",
  border: "rgba(0,0,0,0.06)",
  /** Empty part of progress bars, rings and charts. */
  track: "rgba(0,0,0,0.07)",
  pressed: "rgba(0,0,0,0.05)",
  graphite: "#1F1F21",
  graphiteRaised: "#2C2C2E",
  tabBar: "#1C1C1E",
  mint: "#E3F2E6",
  mintInk: "#1D2B21",
  violet: "#7A4CF5",
  violetSoft: "#ECE6FE",
  positive: "#2F8A4A",
  negative: "#E5484D",
  blue: "#2F6DF6",
  orange: "#F7A531",
  radioOff: "#D7D7DC",
  welcome: "#ECE9F8",
};

export type Colors = typeof lightColors;

export const darkColors: Colors = {
  background: "#0E0E10",
  surface: "#1C1C1E",
  surfaceMuted: "#26262A",
  raised: "#2E2E33",
  ink: "#F5F5F7",
  onInk: "#0E0E10",
  inkMuted: "#A1A1A6",
  inkSubtle: "#8A8A8F",
  inkFaint: "#5A5A60",
  border: "rgba(255,255,255,0.08)",
  track: "rgba(255,255,255,0.1)",
  pressed: "rgba(255,255,255,0.08)",
  graphite: "#232326",
  graphiteRaised: "#323236",
  tabBar: "#2C2C2E",
  mint: "#1C3325",
  mintInk: "#CFEAD6",
  violet: "#9B7BFF",
  violetSoft: "#2E2346",
  positive: "#4CC36E",
  negative: "#FF6B70",
  blue: "#5B8CFF",
  orange: "#F7A531",
  radioOff: "#48484E",
  welcome: "#16141F",
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

/** Inter weights loaded in the root layout. */
export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const shadow = {
  card: {
    shadowColor: "#141428",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;
