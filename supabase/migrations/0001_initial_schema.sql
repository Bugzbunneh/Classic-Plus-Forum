-- Initial schema for Classic Plus Forum
-- Tables: profiles, categories, posts, comments
-- Terminology follows the project brief: a "post" is a top-level thread in a
-- category, a "comment" is a reply to a post.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('member', 'admin', 'owner');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per auth.users, holding forum-specific fields (including role).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  role public.user_role not null default 'member',
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

-- Top-level forum sections, e.g. "General Discussion", "Class & Gameplay", "Events".
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- A top-level thread within a category.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  slug text not null,
  body text not null,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  edited_at timestamptz,
  unique (category_id, slug)
);

-- A reply to a post.
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index posts_category_id_idx on public.posts (category_id);
create index comments_post_id_idx on public.comments (post_id);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so RLS on `profiles` doesn't recurse)
-- ---------------------------------------------------------------------------

create function public.current_user_role()
returns public.user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_moderator()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'owner'), false);
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Auto-create a profile row whenever a new auth user signs up. Defaults to
-- the 'member' role via the profiles.role column default.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only the owner can promote/demote roles. This runs regardless of which RLS
-- policy allowed the UPDATE, so it backstops the "moderators can update any
-- profile" policy below (e.g. an admin can ban a member but not grant admin).
create function public.guard_profile_changes()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and public.current_user_role() is distinct from 'owner' then
    raise exception 'Only the owner can change roles';
  end if;
  if new.is_banned is distinct from old.is_banned and not public.is_moderator() then
    raise exception 'Only admins or the owner can change ban status';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_changes
  before update on public.profiles
  for each row execute function public.guard_profile_changes();

-- Keep posts.updated_at current, and stamp edited_at when the body changes.
create function public.set_post_timestamps()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.body is distinct from old.body then
    new.edited_at = now();
  end if;
  return new;
end;
$$;

create trigger posts_set_timestamps
  before update on public.posts
  for each row execute function public.set_post_timestamps();

create function public.set_comment_edited_at()
returns trigger
language plpgsql
as $$
begin
  if new.body is distinct from old.body then
    new.edited_at = now();
  end if;
  return new;
end;
$$;

create trigger comments_set_edited_at
  before update on public.comments
  for each row execute function public.set_comment_edited_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Moderators can update any profile"
  on public.profiles for update
  using (public.is_moderator());

-- categories
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy "Moderators manage categories"
  on public.categories for all
  using (public.is_moderator())
  with check (public.is_moderator());

-- posts
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (not is_deleted or public.is_moderator());

create policy "Members can create posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Authors can update their own unlocked posts"
  on public.posts for update
  using (auth.uid() = author_id and not is_locked)
  with check (auth.uid() = author_id);

create policy "Moderators can update any post"
  on public.posts for update
  using (public.is_moderator());

create policy "Moderators can delete any post"
  on public.posts for delete
  using (public.is_moderator());

-- comments
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (not is_deleted or public.is_moderator());

create policy "Members can create comments on unlocked posts"
  on public.comments for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.posts p
      where p.id = post_id and not p.is_locked and not p.is_deleted
    )
  );

create policy "Authors can update their own comments"
  on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Moderators can update any comment"
  on public.comments for update
  using (public.is_moderator());

create policy "Moderators can delete any comment"
  on public.comments for delete
  using (public.is_moderator());
