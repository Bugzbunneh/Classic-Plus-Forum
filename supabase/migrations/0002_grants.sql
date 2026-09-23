-- RLS policies filter rows, but Postgres still requires table-level GRANTs
-- before PostgREST's anon/authenticated roles can touch a table at all.
-- The RLS policies from 0001 remain the actual access control; these grants
-- just let those roles reach the tables in the first place.

grant usage on schema public to anon, authenticated;

grant select on public.profiles, public.categories, public.posts, public.comments
  to anon, authenticated;

grant update on public.profiles to authenticated;
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.posts to authenticated;
grant insert, update, delete on public.comments to authenticated;
