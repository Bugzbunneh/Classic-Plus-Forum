-- is_banned had no actual effect anywhere - a banned user could still post
-- and comment freely. Blocks banned users from creating new posts/comments.

create function public.current_user_is_banned()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_banned from public.profiles where id = auth.uid()), false);
$$;

alter policy "Members can create posts"
  on public.posts
  with check (auth.uid() = author_id and not public.current_user_is_banned());

alter policy "Members can create comments on unlocked posts"
  on public.comments
  with check (
    auth.uid() = author_id
    and not public.current_user_is_banned()
    and exists (
      select 1 from public.posts p
      where p.id = post_id and not p.is_locked and not p.is_deleted
    )
  );
