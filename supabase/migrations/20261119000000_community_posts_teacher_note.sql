-- Catatan guru pada hasil komunitas kelas, disimpan di server.
alter table public.community_posts add column if not exists teacher_note text;
