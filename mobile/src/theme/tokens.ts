/** Design tokens shared with the Minto website (see app/globals.css there). */
export const colors = {
  background: "#F5F5F7",
  surface: "#FFFFFF",
  surfaceMuted: "#F3F3F1",
  ink: "#141414",
  inkMuted: "#6B6B70",
  inkSubtle: "#8A8A8F",
  inkFaint: "#B5B5BA",
  border: "rgba(0,0,0,0.06)",
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
} as const;

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
