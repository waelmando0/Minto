-- Makes sure every user has a profile and their two accounts, and that new
-- sign-ups get them automatically. Use it when the app says "Account not
-- found".
--
-- Safe to run more than once. Existing balances and data are never changed;
-- it only adds what's missing. The final query lists each user with their
-- profile (1) and account (2) counts.

-- New sign-ups get a profile and two $0.00 accounts (latest version).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  insert into public.accounts (user_id, kind, name, balance, color, last4) values
    (new.id, 'investment', 'Investment', 0, '#F7A531', lpad(floor(random() * 10000)::int::text, 4, '0')),
    (new.id, 'personal', 'Personal', 0, '#2F6DF6', lpad(floor(random() * 10000)::int::text, 4, '0'))
  on conflict (user_id, kind) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users who signed up while the trigger was missing get theirs now.
insert into public.profiles (id, full_name)
select u.id, nullif(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
on conflict (id) do nothing;

insert into public.accounts (user_id, kind, name, balance, color, last4)
select u.id, a.kind::public.account_kind, a.name, 0, a.color, lpad(floor(random() * 10000)::int::text, 4, '0')
from auth.users u
cross join (values ('investment', 'Investment', '#F7A531'), ('personal', 'Personal', '#2F6DF6')) as a(kind, name, color)
on conflict (user_id, kind) do nothing;

-- Check: every user should show 1 profile and 2 accounts.
select u.email,
       (select count(*) from public.profiles p where p.id = u.id) as profiles,
       (select count(*) from public.accounts a where a.user_id = u.id) as accounts
from auth.users u
order by u.email;
