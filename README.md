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
  Holds `username`, `display_name`, `avatar_url`, `bio`, `role`
  (`member` / `admin` / `owner`, defaults to `member`), and `is_banned`. Created
  automatically on signup via a trigger.
- **`sections`** — top-level groupings shown on the homepage (currently "Social" and "Game").
- **`categories`** — forum boards within a section (Introductions, General Discussion under
  Social; Class & Gameplay, Events under Game).
- **`posts`** — a top-level thread within a category (title + body), with `is_pinned`,
  `is_locked`, and `is_deleted` flags for moderation.
- **`comments`** — a reply to a post.
- **`reactions`** — a single simple 👍 per user per post/comment (one reaction type on
  purpose, not a full emoji picker).
- **`reports`** — a member flagging a post/comment for moderator review (`open`/`resolved`).
- **`notifications`** — created automatically (via a trigger on comment insert) to tell a
  post's author someone replied; never self-notifies.
- **`moderation_log`** — an append-only record of role/ban changes and pin/lock/delete/restore
  on posts/comments, written by triggers so it captures every path that changes those
  columns, not just the ones the app happens to call through.

Role enforcement lives in the database, not just the app:

- Row Level Security policies mean anyone can read; only the author can edit their own
  post/comment; only `admin`/`owner` can edit or delete anyone's post/comment, lock/pin
  posts, or manage categories/sections.
- Database triggers close gaps RLS can't express on its own (Postgres RLS has no
  column-level granularity — see `0004_fix_guards.sql`): role changes are blocked from
  anyone except the `owner`, ban/unban is blocked from anyone below `admin`, and a
  non-moderator author can't pin/lock their own post or undo a moderator's soft-delete on
  their own post/comment.
- `is_banned` actually blocks new posts/comments (`0009_ban_enforcement.sql`) — it isn't
  just a display flag.
- Role changes can only happen via a direct `postgres` connection (a migration or the SQL
  Editor) — never through the app or API, even with elevated keys. This is deliberate: it's
  what makes bootstrapping the very first owner possible without opening a self-promotion
  hole for everyone else. See `0008_promote_owner.sql` for how the first owner was set.
- Posting/commenting is rate-limited (5 posts, 10 comments per minute per author —
  `0016_rate_limiting.sql`) to deter spam/scripted flooding.

**A recurring bug worth knowing about:** several trigger functions were written as
`security definer` while also checking `current_user = 'postgres'` as a "only allow direct
database access" bypass. Inside a `security definer` function, `current_user` resolves to the
function's *owner* (always `postgres`, since migrations run as `postgres`) rather than the
actual caller — so that bypass check was silently always true, defeating the guard entirely.
This happened twice (`guard_profile_changes` in `0004_fix_guards.sql`, and the rate-limit
triggers in `0018_fix_rate_limit_guard.sql`) and was only caught by live end-to-end testing,
not by reading the SQL. If you add a similar guard: don't mark it `security definer` unless it
actually needs to bypass RLS on a *different* table — check the actual behavior with a live
test, not just a code read.

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

Run `pnpm test` for the unit test suite.

## Authentication

Email/password and Discord OAuth, both via Supabase Auth (`src/lib/actions/auth.ts`). A new
signup creates a `profiles` row automatically (via a database trigger) with the default
`member` role.

**Password reset** — `/forgot-password` calls `resetPasswordForEmail` with `redirectTo` pointed
at the existing `/auth/callback` route (same code-exchange path OAuth already uses), landing
the user on `/reset-password` with a live session to set a new password via `updateUser`.
`/reset-password` doubles as a general "change password" page, linked from `/settings`, since
the underlying call is identical either way. Note: Supabase's email sending rejects reserved
domains like `@example.com` — the `testmember` test account can't receive a real reset email,
so that specific email-delivery step needs a real, reachable address to test end-to-end (the
`updateUser` mechanism itself is verified).

**Profile editing** — `/settings` now also has a form for display name and bio
(`updateProfile` in `src/lib/actions/profile.ts`); bio shows on `/u/[username]` when set.

