-- Abuse limits for goals.
--
-- A goal's template picks its icon in the app, so it's a short lowercase id
-- (unknown ids fall back to a default icon). Each user can have at most 20
-- goals, so one account can't fill the database.

alter table public.goals
  add constraint goals_template_format check (template ~ '^[a-z]{1,24}$');

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
