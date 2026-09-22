# Minto mobile app

The Minto app for iOS and Android, built with **Expo SDK 57** (React Native 0.86), **Expo Router**, **TypeScript**, **react-native-svg** and **Lucide** icons. It uses the same design language as the website in the repo root.

## Run it

```bash
cd mobile
npm install
npm start          # then press i (iOS simulator), a (Android emulator) or scan the QR code with Expo Go
npm run web        # the same app in a browser
```

Every library used here is part of the Expo SDK or pure JavaScript, so the app runs in **Expo Go** without a custom build.

## Checks

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint (eslint-config-expo)
npm test           # jest-expo + React Native Testing Library
```

## What's in it

| Screen | What it does |
|---|---|
| **Home** | Greeting, the wallet stack with account cards and total balance, quick actions, and recent transactions. Pull down to refresh. |
| **Invest** | Investment assets with a candlestick chart. The 1D–1Y ranges change the chart and headline change. Also investment cash with Deposit / Withdraw, and the portfolio. |
| **Activity** | Every transaction grouped by day, with search, category and income filters, and spent/received totals. |
| **Wallet** | Account cards, a selectable payment method, and receive details. Tap a detail to copy it; Share sends all of them. |
| **Transfer** (modal) | One amount sheet for Send, Top Up, Deposit and Withdraw. It has its own keypad and validates the $10–$50,000 limits and available cash. A success state follows. |
| **Transaction** (modal) | Details for any transaction row. |

The eye button on any balance hides every amount in the app. Transfers really update the balances and add a transaction, held in memory for the session.

## Structure

```
src/
  app/                 # Expo Router routes
    _layout.tsx        # fonts, splash, providers, root stack (modals)
    (tabs)/            # Home, Invest, Activity, Wallet + floating tab bar
    transfer.tsx       # amount sheet (?kind=send|topup|deposit|withdraw)
    transaction/[id].tsx
  components/          # Text, Card, Button, Money, WalletStack, CandleChart, Keypad, FloatingTabBar…
  state/app-state.tsx  # reducer + context: balances, transactions, hide-balances, payment method
  data/mock.ts         # mock user, accounts, transactions, holdings, banks
  lib/                 # formatting, keypad/amount logic, chart series, haptics
  theme/tokens.ts      # colours, radii, spacing, fonts shared with the website
  __tests__/           # unit tests (formatting, reducer) and a component test
```

## Next steps

- **Backend:** replace `src/data/mock.ts` and the reducer's `transfer` action with API calls. Screens read everything through `useAppState()`, so they won't need changes.
- **Auth:** add a sign-in route group and protect `(tabs)` with Expo Router's `Stack.Protected`.
- **Release:** build and submit with EAS (`npx eas-cli@latest build`). The bundle identifier and package are `app.minto.mobile` in `app.json`.
