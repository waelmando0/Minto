import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, render, screen } from "@testing-library/react-native";
import { useEffect } from "react";
import { Text } from "react-native";
import * as ReactNative from "react-native";

import { makeStyles, ThemeProvider, useTheme } from "@/theme/theme";
import { darkColors, lightColors } from "@/theme/tokens";

const useCardStyles = makeStyles((colors) => ({ card: { backgroundColor: colors.surface } }));

const api = {} as { theme: ReturnType<typeof useTheme> };

function Probe() {
  const theme = useTheme();
  const styles = useCardStyles();
  useEffect(() => {
    api.theme = theme;
  });
  return (
    <Text testID="probe" style={styles.card}>
      {theme.ready ? `${theme.preference}:${theme.scheme}` : "loading"}
    </Text>
  );
}

const renderTheme = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

describe("ThemeProvider", () => {
  it("follows the OS setting by default", async () => {
    jest.spyOn(ReactNative, "useColorScheme").mockReturnValue("dark");
    await renderTheme();
    expect(await screen.findByText("system:dark")).toBeTruthy();
    expect(screen.getByTestId("probe")).toHaveStyle({ backgroundColor: darkColors.surface });
  });

  it("saves an explicit preference and restores it on the next launch", async () => {
    jest.spyOn(ReactNative, "useColorScheme").mockReturnValue("light");
    await renderTheme();
    await screen.findByText("system:light");
    expect(screen.getByTestId("probe")).toHaveStyle({ backgroundColor: lightColors.surface });

    await act(async () => api.theme.setPreference("dark"));
    expect(screen.getByText("dark:dark")).toBeTruthy();
    expect(screen.getByTestId("probe")).toHaveStyle({ backgroundColor: darkColors.surface });
    expect(await AsyncStorage.getItem("minto.theme")).toBe("dark");

    await screen.unmount();
    await renderTheme();
    expect(await screen.findByText("dark:dark")).toBeTruthy();
  });

  it("ignores an unknown saved value", async () => {
    await AsyncStorage.setItem("minto.theme", "sepia");
    jest.spyOn(ReactNative, "useColorScheme").mockReturnValue("light");
    await renderTheme();
    expect(await screen.findByText("system:light")).toBeTruthy();
  });
});
