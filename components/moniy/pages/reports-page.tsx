'use client';

import Image from 'next/image';
import { CheckCircle2, Download, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { ClassroomSnapshot } from '@/lib/moniy/types';

export function ReportsPage({ snapshot, className, periodLabel }: { snapshot: ClassroomSnapshot; className: string; periodLabel: string }) {
  const [includeLearning, setIncludeLearning] = useState(true);
  const [includeDecisions, setIncludeDecisions] = useState(true);
  const [includeRisk, setIncludeRisk] = useState(true);
  const [includeCommunity, setIncludeCommunity] = useState(false);
  const [exported, setExported] = useState(false);

  const reportItems = [
    { checked: includeLearning, setChecked: setIncludeLearning, title: 'Progres belajar', text: 'Status topik, nilai kuis, dan pola benar-salah.' },
    { checked: includeDecisions, setChecked: setIncludeDecisions, title: 'Rekam keputusan siswa', text: 'Riwayat belajar individual untuk tindak lanjut pedagogis.' },
    { checked: includeRisk, setChecked: setIncludeRisk, title: 'Kerentanan judi tingkat kelas', text: 'Hanya angka agregat anonim dan rekomendasi pembinaan.' },
    { checked: includeCommunity, setChecked: setIncludeCommunity, title: 'Komunitas kelas', text: 'Hasil Simulasi Bisnis dan status tinjauan.' },
  ];

  const exportMockReport = () => {
    const sections = [`<h1>Laporan Kelas MONIY</h1><p>Kelas: ${className}</p><p>Periode: ${periodLabel}</p><p>Dokumen contoh frontend</p>`];
    if (includeLearning) sections.push(`<h2>Progres Belajar</h2><table border="1"><tr><th>Topik</th><th>Nilai Kuis</th><th>Keputusan Benar</th></tr>${snapshot.topics.map((topic) => `<tr><td>${topic.name}</td><td>${topic.quizAverage}</td><td>${topic.correctRate}%</td></tr>`).join('')}</table>`);
    if (includeDecisions) sections.push(`<h2>Rekam Belajar Siswa</h2><table border="1"><tr><th>Siswa</th><th>Modul Aktif</th><th>Status</th><th>Nilai</th></tr>${snapshot.students.map((student) => `<tr><td>${student.name}</td><td>${student.activeModule}</td><td>${student.status}</td><td>${student.score ?? '-'}</td></tr>`).join('')}</table>`);
    if (includeRisk) sections.push(`<h2>Kerentanan Judi Online</h2><p>Tingkat kelas: ${snapshot.riskLevel}</p><p>Jumlah kejadian anonim: ${snapshot.riskEventCount}</p><p>Data ini agregat dan tidak memuat identitas siswa.</p>`);
    if (includeCommunity) sections.push(`<h2>Komunitas Kelas</h2><table border="1"><tr><th>Judul</th><th>Siswa</th><th>Status Tinjauan</th></tr>${snapshot.communityPosts.map((post) => `<tr><td>${post.title}</td><td>${post.studentName}</td><td>${post.reviewed ? 'Sudah' : 'Belum'}</td></tr>`).join('')}</table>`);
    const blob = new Blob([`<html><head><meta charset="utf-8"></head><body>${sections.join('')}</body></html>`], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MONIY_${className.replaceAll(' ', '_')}_contoh.xls`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  return (
    <div className="page-stack">
      <section className="page-intro"><div><span className="page-kicker">Dokumentasi kelas</span><h1>Laporan kelas</h1><p>Pilih data yang perlu didokumentasikan, tinjau isinya, lalu ekspor file contoh.</p></div><span className="privacy-badge"><ShieldCheck size={16} /> Kerentanan tetap agregat</span></section>
      <section className="report-layout">
        <article className="surface-card report-builder">
          <div className="section-heading-row"><div><h2>Isi laporan</h2><p>Pilihan mengikuti kelas dan periode pada header.</p></div><span className="mock-data-label">Ekspor mock</span></div>
          <div className="report-context"><div><span>Kelas</span><strong>{className}</strong></div><div><span>Periode</span><strong>{periodLabel}</strong></div></div>
          <div className="report-checkboxes">{reportItems.map((item) => <label key={item.title} aria-label={item.title}><input type="checkbox" checked={item.checked} onChange={(event) => item.setChecked(event.target.checked)} /><span><strong>{item.title}</strong><small>{item.text}</small></span></label>)}</div>
          <div className="report-privacy"><LockKeyhole size={18} /><p>Bagian kerentanan judi tidak pernah menyertakan nama atau identitas siswa.</p></div>
          <button className="primary-button export-button" type="button" onClick={exportMockReport} disabled={!reportItems.some((item) => item.checked)}><Download size={18} /> Unduh Excel contoh</button>
          {exported ? <output className="export-success"><CheckCircle2 size={17} /> File contoh berhasil dibuat di perangkat Anda.</output> : null}
        </article>

        <aside className="report-preview"><div className="report-paper">
          <div className="report-paper-head"><Image src="/assets/moniy-logo.png" alt="Moniy" width={128} height={37} /><span>PRATINJAU</span></div>
          <h2>Laporan Kelas</h2><p>{className} | {periodLabel}</p>
          <div className="preview-metrics"><div><strong>{snapshot.averageScore.toFixed(1)}</strong><span>Nilai rata-rata</span></div><div><strong>{snapshot.completionRate}%</strong><span>Modul selesai</span></div></div>
          {includeLearning ? <div className="preview-section"><h3>Progres belajar</h3>{snapshot.topics.slice(0, 3).map((topic) => <div key={topic.id}><span>{topic.name}</span><strong>{topic.correctRate}%</strong></div>)}</div> : null}
          {includeRisk ? <div className="preview-risk"><ShieldCheck size={18} /><p><strong>Kerentanan kelas: {snapshot.riskLevel}</strong>{snapshot.riskEventCount} kejadian anonim pada periode ini.</p></div> : null}
          <small>Pratinjau data contoh. Format final dapat disesuaikan saat backend terhubung.</small>
        </div></aside>
      </section>
    </div>
  );
}
