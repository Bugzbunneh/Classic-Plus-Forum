-- A single simple reaction (like a thumbs-up) on posts/comments - kept to
-- one type deliberately, to match the plain oldschool-forum brief rather
-- than a full emoji-reaction picker.

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint reactions_target_check check (
    (post_id is not null and comment_id is null) or (post_id is null and comment_id is not null)
  ),
  constraint reactions_unique_post unique (user_id, post_id),
  constraint reactions_unique_comment unique (user_id, comment_id)
);

create index reactions_post_id_idx on public.reactions (post_id);
create index reactions_comment_id_idx on public.reactions (comment_id);

alter table public.reactions enable row level security;

create policy "Reactions are viewable by everyone"
  on public.reactions for select
  using (true);

create policy "Members can add their own reactions"
  on public.reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Members can remove their own reactions"
  on public.reactions for delete
  using (auth.uid() = user_id);

grant select on public.reactions to anon, authenticated;
grant insert, delete on public.reactions to authenticated;
