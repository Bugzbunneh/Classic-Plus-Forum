-- Same bug class as 0004: these were marked `security definer`, which makes
-- `current_user` inside them resolve to the function's owner (postgres)
-- rather than the actual caller, so the "allow direct postgres access"
-- bypass was always true and the rate limit never actually applied.
-- Dropping `security definer` fixes it - counting rows in public.posts and
-- public.comments doesn't need elevated privileges anyway, since both
-- tables are already readable by everyone via RLS.

create or replace function public.enforce_post_rate_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  recent_count integer;
begin
  if current_user = 'postgres' then
    return new;
  end if;

  select count(*) into recent_count
  from public.posts
  where author_id = new.author_id and created_at > now() - interval '1 minute';

  if recent_count >= 5 then
    raise exception 'You are posting too quickly. Please wait a moment and try again.';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_comment_rate_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  recent_count integer;
begin
  if current_user = 'postgres' then
    return new;
  end if;

  select count(*) into recent_count
  from public.comments
  where author_id = new.author_id and created_at > now() - interval '1 minute';

  if recent_count >= 10 then
    raise exception 'You are commenting too quickly. Please wait a moment and try again.';
  end if;

  return new;
end;
$$;