## Role management

`/admin/members` (linked from the header as "Members" for admins/owners) lists every member.
The owner can change anyone's role from there; admins and the owner can ban/unban. Both
actions (`src/lib/actions/members.ts`) rely on the database's RLS policies and triggers as the
actual enforcement — the UI only decides what to show, not what's allowed.

### Switching roles locally for testing

```bash
pnpm role:set                                   # TEST_USERNAME + TEST_ROLE from .env.local
pnpm role:set <member|admin|owner>              # TEST_USERNAME, role overridden
pnpm role:set <username> <member|admin|owner>   # both overridden
```

Change `TEST_ROLE` in `.env.local` and re-run `pnpm role:set` with no arguments as the fastest
way to flip your own account between roles.

There's also a second, permanent test account (role `member`, credentials in
`TEST_MEMBER_EMAIL`/`TEST_MEMBER_PASSWORD` in `.env.local`) for logging in as a plain member in
a separate browser/incognito window alongside your own account, to see both views at once
without needing to flip roles back and forth.

Since role changes are only possible via a direct `postgres` connection (see above), this
script (`scripts/set-role.mjs`) *is* that direct connection — it talks straight to Postgres
through the same pooler the Supabase CLI resolved during `supabase link`
(`supabase/.temp/pooler-url`), bypassing the app and RLS entirely, the same way a migration
does. Use it to flip your own test account between roles and see how the UI looks for each one.
This capability must never be exposed through the running app itself.

## Theme

Defined as Tailwind v4 theme tokens in [`src/app/globals.css`](src/app/globals.css) — use
these utility classes (`bg-charcoal-900`, `text-green-400`, etc.) rather than Tailwind's stock
`zinc`/`emerald`/etc. when building new pages, so everything stays on the same palette:

- **`charcoal-950` → `charcoal-200`** — page/panel backgrounds, borders, and body text
  (950 darkest, 200 near-white).
- **`green-950` → `green-400`** — primary brand/action color (links, buttons, "member" tone).
- **`gold-950`, `gold-600` → `gold-400`** — accent for hierarchy/emphasis (owner badge, pinned
  post marker).
- **`danger-950`, `danger-600` → `danger-400`** — muted blood-red for destructive actions
  (delete buttons, error messages).

The site is dark-only by design (no light mode) — `color-scheme: dark` is set globally rather
than branching on `prefers-color-scheme`.

## Posts, comments, and profiles

- Authors (or moderators) can edit their own post/comment body after posting
  (`updatePost`/`updateComment` in `src/lib/actions/posts.ts`). Comment editing happens inline
  on the post page via a `?editComment=<id>` query param — no client-side JS needed, matching
  the rest of the app's full-page-reload style.
- Post bodies and comments support a deliberately minimal `**bold**`/`*italic*` syntax
  (`src/lib/format-text.tsx`), rendered as React text nodes — never `dangerouslySetInnerHTML`,
  so there's no HTML-injection surface no matter what a user types.
- Every post/comment textarea (new post, edit post, reply, inline comment edit) uses a shared
  `Composer` (`src/components/composer.tsx`) — a second piece of client-side JS alongside the
  reaction button, since an emoji picker and clipboard paste handling need client state. It
  adds an emoji button and lets you paste an image straight from the clipboard instead of
  only browsing for one (constructs a `DataTransfer` and assigns it to the same hidden file
  input browsing would use, so the server actions needed no changes at all).
- Category post lists and post comment threads are paginated (20 per page).
- `/u/[username]` shows a member's avatar, role, join date, and recent posts.
- `/settings` lets a signed-in user upload an avatar (Supabase Storage, `avatars` bucket —
  `0017_avatar_storage.sql`). Each user can only write inside their own `<user_id>/` folder;
  uploaded avatars are publicly readable. Changing display name/bio isn't wired up yet (see
  TODO).
