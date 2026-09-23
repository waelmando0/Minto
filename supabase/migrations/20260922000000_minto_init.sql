-- Minto: accounts, transactions and savings goals per signed-in user.
--
-- Security model
--   * Row-level security on every table: users can only read their own rows.
--   * There are NO insert/update/delete policies. All writes go through the
--     SECURITY DEFINER functions below, which validate amounts, check
--     ownership and balances, and update everything in one transaction.
--     A client can never set a balance directly.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.account_kind as enum ('investment', 'personal');
create type public.transfer_kind as enum ('send', 'topup', 'deposit', 'withdraw', 'goal');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  -- Uninvested cash in the brokerage account.
  investment_cash numeric(14, 2) not null default 0 check (investment_cash >= 0),
  created_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.account_kind not null,
  name text not null,
  balance numeric(14, 2) not null default 0 check (balance >= 0),
  color text not null,
  last4 text not null check (last4 ~ '^[0-9]{4}$'),
  unique (user_id, kind)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  template text not null,
  target numeric(14, 2) not null check (target between 10 and 1000000),
  saved numeric(14, 2) not null default 0 check (saved >= 0 and saved <= target),
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_kind public.account_kind not null,
  merchant text not null,
  category text not null check (category in (
    'Food & Drink', 'Entertainment', 'Shopping', 'Salary', 'Transport',
    'Groceries', 'Bills', 'Transfer', 'Investing', 'Savings'
  )),
  amount numeric(14, 2) not null check (amount <> 0),
  note text,
  goal_id uuid references public.goals (id) on delete set null,
  created_at timestamptz not null default now()
);

create index transactions_user_created_idx on public.transactions (user_id, created_at desc);
create index goals_user_idx on public.goals (user_id);

-- ---------------------------------------------------------------------------
-- Row-level security: read your own rows, nothing else
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.goals enable row level security;
alter table public.transactions enable row level security;

create policy "Read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Read own accounts" on public.accounts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Read own goals" on public.goals
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Read own transactions" on public.transactions
  for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.profiles, public.accounts, public.goals, public.transactions from anon, authenticated;
grant select on public.profiles, public.accounts, public.goals, public.transactions to authenticated;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- The caller's id, or an error for anonymous callers.
create function public.require_user()
returns uuid
language plpgsql
stable
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  return uid;
end;
$$;

-- Demo data mirroring the website mockups, so a new account isn't empty.
-- Remove the call in handle_new_user() once real account data is connected.
create function public.seed_demo_data(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, investment_cash)
  values (p_user, 2623)
  on conflict (id) do update set investment_cash = excluded.investment_cash;

  insert into public.accounts (user_id, kind, name, balance, color, last4) values
    (p_user, 'investment', 'Investment', 24972.00, '#F7A531', '4821'),
    (p_user, 'personal', 'Personal', 11890.76, '#2F6DF6', '2207')
  on conflict (user_id, kind) do update set balance = excluded.balance;

  insert into public.transactions (user_id, account_kind, merchant, category, amount, note, created_at) values
    (p_user, 'personal', 'Starbucks', 'Food & Drink', -8.50, null, now() - interval '2 hours'),
    (p_user, 'personal', 'Netflix', 'Entertainment', -15.99, null, now() - interval '26 hours'),
    (p_user, 'personal', 'Apple Store', 'Shopping', -129.00, null, now() - interval '52 hours'),
    (p_user, 'personal', 'Payroll', 'Salary', 3850.00, 'Monthly salary', now() - interval '98 hours'),
    (p_user, 'personal', 'Uber', 'Transport', -23.40, null, now() - interval '120 hours'),
    (p_user, 'personal', 'Whole Foods', 'Groceries', -86.12, null, now() - interval '140 hours'),
    (p_user, 'personal', 'Con Edison', 'Bills', -94.30, null, now() - interval '170 hours'),
    (p_user, 'investment', 'Global Equity ETF', 'Investing', -500.00, 'Recurring buy', now() - interval '200 hours'),
    (p_user, 'personal', 'Blue Bottle', 'Food & Drink', -6.25, null, now() - interval '230 hours'),
    (p_user, 'personal', 'Spotify', 'Entertainment', -11.99, null, now() - interval '260 hours'),
    (p_user, 'personal', 'Lyft', 'Transport', -17.80, null, now() - interval '300 hours'),
    (p_user, 'personal', 'Trader Joe''s', 'Groceries', -54.66, null, now() - interval '330 hours');

  insert into public.goals (user_id, name, template, target, saved, created_at) values
    (p_user, 'Summer in Lisbon', 'vacation', 3000, 1850, now() - interval '140 days'),
    (p_user, 'New MacBook', 'tech', 2400, 900, now() - interval '70 days');
end;
$$;

revoke execute on function public.seed_demo_data(uuid) from public, anon, authenticated;

