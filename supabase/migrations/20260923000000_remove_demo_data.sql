-- Go-live: new accounts start empty instead of with demo data.
--
-- Every new user still gets a profile and their two accounts (Investment and
-- Personal) at $0.00, with no transactions or goals. The demo seeding and the
-- reset function are removed.
--
-- Existing users keep whatever data they have. To clear demo data from
-- accounts created before this migration, see supabase/README.md.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''));

  -- last4 is a display label until real accounts are connected.
  insert into public.accounts (user_id, kind, name, balance, color, last4) values
    (new.id, 'investment', 'Investment', 0, '#F7A531', lpad(floor(random() * 10000)::int::text, 4, '0')),
    (new.id, 'personal', 'Personal', 0, '#2F6DF6', lpad(floor(random() * 10000)::int::text, 4, '0'));
  return new;
end;
$$;

drop function public.reset_demo_data();
drop function public.seed_demo_data(uuid);
