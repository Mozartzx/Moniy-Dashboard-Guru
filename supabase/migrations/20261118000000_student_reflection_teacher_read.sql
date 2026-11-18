-- Guru boleh membaca refleksi dan kesimpulan siswa di kelas miliknya (halaman detail siswa).
-- Pola sama dengan story_journeys_select_teacher. Hanya SELECT, tidak ada tulis.
create policy story_reflections_select_teacher on public.story_reflections
  for select
  using (user_id in (select id from public.users where class_id in (select current_teacher_class_ids())));

create policy story_conclusions_select_teacher on public.story_conclusions
  for select
  using (user_id in (select id from public.users where class_id in (select current_teacher_class_ids())));
