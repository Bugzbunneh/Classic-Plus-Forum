-- Starter sections and categories matching the project brief.
insert into public.sections (name, slug, sort_order) values
  ('Social', 'social', 0),
  ('Game', 'game', 1);

insert into public.categories (name, slug, description, sort_order, section_id) values
  (
    'Introductions', 'introductions', 'New to the guild? Say hello here.', 0,
    (select id from public.sections where slug = 'social')
  ),
  (
    'General Discussion', 'general-discussion', 'Anything and everything guild-related.', 1,
    (select id from public.sections where slug = 'social')
  ),
  (
    'Class & Gameplay', 'class-gameplay', 'Builds, rotations, and gameplay discussion.', 0,
    (select id from public.sections where slug = 'game')
  ),
  (
    'Events', 'events', 'Raid nights, guild events, and scheduling.', 1,
    (select id from public.sections where slug = 'game')
  );
