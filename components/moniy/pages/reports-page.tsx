'use client';

import Image from 'next/image';
import { CheckCircle2, Download, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { teacherDashboardRepository } from '@/lib/moniy/repository';
import { fetchLearningInsight } from '@/lib/moniy/quest-api';
import type { ClassroomSnapshot } from '@/lib/moniy/types';

const esc = (value: string | number | null | undefined) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const LEVEL_LABEL: Record<string, string> = { tepat: 'Tepat', hampir: 'Hampir tepat', perlu_penguatan: 'Perlu penguatan' };

export function ReportsPage({ snapshot, className, periodLabel }: { snapshot: ClassroomSnapshot; className: string; periodLabel: string }) {
  const [includeLearning, setIncludeLearning] = useState(true);
  const [includeDecisions, setIncludeDecisions] = useState(true);
  const [includeHard, setIncludeHard] = useState(true);
  const [includeReflections, setIncludeReflections] = useState(true);
  const [includeInsight, setIncludeInsight] = useState(true);
  const [includeRisk, setIncludeRisk] = useState(true);
  const [includeCommunity, setIncludeCommunity] = useState(false);
  const [exported, setExported] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [problem, setProblem] = useState('');

  const reportItems = [
    { checked: includeLearning, setChecked: setIncludeLearning, title: 'Progres belajar', text: 'Status topik, nilai siswa, dan pola benar-salah.' },
    { checked: includeDecisions, setChecked: setIncludeDecisions, title: 'Rekam keputusan siswa', text: 'Riwayat belajar individual untuk tindak lanjut pedagogis.' },
    { checked: includeHard, setChecked: setIncludeHard, title: 'Keputusan paling sulit', text: 'Peringkat keputusan yang paling sering keliru di kelas.' },
    { checked: includeReflections, setChecked: setIncludeReflections, title: 'Refleksi dan kesimpulan siswa', text: 'Arsip tulisan siswa beserta tanggapan Moni.' },
    { checked: includeInsight, setChecked: setIncludeInsight, title: 'Insight pembelajaran', text: 'Rangkuman Gemini dan tindak lanjut untuk kelas.' },
    { checked: includeRisk, setChecked: setIncludeRisk, title: 'Kerentanan judi tingkat kelas', text: 'Hanya angka agregat anonim dan rekomendasi pembinaan.' },
    { checked: includeCommunity, setChecked: setIncludeCommunity, title: 'Komunitas kelas', text: 'Hasil Simulasi Keuangan, status tinjauan, dan catatan guru.' },
  ];

  const exportReport = async () => {
    setExporting(true);
    setExported(false);
    setProblem('');
    try {
      const sections = [`<h1>Laporan Kelas MONIY</h1><p>Kelas: ${esc(className)}</p><p>Periode: ${esc(periodLabel)}</p>`];
      if (includeLearning) sections.push(`<h2>Progres Belajar</h2><table border="1"><tr><th>Topik</th><th>Belum</th><th>Berjalan</th><th>Selesai</th><th>Nilai Siswa</th><th>Jawaban Benar</th></tr>${snapshot.topics.map((topic) => `<tr><td>${esc(topic.name)}</td><td>${topic.notStarted}</td><td>${topic.inProgress}</td><td>${topic.completed}</td><td>${topic.quizAverage}</td><td>${topic.correctRate}%</td></tr>`).join('')}</table>`);
      if (includeDecisions) sections.push(`<h2>Rekam Belajar Siswa</h2><table border="1"><tr><th>Siswa</th><th>Modul Aktif</th><th>Status</th><th>Nilai</th><th>Topik Selesai</th></tr>${snapshot.students.map((student) => `<tr><td>${esc(student.name)}</td><td>${esc(student.activeModule)}</td><td>${student.status}</td><td>${student.score ?? '-'}</td><td>${student.completedTopics}/${student.totalTopics}</td></tr>`).join('')}</table>`);
      if (includeHard) {
        const rank = await teacherDashboardRepository.getDecisionRank(snapshot.classId);
        sections.push(`<h2>Keputusan Paling Sulit</h2>${rank.length ? `<table border="1"><tr><th>No</th><th>Keputusan</th><th>Chapter</th><th>Jawaban</th><th>Pilihan Cerdas</th></tr>${rank.map((item, i) => `<tr><td>${i + 1}</td><td>${esc(item.question)}</td><td>${esc(item.chapter)}</td><td>${item.total}</td><td>${item.correctRate}%</td></tr>`).join('')}</table>` : '<p>Belum cukup data.</p>'}`);
      }
      if (includeReflections) {
        const archive = await teacherDashboardRepository.getReflectionArchive(snapshot.classId);
        const rows = archive.map((item) => item.reflection
          ? `<tr><td>${esc(item.time)}</td><td>${esc(item.studentName)}</td><td>${esc(item.chapter)}</td><td>Refleksi</td><td>${esc(item.reflection.why)} ${esc(item.reflection.doDifferently)}</td><td>${esc(item.reflection.aiFeedback)}</td></tr>`
          : `<tr><td>${esc(item.time)}</td><td>${esc(item.studentName)}</td><td>${esc(item.chapter)}</td><td>Kesimpulan ke-${item.conclusion?.attempt ?? 1} (${esc(LEVEL_LABEL[item.conclusion?.level ?? ''] ?? '-')})</td><td>${esc(item.conclusion?.text)}</td><td>${esc(item.conclusion?.aiFeedback)}</td></tr>`);
        sections.push(`<h2>Refleksi dan Kesimpulan Siswa</h2>${rows.length ? `<table border="1"><tr><th>Waktu</th><th>Siswa</th><th>Chapter</th><th>Jenis</th><th>Tulisan Siswa</th><th>Tanggapan Moni</th></tr>${rows.join('')}</table>` : '<p>Belum ada tulisan siswa.</p>'}`);
      }
      if (includeInsight) {
        try {
          const insight = await fetchLearningInsight(snapshot.classId);
          sections.push(`<h2>Insight Pembelajaran</h2>${insight.available ? `<p>${esc(insight.summary)}</p><h3>Temuan</h3><ul>${(insight.findings ?? []).map((f) => `<li><b>${esc(f.title)}</b>: ${esc(f.detail)}</li>`).join('')}</ul><h3>Tindak Lanjut</h3><ol>${(insight.actions ?? []).map((a) => `<li><b>${esc(a.title)}</b>: ${esc(a.detail)}</li>`).join('')}</ol>` : `<p>${esc(insight.message ?? 'Insight belum tersedia.')}</p>`}`);
        } catch {
          sections.push('<h2>Insight Pembelajaran</h2><p>Insight belum bisa dimuat saat laporan dibuat.</p>');
        }
      }
      if (includeRisk) sections.push(`<h2>Kerentanan Judi Online</h2><p>Jumlah kejadian anonim: ${snapshot.riskEventCount}</p><p>Data ini agregat dan tidak memuat identitas siswa.</p>`);
      if (includeCommunity) sections.push(`<h2>Komunitas Kelas</h2><table border="1"><tr><th>Judul</th><th>Siswa</th><th>Status Tinjauan</th><th>Catatan Guru</th></tr>${snapshot.communityPosts.map((post) => `<tr><td>${esc(post.title)}</td><td>${esc(post.studentName)}</td><td>${post.reviewed ? 'Sudah ditinjau' : 'Belum ditinjau'}</td><td>${esc(post.teacherNote)}</td></tr>`).join('')}</table>`);
      const blob = new Blob([`<html><head><meta charset="utf-8"></head><body>${sections.join('')}</body></html>`], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MONIY_${className.replaceAll(' ', '_')}.xls`;
      link.click();
      URL.revokeObjectURL(url);
      setExported(true);
    } catch {
      setProblem('Laporan belum bisa dibuat. Coba lagi.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="page-intro"><div><span className="page-kicker">Dokumentasi kelas</span><h1>Laporan kelas</h1><p>Pilih data yang perlu didokumentasikan, tinjau isinya, lalu ekspor filenya.</p></div></section>
      <section className="report-layout">
        <article className="surface-card report-builder">
          <div className="section-heading-row"><div><h2>Isi laporan</h2><p>Pilihan mengikuti kelas dan periode pada header.</p></div></div>
          <div className="report-context"><div><span>Kelas</span><strong>{className}</strong></div><div><span>Periode</span><strong>{periodLabel}</strong></div></div>
          <div className="report-checkboxes">{reportItems.map((item) => <label key={item.title} aria-label={item.title}><input type="checkbox" checked={item.checked} onChange={(event) => item.setChecked(event.target.checked)} /><span><strong>{item.title}</strong><small>{item.text}</small></span></label>)}</div>
          <button className="primary-button export-button" type="button" onClick={() => void exportReport()} disabled={exporting || !reportItems.some((item) => item.checked)}>{exporting ? <><Loader2 size={18} className="module-spin" /> Menyusun laporan...</> : <><Download size={18} /> Unduh Excel</>}</button>
          {exported ? <output className="export-success"><CheckCircle2 size={17} /> File berhasil dibuat di perangkat Anda.</output> : null}
          {problem ? <p className="field-error" role="alert">{problem}</p> : null}
        </article>

        <aside className="report-preview"><div className="report-paper">
          <div className="report-paper-head"><Image src="/assets/moniy-logo.png" alt="Moniy" width={128} height={37} /><span>PRATINJAU</span></div>
          <h2>Laporan Kelas</h2><p>{className} | {periodLabel}</p>
          <div className="preview-metrics"><div><strong>{snapshot.averageScore.toFixed(1)}</strong><span>Nilai rata-rata</span></div><div><strong>{snapshot.completionRate}%</strong><span>Modul selesai</span></div></div>
          {includeLearning ? <div className="preview-section"><h3>Progres belajar</h3>{snapshot.topics.slice(0, 3).map((topic) => <div key={topic.id}><span>{topic.name}</span><strong>{topic.correctRate}%</strong></div>)}</div> : null}
          {includeReflections || includeInsight || includeHard ? <div className="preview-section"><h3>Bagian tambahan</h3>{includeHard ? <div><span>Keputusan paling sulit</span><strong>Ya</strong></div> : null}{includeReflections ? <div><span>Refleksi dan kesimpulan</span><strong>Ya</strong></div> : null}{includeInsight ? <div><span>Insight pembelajaran</span><strong>Ya</strong></div> : null}</div> : null}
          {includeRisk ? <div className="preview-risk"><ShieldCheck size={18} /><p><strong>Kerentanan kelas: {snapshot.riskEventCount}</strong>kejadian anonim pada periode ini.</p></div> : null}
          <small>Pratinjau laporan sebelum diunduh.</small>
        </div></aside>
      </section>
    </div>
  );
}
