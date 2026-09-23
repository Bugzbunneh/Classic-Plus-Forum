# Classic Plus Forum

## Project brief

An online forum for a guild in **World of Warcraft: Forever** (the newest version of the game,
releasing soon). The guild's name has not been decided yet.

This is the founding premise for the project — refer back to this section whenever we resume
work on the codebase.

### Theme

Warcraft-themed visual design: charcoal greys through all shades, greens through all shades,
plus other colours pulled from Warcraft's own palette where they fit.

### Concept

A simple, oldschool forum (think classic phpBB/vBulletin-style boards, not a modern social
feed). Topics/categories range from general discussion and social introductions to
game-specific areas like class discussion, gameplay, and events.

### Core features

- User accounts (registration/login)
- Roles, assigned per user, default to **Member** on signup:
  - **Member** — base role, can post/reply
  - **Admin** — moderation capabilities
  - **Owner** — full control, presumably above Admin
  - (Exact capabilities per role to be defined as we build)
- Users can create new topics/posts and comment on existing ones
- Moderation tooling so Admins/Owner can keep the forums clean

## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Package manager:** pnpm
- **Styling:** Tailwind CSS
- **Backend/DB/Auth:** Supabase (hosted Postgres + Auth), with Row Level Security policies used
  to enforce role-based permissions (member/admin/owner) at the database level

## Database schema

Defined in [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql),
with starter data in [`supabase/seed.sql`](supabase/seed.sql).

- **`profiles`** — one row per authenticated user (extends Supabase's own `auth.users`).
  Holds `username`, `display_name`, `avatar_url`, `bio`, and `role`
  (`member` / `admin` / `owner`, defaults to `member`). Created automatically on signup
  via a trigger.
- **`categories`** — top-level forum sections (Introductions, General Discussion,
  Class & Gameplay, Events, ...).
- **`posts`** — a top-level thread within a category (title + body), with `is_pinned`,
  `is_locked`, and `is_deleted` flags for moderation.
- **`comments`** — a reply to a post.

Role enforcement lives in the database, not just the app:

- Row Level Security policies mean anyone can read; only the author can edit their own
  post/comment; only `admin`/`owner` can edit or delete anyone's post/comment, lock/pin
  posts, or manage categories.
- A database trigger blocks role changes from anyone except the `owner`, and blocks
  ban/unban from anyone below `admin` — so this can't be bypassed by calling the API
  directly, only by going through app logic that's actually allowed to do it.

To apply the schema, paste the migration file into the Supabase project's SQL Editor (or,
once the project is linked with the Supabase CLI, run `supabase db push`), then run
`seed.sql` to add the starter categories.

## Getting started

Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

You'll need a Supabase project for the database and auth. Copy `.env.example` to `.env.local`
and fill in your Supabase project URL and anon key.

## Authentication

Email/password and Discord OAuth, both via Supabase Auth (`src/lib/actions/auth.ts`). A new
signup creates a `profiles` row automatically (via a database trigger) with the default
`member` role.

## TODO

- **Enable Discord OAuth in Supabase.** The sign-in/sign-up buttons call
  `supabase.auth.signInWithOAuth({ provider: 'discord' })`, but this won't work until Discord
  is set up as a provider:
  1. Create an application at <https://discord.com/developers/applications>.
  2. Add redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`.
  3. Copy the Client ID and Client Secret into Supabase dashboard → Authentication →
     Sign In / Providers → Discord.
  - Email/password auth works today without this step.
- Category → post → comment pages (clicking a category on the homepage currently 404s).
- Apply the Warcraft charcoal/green theme (currently default Tailwind styling).
