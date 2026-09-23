-- Records who did what: role/ban changes, and pin/lock/delete/restore on
-- posts and comments. Logged via AFTER UPDATE triggers (separate from the
-- BEFORE guard triggers) so every path that changes these columns is
-- captured consistently, not just the ones the app happens to call through.

create table public.moderation_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid not null,
  detail text,
  created_at timestamptz not null default now()
);

alter table public.moderation_log enable row level security;

create policy "Moderators can view the moderation log"
  on public.moderation_log for select
  using (public.is_moderator());

grant select on public.moderation_log to authenticated;

create function public.log_profile_changes()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    insert into public.moderation_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), 'role_changed', 'profile', new.id, old.role || ' -> ' || new.role);
  end if;
  if new.is_banned is distinct from old.is_banned then
    insert into public.moderation_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), case when new.is_banned then 'banned' else 'unbanned' end, 'profile', new.id, null);
  end if;
  return new;
end;
$$;

create trigger profiles_log_changes
  after update on public.profiles
  for each row execute function public.log_profile_changes();

create function public.log_post_changes()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_pinned is distinct from old.is_pinned then
    insert into public.moderation_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), case when new.is_pinned then 'post_pinned' else 'post_unpinned' end, 'post', new.id, new.title);
  end if;
  if new.is_locked is distinct from old.is_locked then
    insert into public.moderation_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), case when new.is_locked then 'post_locked' else 'post_unlocked' end, 'post', new.id, new.title);
  end if;
  if new.is_deleted is distinct from old.is_deleted then
    insert into public.moderation_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), case when new.is_deleted then 'post_deleted' else 'post_restored' end, 'post', new.id, new.title);
  end if;
  return new;
end;
$$;

create trigger posts_log_changes
  after update on public.posts
  for each row execute function public.log_post_changes();

create function public.log_comment_changes()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_deleted is distinct from old.is_deleted then
    insert into public.moderation_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), case when new.is_deleted then 'comment_deleted' else 'comment_restored' end, 'comment', new.id, null);
  end if;
  return new;
end;
$$;

create trigger comments_log_changes
  after update on public.comments
  for each row execute function public.log_comment_changes();
