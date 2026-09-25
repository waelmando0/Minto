-- Minto database health check.
--
-- Read-only: it changes nothing. Run it in the Supabase SQL Editor to see
-- whether your project matches the migrations. Every row should be ✅; any
-- ❌ is listed first. See supabase/README.md, "Fixing a partial setup".

with checks(area, item, ok) as (
  select 'Tables', t, to_regclass('public.' || t) is not null
  from unnest(array['profiles', 'accounts', 'goals', 'transactions']) t
  union all
  select 'Privacy (row-level security on)', t,
         coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.' || t)), false)
  from unnest(array['profiles', 'accounts', 'goals', 'transactions']) t
  union all
  select 'Privacy (read-own-rows rule)', t,
         exists (select from pg_policies where schemaname = 'public' and tablename = t and cmd = 'SELECT')
  from unnest(array['profiles', 'accounts', 'goals', 'transactions']) t
  union all
  select 'No direct writes from the app', t,
         not exists (
           select from information_schema.role_table_grants
           where table_schema = 'public' and table_name = t
             and grantee in ('anon', 'authenticated')
             and privilege_type in ('INSERT', 'UPDATE', 'DELETE'))
         and not exists (
           select from information_schema.role_table_grants
           where table_schema = 'public' and table_name = t
             and grantee = 'anon')
  from unnest(array['profiles', 'accounts', 'goals', 'transactions']) t
  union all
  select 'Server functions', f, to_regprocedure(f) is not null
  from unnest(array[
    'public.require_user()',
    'public.transfer(public.transfer_kind,numeric,text,uuid)',
    'public.create_goal(text,text,numeric)',
    'public.close_goal(uuid)',
    'public.delete_my_account()',
    'public.handle_new_user()']) f
  union all
  select 'Signup creates accounts', 'on_auth_user_created trigger',
         exists (select from pg_trigger where tgname = 'on_auth_user_created' and tgrelid = 'auth.users'::regclass)
  union all
  select 'Demo data removed', f, to_regprocedure(f) is null
  from unnest(array['public.seed_demo_data(uuid)', 'public.reset_demo_data()']) f
  union all
  select 'Goal limits', 'goals_template_format constraint',
         exists (select from pg_constraint where conname = 'goals_template_format')
  union all
  select 'Every user has their accounts', 'users missing a profile or account',
         not exists (
           select from auth.users u
           where not exists (select from public.profiles p where p.id = u.id)
              or (select count(*) from public.accounts a where a.user_id = u.id) < 2)
)
select case when ok then '✅' else '❌' end as status, area, item
from checks
order by ok, area, item;
