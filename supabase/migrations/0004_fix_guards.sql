-- Fixes two bugs found in end-to-end testing:
--
-- 1. `guard_profile_changes` was marked `security definer`, which makes
--    `current_user` inside it evaluate to the function's owner (postgres,
--    since migrations run as postgres) rather than the actual caller. Its
--    "allow direct postgres access" bypass was therefore always true for
--    everyone, and any authenticated user could set their own role to
--    'owner'. Dropping `security definer` fixes `current_user` to reflect
--    who's actually running the UPDATE - it still doesn't need elevated
--    privileges since it only calls other (already security definer)
--    helper functions.
--
-- 2. Postgres RLS has no column-level granularity: the "authors can update
--    their own post" policy allowed changing ANY column on an owned row,
--    including is_pinned/is_locked, not just title/body. Added a trigger to
--    keep those moderator-only, and to stop a non-moderator from undoing a
--    moderator's soft-delete on a post/comment they authored.

create or replace function public.guard_profile_changes()
returns trigger
language plpgsql
set search_path = public
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

create function public.guard_post_changes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'postgres' then
    return new;
  end if;

  if (new.is_pinned is distinct from old.is_pinned or new.is_locked is distinct from old.is_locked)
     and not public.is_moderator() then
    raise exception 'Only admins or the owner can pin or lock a post';
  end if;

  if old.is_deleted and not new.is_deleted and not public.is_moderator() then
    raise exception 'Only admins or the owner can restore a deleted post';
  end if;

  return new;
end;
$$;

create trigger posts_guard_changes
  before update on public.posts
  for each row execute function public.guard_post_changes();

create function public.guard_comment_changes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'postgres' then
    return new;
  end if;

  if old.is_deleted and not new.is_deleted and not public.is_moderator() then
    raise exception 'Only admins or the owner can restore a deleted comment';
  end if;

  return new;
end;
$$;

create trigger comments_guard_changes
  before update on public.comments
  for each row execute function public.guard_comment_changes();

-- Also closes a minor gap: edited_at could be forged to an arbitrary value
-- in the same request as an unrelated column change, since it was only
-- conditionally overwritten.
create or replace function public.set_post_timestamps()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.body is distinct from old.body then
    new.edited_at = now();
  else
    new.edited_at = old.edited_at;
  end if;
  return new;
end;
$$;

create or replace function public.set_comment_edited_at()
returns trigger
language plpgsql
as $$
begin
  if new.body is distinct from old.body then
    new.edited_at = now();
  else
    new.edited_at = old.edited_at;
  end if;
  return new;
end;
$$;
