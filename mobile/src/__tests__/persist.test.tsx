import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { act, render, screen, waitFor } from "@testing-library/react-native";
import { useEffect } from "react";
import { Text } from "react-native";

import { parseSaved, storageKey } from "@/lib/persist";
import { AppStateProvider, appReducer, initialState, totalBalance, useAppState } from "@/state/app-state";
import { SessionProvider, useSession } from "@/state/session";

const EMAIL = "rafael@minto.app";
const secureStore = SecureStore as unknown as { __store: Map<string, string> };

beforeEach(async () => {
  await AsyncStorage.clear();
  secureStore.__store.clear();
});

describe("parseSaved", () => {
  it("accepts a current save and rejects stale or malformed ones", () => {
    const good = JSON.stringify({ version: 1, state: initialState });
    expect(parseSaved(good)).toEqual(initialState);
    expect(parseSaved(null)).toBeNull();
    expect(parseSaved("not json")).toBeNull();
    expect(parseSaved(JSON.stringify({ version: 0, state: initialState }))).toBeNull();
    expect(parseSaved(JSON.stringify({ version: 1, state: { ...initialState, accounts: "x" } }))).toBeNull();
  });
});

const api = {} as { state: ReturnType<typeof useAppState>; session: ReturnType<typeof useSession> };

function Probe() {
  const state = useAppState();
  const session = useSession();
  useEffect(() => {
    api.state = state;
    api.session = session;
  });
  return <Text>{state.ready ? `ready ${totalBalance(state.state).toFixed(2)}` : "loading"}</Text>;
}

const renderApp = () =>
  render(
    <SessionProvider>
      <AppStateProvider>
        <Probe />
      </AppStateProvider>
    </SessionProvider>,
  );

describe("AppStateProvider persistence", () => {
  it("saves changes for the signed-in user and restores them on the next launch", async () => {
    await renderApp();
    await act(async () => {
      await api.session.signIn({ email: EMAIL, token: "t" });
    });
    await screen.findByText("ready 36862.76");

    await act(async () => {
      api.state.dispatch({ type: "transfer", kind: "send", amount: 250, counterparty: "Maria" });
    });
    await waitFor(async () => expect(await AsyncStorage.getItem(storageKey(EMAIL))).toContain("Maria"));

    // Simulate a restart: the session and data come back from storage.
    await screen.unmount();
    await renderApp();
    expect(await screen.findByText("ready 36612.76")).toBeTruthy();
    expect(api.state.state.transactions[0].merchant).toBe("Maria");
  });

  it("wipes the saved data and resets on sign-out", async () => {
    const changed = appReducer(initialState, { type: "transfer", kind: "topup", amount: 100 });
    await AsyncStorage.setItem(storageKey(EMAIL), JSON.stringify({ version: 1, state: changed }));
    secureStore.__store.set("minto.session", JSON.stringify({ email: EMAIL, token: "t" }));

    await renderApp();
    expect(await screen.findByText("ready 36962.76")).toBeTruthy();

    await act(async () => {
      await api.session.signOut();
    });
    await screen.findByText("ready 36862.76");
    await waitFor(async () => expect(await AsyncStorage.getItem(storageKey(EMAIL))).toBeNull());
  });
});
