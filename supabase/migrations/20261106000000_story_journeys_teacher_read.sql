-- Guru boleh membaca perjalanan simulasi (saldo akhir, target, pilihan tiap langkah) siswa di kelas miliknya.
-- Pola sama dengan progress_select_teacher pada user_module_progress. Hanya SELECT, tidak ada tulis.
create policy story_journeys_select_teacher on public.story_journeys
  for select
  using (
    user_id in (
      select id from public.users
      where class_id in (select current_teacher_class_ids())
    )
  );
