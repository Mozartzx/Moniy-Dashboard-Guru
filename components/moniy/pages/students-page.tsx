'use client';

import { ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import type { ClassroomSnapshot, Student } from '@/lib/moniy/types';
import { EmptyState, statusClass } from './page-primitives';
import { StudentDetail } from './student-detail';

export function StudentsPage({ snapshot }: { snapshot: ClassroomSnapshot }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [detailId, setDetailId] = useState<string | null>(null);
  if (detailId) return <StudentDetail classId={snapshot.classId} studentId={detailId} onBack={() => setDetailId(null)} />;
  const filtered = snapshot.students.filter((student) => {
    const matchesQuery = `${student.name} ${student.activeModule}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || student.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="page-stack">
      <section className="page-intro"><div><span className="page-kicker">Rekam belajar</span><h1>Riwayat keputusan siswa</h1><p>Pilih satu siswa untuk melihat cerita yang dikerjakan, pilihan jawaban, refleksi, dan kesimpulannya.</p></div></section>
      <article className="surface-card student-list-card">
        <div className="student-toolbar"><label className="search-input"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau modul" aria-label="Cari siswa" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter status siswa"><option>Semua</option><option>Belum</option><option>Berjalan</option><option>Selesai</option></select></div>
        {filtered.length ? <div className="student-list student-list-full">{filtered.map((student) => <StudentRow student={student} onSelect={() => setDetailId(student.id)} key={student.id} />)}</div> : (snapshot.students.length ? <EmptyState title="Siswa tidak ditemukan" description="Ubah kata kunci atau filter status." /> : <EmptyState title="Belum ada siswa" description="Bagikan kode kelas lewat Kelola kelas agar siswa bisa bergabung." />)}
      </article>
    </div>
  );
}

function StudentRow({ student, onSelect }: { student: Student; onSelect: () => void }) {
  return (
    <button className="student-list-row" type="button" onClick={onSelect} aria-label={`Buka detail ${student.name}`}>
      <span className="student-avatar">{student.initials}</span><span className="student-main"><strong>{student.name}</strong><small>{student.activeModule}</small></span><span className={statusClass(student.status)}>{student.status}</span><span className="student-score" title="Nilai siswa: rata-rata nilai cerita yang dikerjakan"><small>Nilai</small>{student.score ?? '-'}</span><ChevronRight size={17} />
    </button>
  );
}
