-- Optional single image attachment on posts and comments, plus the storage
-- bucket to hold them. Same user-scoped-folder pattern as avatars
-- (0017_avatar_storage.sql): each user can only write inside their own
-- <user_id>/ folder, uploads are publicly readable.

alter table public.posts add column image_url text;
alter table public.comments add column image_url text;

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "Post images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Users can upload their own post images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
