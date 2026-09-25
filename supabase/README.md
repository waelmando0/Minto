# Minto on Supabase

The mobile app uses Supabase for sign-in and data when it's configured. Without it, the app runs in demo mode. The website's Login and /account page use the same project.

| Piece | What it does |
|---|---|
| **Auth** | Email one-time codes (`signInWithOtp` → `verifyOtp`). No passwords. |
| **`profiles`, `accounts`, `transactions`, `goals`** | Each user's data. Row-level security lets a user read **only their own rows**. |
| **Server functions** | `transfer`, `create_goal`, `close_goal` and `delete_my_account` (in-app account deletion, which the App Store requires; it removes the user and, by cascade, all their data). They are the **only** way to change data: they validate amounts ($10–$50,000, available cash, goal limits), check ownership, and update balances and history in one transaction. A client can't set a balance directly. |
| **Signup trigger** | Gives every new user a profile and two accounts (Investment and Personal) at $0.00. Until a payment provider is connected, **Top up** in the app is how money gets in. |

## Set it up (about 10 minutes)

1. **Create a project** at [supabase.com](https://supabase.com). The free tier is fine.
2. **Create the database.** Pick one:
   - Open **SQL Editor**, paste [`migrations/20260922000000_minto_init.sql`](migrations/20260922000000_minto_init.sql) and run it.
   - Or, with the [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase link --project-ref <ref>` then `supabase db push`.
3. **Send codes, not links.** Supabase only lets you edit email templates once custom SMTP is set up (**Authentication → Emails → SMTP Settings**; [Resend](https://resend.com), Postmark or SendGrid all work). Then open **Authentication → Emails → Magic link or OTP**, switch the body to **Source**, and include the code, for example:
   ```html
   <h2>Your Minto sign-in code</h2>
   <p>Enter this code in the app: <strong>{{ .Token }}</strong></p>
   <p>On the website you can also <a href="{{ .ConfirmationURL }}">sign in with this link</a>, in the browser where you asked for it.</p>
   <p>It expires in 1 hour. If you didn't ask for it, ignore this email.</p>
   ```
   Put the same `{{ .Token }}` line in the **Confirm signup** template too: some projects send that one to first-time users. Keep the code length at **6 digits** (Authentication → Providers → Email), which is what the app expects.
4. **Connect the app.** Copy `mobile/.env.example` to `mobile/.env` and fill in **Project Settings → API Keys**:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
   ```
   `EXPO_PUBLIC_SUPABASE_KEY` is accepted as well. Older projects can set `EXPO_PUBLIC_SUPABASE_ANON_KEY` to the legacy anon key instead. Supabase's "Connect" dialog shows `NEXT_PUBLIC_…` names for Next.js; the mobile app needs the `EXPO_PUBLIC_…` names above.
   Restart with `npx expo start --clear`; environment variables are read at bundle time.
   Until then, the default email only has a link: website sign-in works through it, but the mobile app needs the code.
5. **Website (optional).** The website's Login uses the same project; see "Web sign-in" in the [root README](../README.md#web-sign-in-optional).
6. **For production:** configure custom SMTP (Authentication → Emails). Supabase's built-in sender is heavily rate-limited and meant for testing.

Sign in with your email, enter the code, and you'll see your two accounts at $0.00. Top up to add money; every transfer and goal change is stored in Postgres.

## Checking and fixing your project

If the SQL Editor stops partway through a migration, some pieces may be missing. The scripts in [`scripts/`](scripts/) are safe to run in the SQL Editor, any number of times:

| Script | When to use it |
|---|---|
| [`health-check.sql`](scripts/health-check.sql) | Anytime. It only reads. It lists 27 checks (tables, row-level security, no direct writes, server functions, the signup trigger, demo data removed, goal limits, every user has their accounts), and any ❌ comes first. |
| [`repair-functions.sql`](scripts/repair-functions.sql) | The app says *"Could not find the function … in the schema cache"*. It recreates the server functions at their latest versions and reloads the API. It never touches data. |
| [`repair-signup.sql`](scripts/repair-signup.sql) | The app says *"Account not found"*. It restores the signup trigger and adds any missing profile or accounts. Existing balances are never changed. |

Don't re-run `20260922000000_minto_init.sql` on a project that's already set up: it stops at `type "account_kind" already exists` and changes nothing.

## Before going live with real money

- **Demo data is gone for new users.** Migration `20260923000000_remove_demo_data.sql` stops seeding sample balances, transactions and goals, and removes `reset_demo_data`. Accounts created before it keep their demo data. To clear it, run this in the SQL Editor. It **permanently deletes every user's transactions and goals** and sets all balances to $0.00, so only do it before real users have real data:
  ```sql
  begin;
  delete from public.transactions;
  delete from public.goals;
  update public.accounts set balance = 0;
  update public.profiles set investment_cash = 0;
  commit;
  ```
- **Top up is still pretend money.** It credits the account without charging anyone; the app labels it as test money.
- **Balances come from somewhere real.** Replace `transfer()` with calls to your payments / banking provider. Keep the same pattern: validation and balance changes happen on the server, never in the app.
- Holdings, the investment chart, linked banks and bank details for receiving money exist only in demo mode. Real accounts see empty states until those are connected.

## Tests

`tests/run.sh` applies the migrations to a fresh Postgres database. It uses a small stub of Supabase's `auth` schema and roles (`tests/auth-stub.sql`), then runs `tests/minto.test.sql` as real `authenticated` and `anon` users. It checks:
- row-level security isolation between two users
- that direct writes are refused
- every transfer rule and error message
- goal limits and closing a goal
- that new accounts start empty and the demo functions are gone
- that the repair scripts are harmless on a healthy database (they run twice before the tests), and that the health check passes afterwards
- goal limits: a goal type must be a short lowercase id, and each user can have at most 20 goals
- account deletion: it removes only the caller's data, and anonymous users can't call it
- anonymous access

```bash
# any Postgres 14+; uses the standard PG* environment variables
PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres supabase/tests/run.sh
```

CI runs the same script against a `postgres:16` service on every pull request.
