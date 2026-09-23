-- Promotes the guild's first owner. Role changes can only happen via a
-- direct postgres connection (migrations, SQL Editor) by design - see
-- guard_profile_changes in 0004_fix_guards.sql.
update public.profiles set role = 'owner' where username = 'Bugzbunneh';
