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
- [x] `quizzes.topic_id` + `quiz_answer_log` — selesai 2026-10-08 (migrasi 019); dashboard membacanya. Lihat `tasks/mobile-team-requests.md`.
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

# Cerita yang menempel di layar (scrollytelling)

- [x] `components/landing/story-scroll.tsx` menggantikan `StoryDemo`: rail langkah, ponsel, paragraf yang kata-katanya menyala mengikuti scroll (CSS scroll-driven animation, hanya opacity)
- [x] Cadangan: tanpa JS teks tersusun biasa; browser tanpa `animation-timeline` menyalakan kata bertahap saat langkah aktif; reduced motion tanpa scrub dan tanpa geser
- [x] Review (impeccable, emil, ux-heuristics, animation-vocabulary): stage sticky melewati ujung seksi (margin negatif), langkah 3 kehabisan jalan, langkah 1 sudah menyala sebelum menempel, gambar lazy berkedip, detektor menandai border-left
- Catatan uji: tab Chrome yang tidak fokus tidak memajukan transisi sampai ada frame baru, jadi screenshot pertama setelah lompatan scroll kadang menampilkan layar ponsel kosong. Bukan bug halaman.

# Landing: seksi setelah skenario dibangun ulang (acuan Teyro dan Family)

- [x] Analisis teyro.app (Baloo 2 800 + Plus Jakarta Sans, pita putih dan biru muda bergantian, judul dengan frasa biru, baris fitur dengan kartu ponsel mengambang dan daftar centang, kartu biru besar dengan tepi bawah tebal, FAQ akordeon, reveal naik dan memudar, tombol 3D 150ms) dan family.co (kartu bento abu hangat dengan widget mini hidup, judul 500 dengan tracking rapat, baris fitur dengan aksen warna per seksi, "Details that matter" dengan judul menempel dan kartu bertumpuk, marquee testimoni, FAQ sederhana)
- [x] Hapus seksi lama di bawah skenario (tanpa membaca isinya); simpan hero, skenario, header, tombol
- [x] Seksi baru: Apa itu Moniy, Cara kerja (tab otomatis + ponsel), Fitur (bento 5 kartu dengan widget mini), Untuk guru (kartu biru), FAQ (akordeon), CTA (dua Moniy), Footer
- [x] Header: tautan navigasi ke bagian halaman
- Catatan: tidak ada testimoni (tidak ada data nyata); klaim hanya yang ada di aplikasi dan skema; tautan unduh masih placeholder `#unduh`