-- Every new auth user gets a profile, accounts and demo data.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''));
  perform public.seed_demo_data(new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Money movement
-- ---------------------------------------------------------------------------

-- Send, top up, deposit to / withdraw from investing, or add to a goal.
-- Limits match the app: $10 minimum, $50,000 maximum per transaction.
create function public.transfer(
  p_kind public.transfer_kind,
  p_amount numeric,
  p_counterparty text default null,
  p_goal_id uuid default null
)
returns public.transactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := public.require_user();
  amount numeric(14, 2) := round(p_amount, 2);
  personal public.accounts;
  profile public.profiles;
  goal public.goals;
  result public.transactions;
begin
  if amount is null or amount < 10 then
    raise exception 'Minimum is $10.00' using errcode = 'P0001';
  end if;
  if amount > 50000 then
    raise exception 'Maximum is $50,000.00 per transaction' using errcode = 'P0001';
  end if;

  -- Lock the rows we are about to change so concurrent transfers serialise.
  select * into personal from public.accounts
    where user_id = uid and kind = 'personal' for update;
  select * into profile from public.profiles where id = uid for update;
  if personal.id is null or profile.id is null then
    raise exception 'Account not found' using errcode = 'P0002';
  end if;

  case p_kind
    when 'send' then
      if nullif(btrim(coalesce(p_counterparty, '')), '') is null then
        raise exception 'Add who you''re sending to' using errcode = 'P0001';
      end if;
      if personal.balance < amount then
        raise exception 'Not enough available cash' using errcode = 'P0001';
      end if;
      update public.accounts set balance = balance - amount where id = personal.id;
      insert into public.transactions (user_id, account_kind, merchant, category, amount, note)
        values (uid, 'personal', left(btrim(p_counterparty), 60), 'Transfer', -amount, 'Send money')
        returning * into result;

    when 'topup' then
      update public.accounts set balance = balance + amount where id = personal.id;
      insert into public.transactions (user_id, account_kind, merchant, category, amount, note)
        values (uid, 'personal', 'Top up', 'Transfer', amount, 'Top up')
        returning * into result;

    when 'deposit' then
      if personal.balance < amount then
        raise exception 'Not enough available cash' using errcode = 'P0001';
      end if;
      update public.accounts set balance = balance - amount where id = personal.id;
      update public.profiles set investment_cash = investment_cash + amount where id = uid;
      insert into public.transactions (user_id, account_kind, merchant, category, amount, note)
        values (uid, 'personal', 'Investment cash', 'Investing', -amount, 'Deposit to investing')
        returning * into result;

    when 'withdraw' then
      if profile.investment_cash < amount then
        raise exception 'Not enough available cash' using errcode = 'P0001';
      end if;
      update public.profiles set investment_cash = investment_cash - amount where id = uid;
      update public.accounts set balance = balance + amount where id = personal.id;
      insert into public.transactions (user_id, account_kind, merchant, category, amount, note)
        values (uid, 'personal', 'Investment cash', 'Investing', amount, 'Withdraw cash')
        returning * into result;

    when 'goal' then
      select * into goal from public.goals where id = p_goal_id and user_id = uid for update;
      if goal.id is null then
        raise exception 'This goal no longer exists' using errcode = 'P0002';
      end if;
      if amount > goal.target - goal.saved then
        raise exception 'Only $% left to reach this goal', to_char(goal.target - goal.saved, 'FM999,999,990.00')
          using errcode = 'P0001';
      end if;
      if personal.balance < amount then
        raise exception 'Not enough available cash' using errcode = 'P0001';
      end if;
      update public.accounts set balance = balance - amount where id = personal.id;
      update public.goals set saved = saved + amount where id = goal.id;
      insert into public.transactions (user_id, account_kind, merchant, category, amount, note, goal_id)
        values (uid, 'personal', goal.name, 'Savings', -amount, 'Added to savings goal', goal.id)
        returning * into result;
  end case;

  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Goals
-- ---------------------------------------------------------------------------

create function public.create_goal(p_name text, p_template text, p_target numeric)
returns public.goals
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := public.require_user();
  result public.goals;
begin
  if nullif(btrim(coalesce(p_name, '')), '') is null then
    raise exception 'Give your goal a name.' using errcode = 'P0001';
  end if;
  if p_target is null or p_target < 10 then
    raise exception 'The target must be at least $10.00.' using errcode = 'P0001';
  end if;
  if p_target > 1000000 then
    raise exception 'The target can be at most $1,000,000.00.' using errcode = 'P0001';
  end if;

  insert into public.goals (user_id, name, template, target)
    values (uid, left(btrim(p_name), 40), p_template, round(p_target, 2))
    returning * into result;
  return result;
end;
$$;

-- Closes a goal and returns its savings to the Personal account.
create function public.close_goal(p_goal_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := public.require_user();
  goal public.goals;
begin
  select * into goal from public.goals where id = p_goal_id and user_id = uid for update;
  if goal.id is null then
    raise exception 'This goal no longer exists' using errcode = 'P0002';
  end if;

  if goal.saved > 0 then
    update public.accounts set balance = balance + goal.saved where user_id = uid and kind = 'personal';
    insert into public.transactions (user_id, account_kind, merchant, category, amount, note)
      values (uid, 'personal', goal.name, 'Savings', goal.saved, 'Goal closed, savings returned');
  end if;
  delete from public.goals where id = goal.id;
end;
$$;

-- Puts the caller's data back to the starting demo state.
create function public.reset_demo_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := public.require_user();
begin
  delete from public.transactions where user_id = uid;
  delete from public.goals where user_id = uid;
  perform public.seed_demo_data(uid);
end;
$$;

-- Functions are executable by PUBLIC by default: allow signed-in users only.
revoke execute on function public.require_user() from public, anon;
revoke execute on function public.transfer(public.transfer_kind, numeric, text, uuid) from public, anon;
revoke execute on function public.create_goal(text, text, numeric) from public, anon;
revoke execute on function public.close_goal(uuid) from public, anon;
revoke execute on function public.reset_demo_data() from public, anon;
grant execute on function public.require_user() to authenticated;
grant execute on function public.transfer(public.transfer_kind, numeric, text, uuid) to authenticated;
grant execute on function public.create_goal(text, text, numeric) to authenticated;
grant execute on function public.close_goal(uuid) to authenticated;
grant execute on function public.reset_demo_data() to authenticated;
