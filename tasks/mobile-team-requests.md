# Permintaan skema ke tim mobile (Gilang)

## `quizzes.topic_id`

Dashboard guru butuh kolom `topic_id` (FK → `module_topics.id`) di tabel `quizzes` untuk
menghitung "tingkat pemahaman per indikator materi" dari hasil kuis (fitur Progress Belajar
Kelas, lihat `Web_Dashboard/Spec_Dashboard_Guru_MONIY.md`).

Sengaja **belum ditambahkan dari sisi dashboard** — kuis dibuat dan dipakai dari app mobile,
jadi biar Gilang yang implementasi kolom ini dari sisi situ dulu, baru dashboard nge-fetch
setelah kolomnya ada.

Sampai kolom ini ada, breakdown "Progress Belajar Kelas" per topik di dashboard pakai proxy dari
`user_module_progress.score` (lewat `modules.topic_id`), bukan dari hasil kuis langsung — lihat
komentar `ponytail:` di `lib/moniy/repository.ts`.
