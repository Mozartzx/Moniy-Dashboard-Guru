# Landing page Moniy (gaya Duolingo) di `/`

Design read: landing app edukasi untuk siswa SMA (+ band guru), bahasa playful ala Duolingo, native CSS +
IntersectionObserver, aset nyata dari Figma (`Mobile App UI`). Dial: VARIANCE 6 / MOTION 6 / DENSITY 3.
Keputusan user: CTA "UNDUH APLIKASI" + "MASUK SEBAGAI GURU"; rute `/`; nada ramah untuk siswa SMA.

- [x] Ambil layar aplikasi dari Figma (export 2x) -> `public/landing/screens/*.webp`
- [x] Maskot 3D kiriman user, latar dihapus -> `public/landing/mascot/mascot-wave.{png,webp}`
- [x] `app/page.tsx` + `app/landing.css` + `components/landing/*` (header sticky, hero, 4 fitur, band Perisai, panel guru, footer)
- [x] Motion: hero masuk, mascot float, reveal scroll, demo cerita (3 layar), toggle Perisai, tombol 3D; reduced-motion
- [x] Screenshot desktop + ponsel (Playwright), review skill (taste, impeccable, ux, animate, emil, hooked), perbaiki (3 ronde)
- [x] Prompt aset untuk GPT Plus (ilustrasi) dan Gemini (animasi) -> `tasks/landing-asset-prompts.md`
- [x] lint, tsc, build hijau
- [ ] Pasang aset baru dari GPT/Gemini ke slot (hero, band Perisai, panel guru) setelah user mengirim ke `public/landing/incoming/`

## Catatan
- Link unduh aplikasi belum ada: `APP_DOWNLOAD_URL` di `components/landing/landing-sections.tsx`, isi saat rilis.
- Dashboard tidak punya screenshot untuk band guru; pakai ilustrasi `moniy-risk-safe.png` dulu.
- Layar Figma `Beranda`/`Ending` menampilkan nama contoh "Mozart"; ganti kalau tidak ingin ada nama di landing publik.
- `/` sekarang landing (dulu redirect ke /login). Login tetap di `/login`.

---

# Sambungkan Dashboard Guru ke Supabase live + Auth Google + Register

Rencana lengkap: `C:\Users\ASUS Vivobook\.claude\plans\gleaming-cuddling-waffle.md`

## Selesai
- [x] Migration: `users.school_name`, `community_posts.reviewed`, RLS teacher-scope untuk
      `classes`, `gambling_exposure_events`, `users`, `quiz_results`, `user_module_progress`,
      update policy `community_posts` (dijalankan live via Supabase MCP `apply_migration`).
- [x] `@supabase/supabase-js` + `@supabase/ssr`, `lib/supabase/client.ts` & `server.ts`.
- [x] Login: email/password + Google OAuth (`components/moniy/login-screen.tsx`).
- [x] Register: form manual (nama, sekolah, email, sandi) + Google, `app/register`.
- [x] `app/auth/callback/route.ts`: bikin row `public.users` kalau belum ada, arahkan ke tahap
      onboarding yang tepat.
- [x] `proxy.ts` (middleware, vinext pakai konvensi baru): proteksi `/dashboard`, `/onboarding`.
- [x] Onboarding: `/onboarding/sekolah` (isi nama sekolah), `/onboarding/kelas` (empty state +
      buat kelas, generate kode kelas `MONIY-XXXXXX`).
- [x] `lib/moniy/repository.ts`: implementasi live menggantikan mock (`SupabaseTeacherDashboardRepository`).
- [x] `dashboard-context.tsx` & `dashboard-shell.tsx`: kelas & profil guru dari data live, sign
      out asli.
- [x] Hapus `lib/moniy/mock-data.ts` dan `components/moniy/moniy-app.tsx` (sudah tidak dipakai).
- [x] `tasks/mobile-team-requests.md`: catatan `quizzes.topic_id` untuk Gilang.
- [x] Role-conflict guard: akun dengan `role != 'teacher'` (mis. row siswa dari mobile app) ditolak
      masuk dashboard, bukan diam-diam dipakai sebagai profil guru. Titik cek tunggal di
      `lib/moniy/teacher.ts` (`resolveTeacherStage`), dipanggil dari `app/auth/callback/route.ts`
      dan `proxy.ts`. Pesan error tampil di `login-screen.tsx` lewat `?error=role-conflict`.
- [x] Verifikasi: lint bersih, `tsc --noEmit` bersih, `npm run build` sukses, smoke test manual
      register (auth user & pesan konfirmasi email terkonfirmasi lewat Supabase live), proxy
      redirect `/dashboard/*` -> `/login` tanpa sesi terkonfirmasi.

## Belum / di luar scope kali ini
- [ ] `quizzes.topic_id` — ditunda, tanggung jawab Gilang (mobile). Lihat `tasks/mobile-team-requests.md`.
- [ ] `commonMistake`/`mistakeRate` per topik butuh tabel log jawaban per soal kuis yang belum
      ada — saat ini dirender "Belum tersedia" (`lib/moniy/repository.ts`, komentar `ponytail:`).
- [ ] Label "Data contoh" / "mock-data-label" masih tertinggal di beberapa halaman
      (`progress-page.tsx`, `reports-page.tsx`) — kosmetik, sekarang datanya sudah live jadi
      labelnya perlu diganti/dihapus.
- [ ] Env `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` perlu ditambahkan ke
      GitHub Actions secrets + env VPS (`moniy-dashboard` systemd) sebelum deploy ke produksi —
      belum dilakukan, di luar akses saya (Git policy: user yang commit/push & deploy).
- [ ] Uji Google Sign-In end-to-end (butuh akun Google asli, tidak bisa diotomasi penuh di sesi
      ini) dan uji alur onboarding-kelas dengan sesi guru yang benar-benar login.
