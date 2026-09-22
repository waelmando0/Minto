import { fireEvent, render, screen } from "@testing-library/react-native";

import { BalanceToggle, Money } from "@/components/money";
import { AppStateProvider } from "@/state/app-state";

describe("Money", () => {
  it("hides and reveals balances from the eye toggle", async () => {
    await render(
      <AppStateProvider>
        <Money value={36862.76} />
        <BalanceToggle color="#000" />
      </AppStateProvider>,
    );

    expect(screen.getByText("$36,862.76")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Hide balances" }));
    expect(screen.getByText("$••,•••.••")).toBeTruthy();
    expect(screen.queryByText("$36,862.76")).toBeNull();

    await fireEvent.press(screen.getByRole("button", { name: "Show balances" }));
    expect(screen.getByText("$36,862.76")).toBeTruthy();
  });
});