- Avatars appear next to author names on category post lists (`src/components/avatar.tsx` —
  falls back to a colored initial when there's no avatar).
- The post itself and every comment show a separate author info box (`src/components/author-box.tsx`)
  — classic phpBB-style: avatar, name, role badge, total post+comment count, and an achievement
  badge for activity milestones (`src/lib/achievements.ts`: 10 = Adventurer, 50 = Veteran,
  200 = Legend). Stacks above the content on mobile, sits as a sidebar column on larger
  screens. Counts are batched into two queries (all posts/comments by the authors shown on the
  page) rather than one query per author.
- `/u/[username]` shows every achievement tier, not just the highest one earned — locked
  tiers are dimmed, and hovering any badge (earned or not) shows how it's earned/how much
  further there is to go (`milestoneUnlockText`). Pure CSS `group`/`group-hover`, no client JS
  needed for a hover-only tooltip like this.
- Posts and comments can carry one optional image attachment (`post-images` bucket —
  `0023_post_images.sql`, same user-scoped-folder pattern as avatars). Uploaded server-side in
  `src/lib/storage.ts`, which rejects non-image files and anything over 5MB regardless of what
  the client's `accept="image/*"` hint would otherwise let through.

## Moderation tools

- **Reports** (`/report` to file one, `/admin/reports` to review) — any signed-in member can
  flag a post or comment with a reason; admins/owner see open reports and can resolve them.
  The header shows an open-report count badge for moderators.
- **Moderation log** (`/admin/log`) — a read-only audit trail of role/ban changes and
  pin/lock/delete/restore actions, newest first.

## Notifications and reactions

- Replying to someone's post notifies them (bell-style unread count in the header,
  `/notifications` to view and mark all read). Never notifies you of your own replies.
- A single 👍 reaction is available on posts and comments (not a full emoji picker, to match
  the plain oldschool-forum brief). Hovering the count shows who reacted (up to 3 names, then
  "and N others" opens a popup listing everyone) — this is the one piece of client-side
  JavaScript in an otherwise fully server-rendered app (`src/components/reaction-button.tsx`),
  since a hover tooltip and a popup genuinely need client state. The actual reaction toggle
  still works as a plain form action underneath it.

## Testing

- `pnpm test` runs a small Vitest suite (currently just `src/lib/slug.test.ts`) — a starting
  point, not full coverage.
- The database layer (RLS policies, triggers, guards) has been verified by hand through live
  end-to-end scripts against the real Supabase project for each new feature (signup → act →
  assert → clean up test data), not by a checked-in automated suite. Setting up Supabase's
  local dev stack (needs Docker) would be the natural next step to make that repeatable.

## TODO

### Before real users sign up

- Re-enable "Confirm email" in Supabase (Authentication → Providers → Email) — it's currently
  off, which was needed to test signup end-to-end without an email inbox.
- **Small leftover test files.** An empty `e2e-test-bucket` (from testing avatar upload
  policies) and a handful of orphaned test images under deleted test users' folders in
  `post-images` couldn't be cleaned up via migration (Postgres blocks direct `DELETE` on
  `storage.buckets`/objects — "Use the Storage API instead"). All harmless and unused by the
  app; clean up from the Supabase dashboard's Storage section whenever convenient.

### Further hardening

- **Rate-limit signups**, not just posts/comments — nothing currently stops a script from
  creating accounts. Supabase Auth has some built-in abuse protection, but nothing forum-side.
- **Fuller automated test coverage.** `pnpm test` covers pure utility functions; the RLS
  policies and triggers are still only verified by hand via live scripts against Supabase, not
  a checked-in, repeatable suite (would need Supabase's local dev stack, which needs Docker).

### Deferred on purpose

- **Discord OAuth.** The sign-in/sign-up buttons call
  `supabase.auth.signInWithOAuth({ provider: 'discord' })`, but this won't work until Discord
  is set up as a provider:
  1. Create an application at <https://discord.com/developers/applications>.
  2. Add redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`.
  3. Copy the Client ID and Client Secret into Supabase dashboard → Authentication →
     Sign In / Providers → Discord.
  - Email/password auth works today without this step. Being picked up last, after the rest
    of the forum is built.
