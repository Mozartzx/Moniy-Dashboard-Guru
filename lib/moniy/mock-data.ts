import type { ClassroomSnapshot, LearningDecision, Student } from './types';

const decisionSets: Record<string, LearningDecision[]> = {
  alya: [
    { id: 'd1', title: 'Menolak pinjaman instan', chapter: 'Babak Krisis', note: 'Memeriksa biaya dan legalitas sebelum mengambil keputusan.', outcome: 'tepat', time: 'Hari ini, 09.42' },
    { id: 'd2', title: 'Menyisihkan modal darurat', chapter: 'Babak Tumbuh', note: 'Menjaga arus kas usaha tetap aman.', outcome: 'tepat', time: 'Kemarin, 14.15' },
    { id: 'd3', title: 'Menetapkan harga jual', chapter: 'Babak Merintis', note: 'Margin belum memasukkan biaya kemasan.', outcome: 'perlu-refleksi', time: 'Kemarin, 10.08' },
  ],
  bima: [
    { id: 'd4', title: 'Mengecek izin lembaga keuangan', chapter: 'Produk Keuangan', note: 'Membandingkan informasi resmi sebelum memilih layanan.', outcome: 'tepat', time: 'Hari ini, 08.55' },
    { id: 'd5', title: 'Memilih tabungan sesuai tujuan', chapter: 'Rencana Keuangan', note: 'Memisahkan kebutuhan harian dan dana tujuan.', outcome: 'tepat', time: 'Senin, 13.20' },
  ],
  citra: [
    { id: 'd6', title: 'Membuat anggaran promosi', chapter: 'Babak Tumbuh', note: 'Anggaran melebihi kemampuan kas pada periode berjalan.', outcome: 'perlu-refleksi', time: 'Hari ini, 10.17' },
    { id: 'd7', title: 'Menghitung laba bersih', chapter: 'Mesin Waktu Saku', note: 'Sudah memperhitungkan biaya operasional.', outcome: 'tepat', time: 'Kemarin, 16.04' },
  ],
};

const baseStudents: Student[] = [
  { id: 's1', name: 'Alya Nabila', initials: 'AN', activeModule: 'Risiko Keuangan', status: 'Berjalan', score: 68, completedTopics: 4, totalTopics: 6, needsSupport: true, decisions: decisionSets.alya },
  { id: 's2', name: 'Bima Ramadhan', initials: 'BR', activeModule: 'Simulasi Bisnis', status: 'Selesai', score: 86, completedTopics: 6, totalTopics: 6, needsSupport: false, decisions: decisionSets.bima },
  { id: 's3', name: 'Citra Aulia', initials: 'CA', activeModule: 'Perencanaan Keuangan', status: 'Berjalan', score: 74, completedTopics: 3, totalTopics: 6, needsSupport: true, decisions: decisionSets.citra },
  { id: 's4', name: 'Daffa Pratama', initials: 'DP', activeModule: 'Produk Keuangan', status: 'Belum', score: null, completedTopics: 1, totalTopics: 6, needsSupport: false, decisions: [] },
  { id: 's5', name: 'Farah Zahra', initials: 'FZ', activeModule: 'Simulasi Bisnis', status: 'Selesai', score: 91, completedTopics: 6, totalTopics: 6, needsSupport: false, decisions: decisionSets.bima },
  { id: 's6', name: 'Gilang Saputra', initials: 'GS', activeModule: 'Risiko Keuangan', status: 'Berjalan', score: 63, completedTopics: 3, totalTopics: 6, needsSupport: true, decisions: decisionSets.alya },
];

