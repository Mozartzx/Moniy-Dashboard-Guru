# Data contoh dashboard guru (seed)

Diisi 2026-10-03 ke Supabase produksi, di bawah akun guru `syahranfd@gmail.com` (users.id 39).

## Isi

| Data | Jumlah | Penanda |
|---|---|---|
| Kelas tambahan | X-B (`MONIY-SEEDB1`, 18 siswa), X-C (`MONIY-SEEDC1`, kosong) | id berawalan `MONIY-SEED` |
| Siswa | 50 (32 di X-A `MONIY-UXNAFB`, 18 di X-B) | email `seed.NN@seed.moniy.test` |
| `user_module_progress` | 425 | user_id milik siswa seed |
| `quiz_results` | 87 | user_id milik siswa seed |
| `user_decisions` | 744 | user_id milik siswa seed |
| `gambling_exposure_events` | 62 (X-A), 11 (X-B) | class_id kelas di atas; tanpa kaitan ke siswa |
| `community_groups` | 2 | deskripsi diawali `[SEED]` |
| `community_posts` | 14 (X-A), 5 (X-B) | group seed |
| `group_members` | 50 | group seed |

Pola yang sengaja dibuat: ada siswa nol progres, siswa yang menyelesaikan 16 modul, topik Utang paling lemah, kejadian judi X-A naik tajam di 7 hari terakhir (tingkat Tinggi), X-B turun (Rendah), X-C kosong.

## Celah RLS yang ditemukan

`user_decisions` hanya punya policy `own_read` (`user_id = current_app_user_id()`). Guru tidak bisa membaca keputusan siswanya, jadi riwayat keputusan di halaman Rekam Siswa akan kosong walau datanya ada. Perbaikan (belum diterapkan, tunggu persetujuan):

```sql
create policy decisions_select_teacher on public.user_decisions
  for select using (
    user_id in (select id from public.users where class_id in (select current_teacher_class_ids()))
  );
```

## Membersihkan seed

```sql
delete from public.community_posts where group_id in (select id from public.community_groups where description like '[SEED]%');
delete from public.group_members where group_id in (select id from public.community_groups where description like '[SEED]%');
delete from public.community_groups where description like '[SEED]%';
delete from public.gambling_exposure_events where class_id in ('MONIY-UXNAFB','MONIY-SEEDB1') and url like 'https://%.example/%';
delete from public.user_decisions where user_id in (select id from public.users where email like '%@seed.moniy.test');
delete from public.quiz_results where user_id in (select id from public.users where email like '%@seed.moniy.test');
delete from public.user_module_progress where user_id in (select id from public.users where email like '%@seed.moniy.test');
delete from public.users where email like '%@seed.moniy.test';
delete from public.classes where id in ('MONIY-SEEDB1','MONIY-SEEDC1');
```

## Log jawaban kuis dummy (2026-10-08)

435 baris `quiz_answer_log` dibuat untuk 87 hasil kuis siswa seed (`@seed.moniy.test`), konsisten dengan
skor tiap hasil, supaya kartu "Soal kuis yang paling sering keliru" terisi. Membersihkan:

```sql
delete from public.quiz_answer_log where user_id in (select id from public.users where email like '%@seed.moniy.test');
```

