-- Restores Minto's server functions to their latest versions and reloads
-- the API. Use it when the app says "Could not find the function ... in the
-- schema cache".
--
-- Safe to run more than once: it only creates what's missing and replaces
-- functions. It never touches data.
--
-- Keep this in step with supabase/migrations: when a migration changes one
-- of these functions, copy the new version here too. CI runs this script on
-- a fully migrated database before the tests, so a stale copy fails CI.

do $$
begin
  if not exists (select from pg_type where typname = 'transfer_kind' and typnamespace = 'public'::regnamespace) then
    create type public.transfer_kind as enum ('send', 'topup', 'deposit', 'withdraw', 'goal');
  end if;
end
$$;

create or replace function public.require_user()
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

create or replace function public.transfer(
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

create or replace function public.create_goal(p_name text, p_template text, p_target numeric)
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
  if p_template is null or p_template !~ '^[a-z]{1,24}$' then
    raise exception 'Choose a goal type.' using errcode = 'P0001';
  end if;

  -- Serialise this user's goal creation so two requests can't both pass the limit.
  perform 1 from public.profiles where id = uid for update;
  if (select count(*) from public.goals where user_id = uid) >= 20 then
    raise exception 'You can have up to 20 goals. Close one to start another.' using errcode = 'P0001';
  end if;

  insert into public.goals (user_id, name, template, target)
    values (uid, left(btrim(p_name), 40), p_template, round(p_target, 2))
    returning * into result;
  return result;
end;
$$;

create or replace function public.close_goal(p_goal_id uuid)
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

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := public.require_user();
begin
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.require_user() from public, anon;
revoke execute on function public.transfer(public.transfer_kind, numeric, text, uuid) from public, anon;
revoke execute on function public.create_goal(text, text, numeric) from public, anon;
revoke execute on function public.close_goal(uuid) from public, anon;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.require_user() to authenticated;
grant execute on function public.transfer(public.transfer_kind, numeric, text, uuid) to authenticated;
grant execute on function public.create_goal(text, text, numeric) to authenticated;
grant execute on function public.close_goal(uuid) to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- Tell the API to reload, so the app sees the functions straight away.
notify pgrst, 'reload schema';