export const mockSnapshots: Record<string, ClassroomSnapshot> = {
  'x-a': {
    classId: 'x-a', className: 'Kelas X-A', studentCount: 32, averageScore: 78.4, completionRate: 71, supportCount: 7,
    riskLevel: 'Sedang', riskDelta: 18, riskEventCount: 14,
    insight: 'Siswa cukup kuat mengenali lembaga keuangan resmi, tetapi masih sering tergoda pilihan dengan hasil cepat saat skenario memasuki tekanan kas.',
    recommendation: 'Gunakan 15 menit awal pertemuan berikutnya untuk membandingkan ciri produk legal, ilegal, dan tawaran untung tidak wajar.',
    topics: [
      { id: 't1', name: 'Peran OJK dan produk keuangan', category: 'Lembaga Keuangan', notStarted: 2, inProgress: 5, completed: 25, quizAverage: 84, correctRate: 81, commonMistake: 'Menganggap semua aplikasi keuangan diawasi OJK', mistakeRate: 24 },
      { id: 't2', name: 'Perencanaan dan pengelolaan uang', category: 'Keuangan Pribadi', notStarted: 3, inProgress: 8, completed: 21, quizAverage: 77, correctRate: 73, commonMistake: 'Tidak memasukkan pengeluaran tidak rutin', mistakeRate: 32 },
      { id: 't3', name: 'Investasi dan instrumen keuangan', category: 'Investasi', notStarted: 5, inProgress: 10, completed: 17, quizAverage: 71, correctRate: 66, commonMistake: 'Memilih imbal hasil tanpa menilai risiko', mistakeRate: 39 },
      { id: 't4', name: 'Risiko pinjaman ilegal dan judi', category: 'Risiko Keuangan', notStarted: 4, inProgress: 12, completed: 16, quizAverage: 65, correctRate: 58, commonMistake: 'Menerima tawaran untung cepat saat kas menipis', mistakeRate: 43 },
    ],
    students: baseStudents,
    riskTrend: [
      { label: 'Sen', events: 1 }, { label: 'Sel', events: 2 }, { label: 'Rab', events: 1 },
      { label: 'Kam', events: 3 }, { label: 'Jum', events: 4 }, { label: 'Sab', events: 2 }, { label: 'Min', events: 1 },
    ],
    communityPosts: [
      { id: 'p1', studentName: 'Alya Nabila', initials: 'AN', title: 'Kedai Minuman Sehat', businessType: 'Makanan dan minuman', epilogue: 'Usaha bertahan sehat', summary: 'Alya menjaga arus kas dengan menu terbatas dan dana darurat, tetapi margin awal masih terlalu tipis.', submittedAt: '12 menit lalu', reviewed: false },
      { id: 'p2', studentName: 'Citra Aulia', initials: 'CA', title: 'Jasa Foto Acara Sekolah', businessType: 'Jasa kreatif', epilogue: 'Bertahan dengan catatan', summary: 'Usaha bertumbuh setelah Citra memperbaiki paket harga. Biaya promosi masih perlu dievaluasi.', submittedAt: '1 jam lalu', reviewed: false },
      { id: 'p3', studentName: 'Bima Ramadhan', initials: 'BR', title: 'Desain Poster Sekolah', businessType: 'Jasa desain', epilogue: 'Usaha bertahan sehat', summary: 'Bima memilih pertumbuhan bertahap dan menolak pinjaman saat pesanan meningkat.', submittedAt: 'Kemarin', reviewed: true },
    ],
  },
  'x-b': {} as ClassroomSnapshot,
  'x-c': {} as ClassroomSnapshot,
};

mockSnapshots['x-b'] = {
  ...mockSnapshots['x-a'], classId: 'x-b', className: 'Kelas X-B', studentCount: 30, averageScore: 81.2, completionRate: 76, supportCount: 5,
  riskLevel: 'Rendah', riskDelta: -9, riskEventCount: 7,
  insight: 'Mayoritas siswa konsisten menyusun prioritas kebutuhan. Kesalahan terbanyak muncul saat membandingkan risiko dan imbal hasil investasi.',
};

mockSnapshots['x-c'] = {
  ...mockSnapshots['x-a'], classId: 'x-c', className: 'Kelas X-C', studentCount: 31, averageScore: 74.6, completionRate: 63, supportCount: 10,
  riskLevel: 'Sedang', riskDelta: 7, riskEventCount: 11,
  insight: 'Pemahaman dasar sudah terbentuk, tetapi beberapa siswa belum menuntaskan refleksi pada modul perencanaan keuangan.',
};

export const classOptions = [
  { value: 'x-a', label: 'Kelas X-A' },
  { value: 'x-b', label: 'Kelas X-B' },
  { value: 'x-c', label: 'Kelas X-C' },
];

export const periodOptions = [
  { value: '7-hari', label: '7 hari terakhir' },
  { value: '30-hari', label: '30 hari terakhir' },
  { value: 'semester', label: 'Semester ganjil' },
];
