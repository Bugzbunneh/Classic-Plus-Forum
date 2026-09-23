-- Basic anti-spam: caps how many posts/comments a single author can create
-- per minute. Enforced in the database so it can't be bypassed by calling
-- the API directly.

create function public.enforce_post_rate_limit()
returns trigger
language plpgsql
security definer set search_path = public
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

create trigger posts_rate_limit
  before insert on public.posts
  for each row execute function public.enforce_post_rate_limit();

create function public.enforce_comment_rate_limit()
returns trigger
language plpgsql
security definer set search_path = public
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

create trigger comments_rate_limit
  before insert on public.comments
  for each row execute function public.enforce_comment_rate_limit();
