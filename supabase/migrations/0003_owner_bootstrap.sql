-- The role-change guard from 0001 blocks anyone but the owner from changing
-- roles. That's correct for the app's normal request path (PostgREST, which
-- runs as the `authenticator`/`service_role` Postgres role and always has
-- auth.uid() = null when there's no owner yet), but it also means there was
-- no way to ever bootstrap the first owner.
--
-- This allows the check to be bypassed only for direct database access as
-- the `postgres` role (migrations, the SQL Editor) - never reachable through
-- the API, even with the service_role key.

create or replace function public.guard_profile_changes()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if current_user = 'postgres' then
    return new;
  end if;

  if new.role is distinct from old.role and public.current_user_role() is distinct from 'owner' then
    raise exception 'Only the owner can change roles';
  end if;
  if new.is_banned is distinct from old.is_banned and not public.is_moderator() then
    raise exception 'Only admins or the owner can change ban status';
  end if;
  return new;
end;
$$;
