-- Lets members flag a post or comment for moderator review, instead of
-- relying on admins/owner noticing things themselves.

create type public.report_status as enum ('open', 'resolved');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  reason text not null,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  constraint reports_target_check check (
    (post_id is not null and comment_id is null) or (post_id is null and comment_id is not null)
  )
);

create index reports_status_idx on public.reports (status);

alter table public.reports enable row level security;

create policy "Reporters and moderators can view reports"
  on public.reports for select
  using (auth.uid() = reporter_id or public.is_moderator());

create policy "Members can create reports"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create policy "Moderators can resolve reports"
  on public.reports for update
  using (public.is_moderator())
  with check (public.is_moderator());

grant select, insert, update on public.reports to authenticated;
