-- Lets a signed-in user permanently delete their own account from the app.
--
-- App Store guideline 5.1.1(v) requires in-app account deletion for any app
-- that lets people create an account. Deleting the auth.users row removes
-- everything else through `on delete cascade`: the profile, accounts,
-- transactions and goals.

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

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
