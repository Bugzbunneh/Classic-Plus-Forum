-- Notifies a post's author when someone replies to it.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  type text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, is_read);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark their own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, update on public.notifications to authenticated;
-- No insert grant for authenticated: notifications are only ever created by
-- the trigger below, which runs as security definer and bypasses RLS.

create function public.notify_on_comment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  post_author_id uuid;
begin
  select author_id into post_author_id from public.posts where id = new.post_id;

  if post_author_id is not null and post_author_id <> new.author_id then
    insert into public.notifications (user_id, actor_id, post_id, comment_id, type)
    values (post_author_id, new.author_id, new.post_id, new.id, 'reply');
  end if;

  return new;
end;
$$;

create trigger comments_notify_author
  after insert on public.comments
  for each row execute function public.notify_on_comment();
