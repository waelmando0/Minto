-- Behavioural tests for the Minto schema. Run with supabase/tests/run.sh.
-- Every check raises an exception on failure; psql stops at the first one.
\set ON_ERROR_STOP on
\set QUIET on

-- Two users; the signup trigger gives each a profile and two empty accounts.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@example.com', '{"full_name": "Alice"}'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@example.com', '{}');

-- Helper: assert(condition, message)
create function pg_temp.check(ok boolean, message text) returns void language plpgsql as $$
begin
  if ok is not true then
    raise exception 'FAILED: %', message;
  end if;
  raise notice 'ok - %', message;
end;
$$;
grant execute on function pg_temp.check(boolean, text) to authenticated, anon;

-- Helper: expect(sql, fragment) runs sql and requires an error containing fragment.
create function pg_temp.expect_error(stmt text, fragment text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    if position(fragment in sqlerrm) = 0 then
      raise exception 'FAILED: % raised "%", expected "%"', stmt, sqlerrm, fragment;
    end if;
    raise notice 'ok - rejects: % (%)', stmt, sqlerrm;
    return;
  end;
  raise exception 'FAILED: % should have raised "%"', stmt, fragment;
end;
$$;
grant execute on function pg_temp.expect_error(text, text) to authenticated, anon;

select pg_temp.check((select count(*) = 2 from public.profiles), 'signup creates a profile per user');
select pg_temp.check((select full_name = 'Alice' from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), 'profile takes full_name from signup metadata');
select pg_temp.check((select count(*) = 4 from public.accounts), 'signup creates two accounts per user');
select pg_temp.check((select bool_and(balance = 0) from public.accounts), 'new accounts start at $0.00');
select pg_temp.check((select bool_and(last4 ~ '^[0-9]{4}$') from public.accounts), 'new accounts get a 4-digit label');
select pg_temp.check((select bool_and(investment_cash = 0) from public.profiles), 'new profiles have no investment cash');
select pg_temp.check((select count(*) = 0 from public.transactions), 'signup adds no transactions');
select pg_temp.check((select count(*) = 0 from public.goals), 'signup adds no goals');
select pg_temp.check(to_regprocedure('public.seed_demo_data(uuid)') is null, 'demo seeding is removed');
select pg_temp.check(to_regprocedure('public.reset_demo_data()') is null, 'demo reset is removed');

-- ---------------------------------------------------------------------------
-- Bob creates a goal (used below to check Alice can't touch it)
-- ---------------------------------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
select set_config('app.bob_goal', (select id::text from public.create_goal('Bike', 'tech', 500)), false);

-- ---------------------------------------------------------------------------
-- As Alice
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);

select pg_temp.check((select count(*) = 2 from public.accounts), 'RLS: Alice sees only her 2 accounts');
select pg_temp.check((select count(*) = 0 from public.goals), 'RLS: Alice doesn''t see Bob''s goal');

select pg_temp.expect_error($$update public.accounts set balance = 1000000$$, 'permission denied');
select pg_temp.expect_error($$insert into public.transactions (user_id, account_kind, merchant, category, amount) values (auth.uid(), 'personal', 'x', 'Transfer', 5)$$, 'permission denied');
select pg_temp.expect_error($$delete from public.goals$$, 'permission denied');
select pg_temp.expect_error($$select public.reset_demo_data()$$, 'does not exist');

-- An empty account can't send money until it's funded.
select pg_temp.expect_error($$select public.transfer('send', 20, 'Maria')$$, 'Not enough available cash');
select public.transfer('topup', 12000);
select pg_temp.check((select balance = 12000 from public.accounts where kind = 'personal'), 'top up funds Personal');

-- send
select public.transfer('send', 250, 'Maria');
select pg_temp.check((select balance = 11750 from public.accounts where kind = 'personal'), 'send debits Personal');
select pg_temp.check(
  (select merchant = 'Maria' and amount = -250 and category = 'Transfer' from public.transactions order by created_at desc, amount limit 1),
  'send records a Transfer to the recipient'
);
select pg_temp.expect_error($$select public.transfer('send', 20, '  ')$$, 'sending to');
select pg_temp.expect_error($$select public.transfer('send', 5, 'Maria')$$, 'Minimum is $10.00');
select pg_temp.expect_error($$select public.transfer('send', 60000, 'Maria')$$, 'Maximum is $50,000.00');
select pg_temp.expect_error($$select public.transfer('send', 40000, 'Maria')$$, 'Not enough available cash');
select pg_temp.expect_error($$select public.transfer('send', null, 'Maria')$$, 'Minimum');

-- top up, deposit, withdraw
select public.transfer('topup', 100);
select pg_temp.check((select balance = 11850 from public.accounts where kind = 'personal'), 'top up credits Personal');
select public.transfer('deposit', 100.004);
select pg_temp.check((select investment_cash = 100 from public.profiles), 'deposit moves cash into investing (rounded to cents)');
select pg_temp.check((select balance = 11750 from public.accounts where kind = 'personal'), 'deposit debits Personal');
select pg_temp.expect_error($$select public.transfer('withdraw', 5000)$$, 'Not enough available cash');
select public.transfer('withdraw', 23);
select pg_temp.check((select investment_cash = 77 from public.profiles), 'withdraw takes from investment cash');
select pg_temp.check((select balance = 11773 from public.accounts where kind = 'personal'), 'withdraw credits Personal');

-- goals
select pg_temp.expect_error($$select public.create_goal('   ', 'vacation', 1000)$$, 'name');
select pg_temp.expect_error($$select public.create_goal('Trip', 'vacation', 5)$$, 'at least');
select pg_temp.expect_error($$select public.create_goal('Trip', 'vacation', 2000000)$$, 'at most');
select pg_temp.expect_error($$select public.create_goal('Trip', 'Vacation!', 1000)$$, 'goal type');
select pg_temp.expect_error($$select public.create_goal('Trip', repeat('a', 5000), 1000)$$, 'goal type');
select public.create_goal('Trip', 'vacation', 1000);
select public.transfer('goal', 300, null, (select id from public.goals where name = 'Trip'));
select pg_temp.check((select saved = 300 from public.goals where name = 'Trip'), 'add money raises goal savings');
select pg_temp.check((select balance = 11473 from public.accounts where kind = 'personal'), 'goal contribution debits Personal');
select pg_temp.check(
  (select category = 'Savings' and goal_id is not null from public.transactions where note = 'Added to savings goal'),
  'goal contribution is recorded as Savings and linked to the goal'
);
select pg_temp.expect_error(
  format($$select public.transfer('goal', 800, null, %L)$$, (select id from public.goals where name = 'Trip')),
  'Only $700.00 left'
);
select public.close_goal((select id from public.goals where name = 'Trip'));
select pg_temp.check((select count(*) = 0 from public.goals where name = 'Trip'), 'close_goal deletes the goal');
select pg_temp.check((select balance = 11773 from public.accounts where kind = 'personal'), 'close_goal returns savings to Personal');
select pg_temp.check((select count(*) = 7 from public.transactions), 'every movement is in Alice''s history');

-- At most 20 goals per user.
select count(public.create_goal('Goal ' || n, 'tech', 100)) from generate_series(1, 20) n;
select pg_temp.expect_error($$select public.create_goal('One too many', 'tech', 100)$$, 'up to 20 goals');
select pg_temp.check((select count(*) = 20 from public.goals), 'Alice is capped at 20 goals');
reset role;
delete from public.goals where name like 'Goal %';
set role authenticated;

-- Alice cannot touch Bob's goal.
select pg_temp.expect_error(format($$select public.transfer('goal', 50, null, %L)$$, current_setting('app.bob_goal')), 'no longer exists');
select pg_temp.expect_error(format($$select public.close_goal(%L)$$, current_setting('app.bob_goal')), 'no longer exists');

-- ---------------------------------------------------------------------------
-- Bob was untouched, and anonymous callers get nothing
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
select pg_temp.check((select sum(balance) = 0 from public.accounts), 'Bob''s balances are untouched by Alice');
select pg_temp.check((select count(*) = 0 from public.transactions), 'RLS: Bob doesn''t see Alice''s transactions');
select pg_temp.check((select count(*) = 1 from public.goals), 'Bob''s goal is untouched by Alice');

-- Bob deletes his account: everything of his goes, Alice keeps hers.
select public.delete_my_account();
select pg_temp.check((select count(*) = 0 from public.accounts), 'after deleting, Bob has no accounts');
select pg_temp.check((select count(*) = 0 from public.goals), 'after deleting, Bob has no goals');
reset role;
select pg_temp.check((select count(*) = 0 from auth.users where id = '00000000-0000-0000-0000-00000000000b'), 'delete_my_account removes the auth user');
select pg_temp.check((select count(*) = 0 from public.profiles where id = '00000000-0000-0000-0000-00000000000b'), 'deleting cascades to the profile');
select pg_temp.check(
  (select count(*) = 2 from public.accounts where user_id = '00000000-0000-0000-0000-00000000000a')
    and (select count(*) = 7 from public.transactions where user_id = '00000000-0000-0000-0000-00000000000a'),
  'Alice''s data survives Bob''s deletion'
);
set role authenticated;

select set_config('request.jwt.claim.sub', '', false);
select pg_temp.expect_error($$select public.transfer('topup', 100)$$, 'Not signed in');
select pg_temp.expect_error($$select public.delete_my_account()$$, 'Not signed in');

reset role;
set role anon;
select pg_temp.expect_error($$select * from public.accounts$$, 'permission denied');
select pg_temp.expect_error($$select public.transfer('topup', 100)$$, 'permission denied');
select pg_temp.expect_error($$select public.delete_my_account()$$, 'permission denied');
reset role;

\echo 'All database tests passed.'
