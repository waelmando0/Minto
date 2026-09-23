import { render, screen } from "@testing-library/react-native";

/*
 * The Wallet's banks and "Receive money" details are samples. Real
 * (Supabase) accounts must never show them: someone could share the fake
 * account and routing numbers to get paid.
 */

let mockMode: "demo" | "supabase" = "demo";

jest.mock("@/state/app-state", () => {
  const { initialState } = jest.requireActual("@/state/app-state");
  return {
    useAppState: () => ({
      state: { ...initialState, displayName: "Alice Doe" },
      dispatch: jest.fn(),
      actions: {},
      ready: true,
      mode: mockMode,
      sync: { state: "idle" },
    }),
  };
});

jest.mock("react-native-safe-area-context", () => {
  const { View } = jest.requireActual("react-native");
  return {
    SafeAreaView: View,
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

/* eslint-disable import/first */
import WalletScreen from "@/app/(tabs)/wallet";
/* eslint-enable import/first */

describe("Wallet", () => {
  it("shows sample banks and bank details in the demo", async () => {
    mockMode = "demo";
    await render(<WalletScreen />);
    expect(screen.getByText("Chase Bank")).toBeTruthy();
    expect(screen.getByText("4829 1047 2207")).toBeTruthy();
    expect(screen.getByText("Alice Doe")).toBeTruthy();
  });

  it("never shows sample banks or bank details for a real account", async () => {
    mockMode = "supabase";
    await render(<WalletScreen />);
    expect(screen.queryByText("Chase Bank")).toBeNull();
    expect(screen.queryByText("4829 1047 2207")).toBeNull();
    expect(screen.queryByText("026 073 150")).toBeNull();
    expect(screen.queryByText("Share details")).toBeNull();
    expect(screen.getByText(/No bank accounts linked yet/)).toBeTruthy();
    expect(screen.getByText(/aren't available yet/)).toBeTruthy();
  });
});
