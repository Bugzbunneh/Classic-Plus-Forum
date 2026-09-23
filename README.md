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

## Getting started

Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

You'll need a Supabase project for the database and auth. Copy `.env.example` to `.env.local`
once it exists and fill in your Supabase project URL and anon key.
