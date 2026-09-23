# Minto on Supabase

The mobile app uses Supabase for sign-in and data when it's configured. Without it, the app runs in demo mode.

| Piece | What it does |
|---|---|
| **Auth** | Email one-time codes (`signInWithOtp` → `verifyOtp`). No passwords. |
| **`profiles`, `accounts`, `transactions`, `goals`** | Each user's data. Row-level security lets a user read **only their own rows**. |
| **Server functions** | `transfer`, `create_goal`, `close_goal` and `reset_demo_data`. They are the **only** way to change data: they validate amounts ($10–$50,000, available cash, goal limits), check ownership, and update balances and history in one transaction. A client can't set a balance directly. |
| **Signup trigger** | Gives every new user a profile, two accounts, and demo transactions and goals, so the app isn't empty. |

## Set it up (about 10 minutes)

1. **Create a project** at [supabase.com](https://supabase.com). The free tier is fine.
2. **Create the database.** Pick one:
   - Open **SQL Editor**, paste [`migrations/20260922000000_minto_init.sql`](migrations/20260922000000_minto_init.sql) and run it.
   - Or, with the [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase link --project-ref <ref>` then `supabase db push`.
3. **Send codes, not links.** Go to **Authentication → Emails → Templates → Magic Link** and include the code in the email, for example:
   ```html
   <h2>Your Minto sign-in code</h2>
   <p>Enter this code in the app: <strong>{{ .Token }}</strong></p>
   <p>It expires in 1 hour. If you didn't ask for it, ignore this email.</p>
   ```
   Keep the code length at **6 digits** (Authentication → Providers → Email), which is what the app expects.
4. **Connect the app.** Copy `mobile/.env.example` to `mobile/.env` and fill in **Project Settings → API Keys**:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
   ```
   Older projects can set `EXPO_PUBLIC_SUPABASE_ANON_KEY` to the legacy anon key instead. Supabase's "Connect" dialog shows `NEXT_PUBLIC_…` names for Next.js; the mobile app needs the `EXPO_PUBLIC_…` names above.
   Restart with `npx expo start --clear`; environment variables are read at bundle time.
5. **For production:** configure custom SMTP (Authentication → Emails). Supabase's built-in sender is heavily rate-limited and meant for testing.

Sign in with your email, enter the code, and you'll see your seeded accounts. Every transfer and goal change is now stored in Postgres.

## Before going live with real money

- **Remove the demo seeding.** Delete the `perform public.seed_demo_data(new.id);` line in `handle_new_user()` (in a new migration), and stop exposing `reset_demo_data`.
- **Balances come from somewhere real.** Replace `transfer()` with calls to your payments / banking provider. Keep the same pattern: validation and balance changes happen on the server, never in the app.
- Holdings, the investment chart and linked bank accounts are still mock data in the app.

## Tests

`tests/run.sh` applies the migrations to a fresh Postgres database. It uses a small stub of Supabase's `auth` schema and roles (`tests/auth-stub.sql`), then runs `tests/minto.test.sql` as real `authenticated` and `anon` users. It checks:
- row-level security isolation between two users
- that direct writes are refused
- every transfer rule and error message
- goal limits and closing a goal
- reset
- anonymous access

```bash
# any Postgres 14+; uses the standard PG* environment variables
PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres supabase/tests/run.sh
```

CI runs the same script against a `postgres:16` service on every pull request.
