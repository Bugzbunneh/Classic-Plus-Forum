-- Groups categories under sections (e.g. "Social" containing Introductions
-- and General Discussion, "Game" containing Class & Gameplay and Events).

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sections enable row level security;

create policy "Sections are viewable by everyone"
  on public.sections for select
  using (true);

create policy "Moderators manage sections"
  on public.sections for all
  using (public.is_moderator())
  with check (public.is_moderator());

grant select on public.sections to anon, authenticated;
grant insert, update, delete on public.sections to authenticated;

alter table public.categories
  add column section_id uuid references public.sections (id) on delete cascade;

insert into public.sections (name, slug, sort_order) values
  ('Social', 'social', 0),
  ('Game', 'game', 1);

update public.categories
  set section_id = (select id from public.sections where slug = 'social'),
      sort_order = 0
  where slug = 'introductions';

update public.categories
  set section_id = (select id from public.sections where slug = 'social'),
      sort_order = 1
  where slug = 'general-discussion';

update public.categories
  set section_id = (select id from public.sections where slug = 'game'),
      sort_order = 0
  where slug = 'class-gameplay';

update public.categories
  set section_id = (select id from public.sections where slug = 'game'),
      sort_order = 1
  where slug = 'events';

alter table public.categories
  alter column section_id set not null;

create index categories_section_id_idx on public.categories (section_id);
