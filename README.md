# Classic Plus Forum

A full-stack forum for a *World of Warcraft* guild, built with Next.js and Supabase.
Database-enforced role-based moderation (member/admin/owner), image uploads, reactions,
notifications, an achievement system, and a Warcraft-inspired UI with springy, responsive
interactions — server-rendered, with client components only where interaction genuinely needs
client state.

[![CI](https://github.com/Bugzbunneh/Classic-Plus-Forum/actions/workflows/ci.yml/badge.svg)](https://github.com/Bugzbunneh/Classic-Plus-Forum/actions/workflows/ci.yml)

🔗 **Live demo:** [classic-plus-forum.vercel.app](https://classic-plus-forum.vercel.app/)

## Highlights

- **Security lives in the database, not just the app.** Every permission — who can post, edit,
  moderate content, or change someone's role — is enforced by Postgres Row Level Security
  policies and triggers, so the rules hold even against a direct API call, not only through the
  UI. See [Database schema](#database-schema).
- **Two real security bugs found by testing the live database, not just reading the code** — a
  `security definer` trigger that silently defeated its own guard, in two unrelated features.
  Root-caused and documented as a reusable lesson, not just patched — see
  [Database schema](#database-schema).
- Full auth (email/password, OAuth-ready, password reset), role management, image uploads with
  clipboard paste, reactions with a hover-to-see-who tooltip, notifications, and an achievement
  system with unlock hints — see [Posts, comments, and profiles](#posts-comments-and-profiles).
- **Interactions that feel alive.** Reactions update instantly (`useOptimistic`) with a spark
  burst, every form button shows a pending spinner, pages cross-fade with React's
  `<ViewTransition>`, and lists stagger in — all mostly CSS, and all switched off under
  `prefers-reduced-motion`. See [Design](#design).
- Refactored for SOLID principles once the feature set stabilized: a shared data-access layer,
  auth/role guards pulled out of ~10 duplicated call sites, and a 459-line page split into
  focused, prop-driven components. See [Code organization](#code-organization).

## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Package manager:** pnpm
- **Styling:** Tailwind CSS
- **Backend/DB/Auth:** Supabase (hosted Postgres + Auth), with Row Level Security policies used
  to enforce role-based permissions (member/admin/owner) at the database level

## Try it yourself

Log in with a demo account to try posting, commenting, and reacting without creating one:

- **Email:** `testmember@example.com`
- **Password:** `TestMember123!`

This account has the `member` role — enough to see everything except the admin/moderation
views. It's a real seeded account with no personal data behind it.

## A note on how this was built

This project was built collaboratively with Claude Code (Anthropic's AI coding agent) — I
directed the architecture, made the product/security/UX decisions, and reviewed everything that
shipped, but a meaningful share of the line-by-line implementation is AI-generated under that
direction. I think that's an increasingly normal and honest way to build software. The
[Database schema](#database-schema) section below has a concrete example of what that review
looked like in practice: two real security bugs a first pass introduced, caught only by testing
actual behavior against the live database rather than trusting the code as written.

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

## Code organization

A few shared pieces exist specifically to avoid repeating the same logic across pages, each
with one clear job:

- **`src/lib/dal.ts`** — `getCurrentProfile` (may be null), `requireProfile(nextPath)` (redirects
  to `/login` if signed out), `requireModerator()` (also redirects home if signed in but not
  admin/owner). Every page picks whichever matches whether a signed-in/moderator user is
  optional or required, rather than each writing its own null-check-and-redirect.
- **`src/lib/roles.ts`** — `isModerator(role)` and the `Role` type, derived from the database's
  own generated enum rather than a hand-typed `"member" | "admin" | "owner"` repeated
  everywhere.
- **`src/lib/queries/`** — read-side data access, split by domain rather than one grab-bag file:
  `categories.ts` (category lookups, homepage activity summaries), `authors.ts` (author
  activity counts), `reactions.ts` (reaction summaries). Keeps the Supabase-shaped querying and
  `Map`-building out of page components, which just ask for `getPostReactions(...)` and render
  the result.
- **`src/lib/redirect-with-error.ts`** — `redirectWithError(path, message)` for the
  "redirect back to this page with `?error=` set" pattern every form action uses, shown by the
  shared `ErrorBanner` component.
- **`src/lib/ensure-write-succeeded.ts`** — checks an update/delete actually changed a row.
  When RLS blocks a write, Postgres doesn't raise an error; the write just matches zero rows,
  so without this a refused moderation action would look like it worked.
- **`src/lib/safe-next-path.ts`** — only lets the post-login `?next=` redirect point at a path on
  this site, so a crafted login link can't bounce someone to another domain.
- **`src/lib/form-data.ts`** — `getFormString`, so a hand-crafted request missing a field gets
  a validation error rather than a 500 (Server Actions are public endpoints).
- **`src/lib/pagination.ts`** — `getPageRange`/`getTotalPages`, shared by the category page's
  posts and the post page's comments.
- **`src/components/pagination.tsx`**, **`role-badge.tsx`** — small shared UI for patterns that
  were previously copy-pasted with minor variations across 2-3 pages each.
- **Page building blocks** — `PageContainer` (every page's `<main>` and its view transition),
  `PageHeader`, `CenteredPanel` (login, signup, reports), `Field`, `SubmitButton`, `EmptyState`,
  `IconTile`, `ErrorBanner`. Pages compose these rather than repeating layout markup.

Server actions are split by what they act on, not bundled into one big file: `actions/posts.ts`,
`actions/comments.ts`, `actions/reactions.ts`, `actions/profile.ts`, `actions/reports.ts`,
`actions/members.ts`, `actions/notifications.ts`, `actions/auth.ts` - each independently
readable without scrolling past unrelated concerns.

`src/components/post/` groups the four components that only ever render within the post detail
page - `PostArticle`, `CommentItem`, `AuthorBox`, `ReactionButton` - so that page composes them
(both `PostArticle`/`CommentItem` take plain props, not Supabase rows) rather than inlining
~300 lines of JSX for the post and every comment; the page itself is left doing only
data-fetching and orchestration. Deliberately a plain feature folder under the existing
`src/components/` tree, not Next.js's route-colocated `_components` convention - that would mean
every import path through here carries the literal `[slug]/[postSlug]` route brackets, which is
harder to read for no real benefit, since nothing here needs to be physically inside the route
folder to work.

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
- `is_banned` actually blocks new posts/comments (`0009_ban_enforcement.sql`) and reactions
  (`0024_storage_limits_and_activity_views.sql`) — it isn't just a display flag.
- Upload rules (PNG/JPEG/GIF/WebP only, 5MB max) are set on the storage buckets themselves in
  `0024`, not just checked in the app — so they also hold for someone calling the Storage API
  directly with the public anon key. SVG is excluded because it can carry script.
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

## Authentication

Email/password and Discord OAuth, both via Supabase Auth (`src/lib/actions/auth.ts`). A new
signup creates a `profiles` row automatically (via a database trigger) with the default
`member` role.

**Password reset** — `/forgot-password` calls `resetPasswordForEmail` with `redirectTo` pointed
at the existing `/auth/callback` route (same code-exchange path OAuth already uses), landing
the user on `/reset-password` with a live session to set a new password via `updateUser`.
`/reset-password` doubles as a general "change password" page, linked from `/settings`, since
the underlying call is identical either way. Note: Supabase's email sending rejects reserved
domains like `@example.com` — the demo account can't receive a real reset email, so that
specific email-delivery step needs a real, reachable address to test end-to-end (the
`updateUser` mechanism itself is verified).

**Profile editing** — `/settings` has a form for display name and bio
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
`TEST_MEMBER_EMAIL`/`TEST_MEMBER_PASSWORD` in `.env.local` — the same one described in
[Try it yourself](#try-it-yourself)) for logging in as a plain member in a separate
browser/incognito window alongside your own account, to see both views at once without needing
to flip roles back and forth.

Since role changes are only possible via a direct `postgres` connection (see above), this
script (`scripts/set-role.mjs`) *is* that direct connection — it talks straight to Postgres
through the same pooler the Supabase CLI resolved during `supabase link`
(`supabase/.temp/pooler-url`), bypassing the app and RLS entirely, the same way a migration
does. Use it to flip your own test account between roles and see how the UI looks for each one.
This capability must never be exposed through the running app itself.

## Design

Inspired by WoW's own UI rather than copying its artwork: gold-trimmed panels, carved-stone
display type, item-rarity colours, and navy item tooltips. Everything lives in
[`src/app/globals.css`](src/app/globals.css).

**Palette** (Tailwind v4 theme tokens — use these rather than stock `zinc`/`emerald`/etc.):

- **`charcoal-975` → `charcoal-100`** — backgrounds, borders, and body text.
- **`green-950` → `green-300`** — primary brand/action colour (links, primary buttons, focus).
- **`gold-950` → `gold-300`** — trim and emphasis (panel borders, headings, pinned threads).
- **`danger-950` → `danger-400`** — destructive actions and errors.
- **`quality-uncommon` / `rare` / `epic` / `legendary`** — WoW item-rarity colours. Achievements
  use them (Adventurer is uncommon green, Veteran rare blue, Legend legendary orange), and so do
  ranks: the owner shows as *Guild Master* (legendary) and admins as *Officer* (epic). The
  underlying role values are unchanged.

**Type:** Cinzel (Google Fonts) for headings, via the `.heading` class, in the spirit of WoW's
title lettering; Geist for body text.

**Reusable classes** (in `@layer components`, so utilities can still override them): `.panel`
(the layered surface every card sits on, with a gold-to-charcoal gradient border) and
`.panel-interactive` (lifts and glows on hover), `.btn` plus `.btn-primary` / `-secondary` /
`-ghost` / `-danger` / `-discord` / `-sm`, `.input`, `.label`, `.chip`, `.wow-tooltip`, and
`.skeleton`.

**Motion:** spring easing (`ease-spring`) on hovers and presses, a light sweep across primary
buttons, staggered `animate-rise-in` entrances for lists (give each item
`style={staggerStyle(index)}`), page cross-fades via React's `<ViewTransition>` inside
`PageContainer` (with the header pinned so it doesn't move), a shimmering `loading.tsx`
skeleton, and a shaking `ErrorBanner`. A `prefers-reduced-motion` rule turns all of it off.

**Icons:** [Lucide](https://lucide.dev) for interface icons, and fantasy icons from
[game-icons.net](https://game-icons.net) by Lorc and Delapouite (CC BY 3.0, credited in the site
footer) for categories, achievements, and the logo. Those are inlined as SVG paths in
`src/components/game-icon.tsx`, so they take on the text colour; category icons are mapped by
slug in `src/lib/category-icons.ts`.

The site is dark-only by design (no light mode) — `color-scheme: dark` is set globally rather
than branching on `prefers-color-scheme`. A themed `not-found.tsx` and `error.tsx` cover
unmatched routes and unexpected runtime errors, rather than Next.js's plain defaults.

## Posts, comments, and profiles

- Authors (or moderators) can edit their own post/comment body after posting
  (`updatePost`/`updateComment` in `src/lib/actions/posts.ts`). Comment editing happens inline
  on the post page via a `?editComment=<id>` query param — no client-side JS needed, matching
  the rest of the app's full-page-reload style.
- Post bodies and comments support a deliberately minimal `**bold**`/`*italic*` syntax
  (`src/lib/format-text.tsx`), rendered as React text nodes — never `dangerouslySetInnerHTML`,
  so there's no HTML-injection surface no matter what a user types.
- Every post/comment textarea (new post, edit post, reply, inline comment edit) uses a shared
  `Composer` (`src/components/composer.tsx`) — a client component, since an emoji picker and
  clipboard paste handling need client state. It adds an emoji button and lets you paste an
  image straight from the clipboard instead of
  only browsing for one (constructs a `DataTransfer` and assigns it to the same hidden file
  input browsing would use, so the server actions needed no changes at all).
- Category post lists and post comment threads are paginated (20 per page).
- `/u/[username]` shows a member's avatar, role, join date, bio, and recent posts.
- `/settings` lets a signed-in user upload an avatar (Supabase Storage, `avatars` bucket —
  `0017_avatar_storage.sql`) and edit their display name/bio. Each user can only write inside
  their own `<user_id>/` folder; uploaded avatars are publicly readable.
- Avatars appear next to author names on category post lists (`src/components/avatar.tsx` —
  falls back to a colored initial when there's no avatar).
- The post itself and every comment show a separate author info box
  (`src/components/post/author-box.tsx`) — classic phpBB-style: avatar, name, role badge, total
  post+comment count, and an achievement badge for activity milestones
  (`src/lib/achievements.ts`: 10 = Adventurer, 50 = Veteran, 200 = Legend). Stacks above the
  content on mobile, sits as a sidebar column on larger screens. Counts come from the
  `author_activity` view, one query for every author on the page.
- Homepage and category-list counts (threads, posts, replies, latest activity) are aggregated
  in Postgres by the `category_activity` and `post_reply_stats` views rather than by fetching
  rows and counting in JavaScript — which would silently undercount once a query passed
  PostgREST's 1000-row response cap. The views use `security_invoker`, so RLS still applies.
- `/u/[username]` shows every achievement tier, not just the highest one earned — locked
  tiers are greyed out with a progress bar, and hovering or focusing any tile shows a WoW-style
  item tooltip with how it's earned or how far there is to go (`milestoneUnlockText`). Pure CSS
  `group-hover`/`group-focus-visible`, no client JS needed for a tooltip like this.
- Posts and comments can carry one optional image attachment (`post-images` bucket —
  `0023_post_images.sql`, same user-scoped-folder pattern as avatars). Uploaded server-side in
  `src/lib/storage.ts`, which checks type and size up front for a friendly error message; the
  bucket enforces the same rules regardless (see [Database schema](#database-schema)).

## Moderation tools

- **Reports** (`/report` to file one, `/admin/reports` to review) — any signed-in member can
  flag a post or comment with a reason; admins/owner see open reports and can resolve them.
  For moderators, the header avatar shows a pulsing dot when reports are open, and the count
  appears next to Reports in the account menu.
- **Moderation log** (`/admin/log`) — a read-only audit trail of role/ban changes and
  pin/lock/delete/restore actions, newest first.

## Notifications and reactions

- Replying to someone's post notifies them (bell-style unread count in the header,
  `/notifications` to view and mark all read). Never notifies you of your own replies.
- A single 👍 reaction is available on posts and comments (not a full emoji picker, to match
  the plain oldschool-forum brief). Hovering the count shows who reacted (up to 3 names, then
  "and N others" opens a popup listing everyone). The button
  (`src/components/post/reaction-button.tsx`) flips instantly with `useOptimistic`, pops, and
  bursts sparks when you add a reaction, then settles on whatever the server returns. The
  server decides whether a click adds or removes, so a stale tab can't get out of sync. The
  toggle is still a plain form action underneath.

**Client components** are kept to the places that genuinely need client state: `Composer`,
`ReactionButton`, `UserMenu` (the header dropdown, built on the native Popover API so
click-outside and Escape come free), `SubmitButton` (`useFormStatus` for the pending spinner),
and Next.js's required `error.tsx`. Everything else renders on the server.

## Testing

- `pnpm test` runs a small Vitest suite covering pure utility functions (slug generation,
  achievement tiers, pagination math, image-upload validation, and the post-login redirect
  guard against off-site tricks like `//evil.example`) — a starting point, not full coverage.
- The database layer (RLS policies, triggers, guards) has been verified by hand through live
  end-to-end scripts against the real Supabase project for each new feature (signup → act →
  assert → clean up test data), not by a checked-in automated suite. Setting up Supabase's
  local dev stack (needs Docker) would be the natural next step to make that repeatable.
- CI (`.github/workflows/ci.yml`) runs lint, tests, and a production build on every push/PR.

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
