'use client';

import { Check, ChevronRight, Lightbulb, LockKeyhole, Search } from 'lucide-react';
import { useState } from 'react';
import type { ClassroomSnapshot, Student } from '@/lib/moniy/types';
import { EmptyState, statusClass } from './page-primitives';

export function StudentsPage({ snapshot }: { snapshot: ClassroomSnapshot }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedId, setSelectedId] = useState(snapshot.students[0]?.id ?? '');
  const filtered = snapshot.students.filter((student) => {
    const matchesQuery = `${student.name} ${student.activeModule}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || student.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const selected = snapshot.students.find((student) => student.id === selectedId) ?? filtered[0];

  return (
    <div className="page-stack">
      <section className="page-intro"><div><span className="page-kicker">Rekam belajar</span><h1>Riwayat keputusan siswa</h1><p>Buka riwayat keputusan belajar individual. Data Perisai Judi tidak pernah tampil di halaman ini.</p></div><span className="privacy-badge"><LockKeyhole size={16} /> Terpisah dari data perlindungan</span></section>
      <section className="student-layout">
        <article className="surface-card student-list-card">
          <div className="student-toolbar"><label className="search-input"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau modul" aria-label="Cari siswa" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter status siswa"><option>Semua</option><option>Belum</option><option>Berjalan</option><option>Selesai</option></select></div>
          {filtered.length ? <div className="student-list">{filtered.map((student) => <StudentRow student={student} selected={selected?.id === student.id} onSelect={() => setSelectedId(student.id)} key={student.id} />)}</div> : <EmptyState title="Siswa tidak ditemukan" description="Ubah kata kunci atau filter status." />}
        </article>
        <aside className="surface-card student-detail-card">{selected ? <StudentDetail student={selected} /> : <EmptyState title="Pilih siswa" description="Riwayat keputusan akan muncul di sini." />}</aside>
      </section>
    </div>
  );
}

function StudentRow({ student, selected, onSelect }: { student: Student; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`student-list-row ${selected ? 'is-selected' : ''}`} type="button" onClick={onSelect}>
      <span className="student-avatar">{student.initials}</span><span className="student-main"><strong>{student.name}</strong><small>{student.activeModule}</small></span><span className={statusClass(student.status)}>{student.status}</span><span className="student-score">{student.score ?? '-'}</span><ChevronRight size={17} />
    </button>
  );
}

function StudentDetail({ student }: { student: Student }) {
  const progress = Math.round(student.completedTopics / student.totalTopics * 100);
  return (
    <div className="student-detail">
      <div className="student-detail-head"><span className="student-avatar large">{student.initials}</span><div><h2>{student.name}</h2><p>{student.activeModule}</p></div></div>
      <div className="student-detail-stats"><div><span>Progres</span><strong>{student.completedTopics}/{student.totalTopics} topik</strong></div><div><span>Nilai kuis</span><strong>{student.score ?? 'Belum ada'}</strong></div></div>
      <div className="thin-progress student-progress" aria-label={`Progres ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
      <div className="detail-section-title"><h3>Keputusan terbaru</h3><span>Data belajar individual</span></div>
      {student.decisions.length ? <div className="decision-timeline">{student.decisions.map((decision) => <div className="decision-item" key={decision.id}><span className={decision.outcome === 'tepat' ? 'decision-dot good' : 'decision-dot reflect'}>{decision.outcome === 'tepat' ? <Check size={17} /> : <Lightbulb size={17} />}</span><div><strong>{decision.title}</strong><span>{decision.chapter} | {decision.time}</span><p>{decision.note}</p></div></div>)}</div> : <EmptyState title="Belum ada keputusan" description="Siswa belum memulai sesi storytelling." />}
      <div className="student-privacy-note"><span className="solid-icon green"><LockKeyhole size={16} /></span><p><strong>Batas privasi</strong>Halaman ini tidak memuat kejadian Perisai Anti Judi Online.</p></div>
    </div>
  );
}
