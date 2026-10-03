-- 1. Enforce upload limits in storage itself. The 5MB / image-only checks
--    lived only in the app, so anyone signed in could bypass them by calling
--    the Storage API directly with the public anon key - e.g. uploading HTML
--    to a public bucket. SVG is deliberately excluded: it can carry script.

update storage.buckets
set
  file_size_limit = 5 * 1024 * 1024,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/gif', 'image/webp']
where id in ('post-images', 'avatars');


-- 2. Banned users could still react - the ban check from 0009 was never
--    added to the reactions insert policy.

alter policy "Members can add their own reactions"
  on public.reactions
  with check (auth.uid() = user_id and not public.current_user_is_banned());


-- 3. Aggregate views for counts the app previously computed by fetching
--    every post and comment row. That silently broke past PostgREST's
--    1000-row response cap (supabase/config.toml `max_rows`).
--
--    security_invoker makes each view run with the caller's permissions, so
--    the RLS policies on posts/comments still apply exactly as before.
--    Deleted posts and comments are excluded explicitly, since moderators
--    can see them through RLS.

create view public.category_activity
with (security_invoker = true) as
with activity as (
  select p.category_id, p.id as post_id, p.author_id, p.created_at, true as is_thread
  from public.posts p
  where not p.is_deleted

  union all

  select p.category_id, p.id as post_id, c.author_id, c.created_at, false as is_thread
  from public.comments c
  join public.posts p on p.id = c.post_id
  where not c.is_deleted and not p.is_deleted
),
totals as (
  select
    category_id,
    count(*) filter (where is_thread) as thread_count,
    count(*) as total_post_count
  from activity
  group by category_id
),
latest as (
  select distinct on (category_id) category_id, post_id, author_id, created_at
  from activity
  order by category_id, created_at desc
)
select
  totals.category_id,
  totals.thread_count,
  totals.total_post_count,
  latest.created_at as last_activity_at,
  latest_post.slug as last_post_slug,
  latest_post.title as last_post_title,
  latest_author.display_name as last_author_name
from totals
join latest on latest.category_id = totals.category_id
join public.posts latest_post on latest_post.id = latest.post_id
left join public.profiles latest_author on latest_author.id = latest.author_id;


create view public.post_reply_stats
with (security_invoker = true) as
select
  post_id,
  count(*) as reply_count,
  max(created_at) as last_reply_at
from public.comments
where not is_deleted
group by post_id;


create view public.author_activity
with (security_invoker = true) as
select author_id, count(*) as activity_count
from (
  select author_id from public.posts where not is_deleted
  union all
  select author_id from public.comments where not is_deleted
) activity
group by author_id;


grant select on public.category_activity, public.post_reply_stats, public.author_activity
  to anon, authenticated;
