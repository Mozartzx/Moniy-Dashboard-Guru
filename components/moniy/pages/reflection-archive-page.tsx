'use client';

import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { teacherDashboardRepository } from '@/lib/moniy/repository';
import type { ReflectionArchiveItem } from '@/lib/moniy/types';
import { EmptyState } from './page-primitives';
import { Exchange, LEVEL } from './student-detail';

const PAGE = 20;

export function ReflectionArchivePage({ classId }: { classId: string }) {
  const [items, setItems] = useState<ReflectionArchiveItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [chapter, setChapter] = useState('semua');
  const [kind, setKind] = useState<'semua' | 'refleksi' | 'kesimpulan'>('semua');
  const [order, setOrder] = useState<'baru' | 'lama'>('baru');
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    let active = true;
    teacherDashboardRepository.getReflectionArchive(classId).then(
      (data) => { if (active) { setItems(data); setFailed(false); } },
      () => { if (active) setFailed(true); },
    );
    return () => { active = false; };
  }, [classId]);

  const chapters = useMemo(() => Array.from(new Set((items ?? []).map((item) => item.chapter))), [items]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (items ?? []).filter((item) => {
      if (kind !== 'semua' && item.kind !== kind) return false;
      if (chapter !== 'semua' && item.chapter !== chapter) return false;
      if (!q) return true;
      const body = item.reflection
        ? `${item.reflection.why ?? ''} ${item.reflection.doDifferently ?? ''} ${item.reflection.mostImpactful ?? ''} ${item.reflection.aiFeedback ?? ''}`
        : `${item.conclusion?.text ?? ''} ${item.conclusion?.aiFeedback ?? ''}`;
      return `${item.studentName} ${item.moduleTitle} ${body}`.toLowerCase().includes(q);
    });
    return order === 'baru' ? list : [...list].reverse();
  }, [items, query, chapter, kind, order]);

  const resetShown = () => setShown(PAGE);
  const reflectionCount = (items ?? []).filter((item) => item.kind === 'refleksi').length;

  return (
    <div className="page-stack">
      <section className="page-intro"><div><span className="page-kicker">Arsip refleksi</span><h1>Refleksi dan kesimpulan siswa</h1><p>Semua tulisan siswa setelah menyelesaikan cerita, lengkap dengan tanggapan Moni. Saring per chapter atau jenis, lalu urutkan menurut waktu.</p></div></section>

      <article className="surface-card archive-card">
        <div className="archive-toolbar">
          <label className="search-input"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); resetShown(); }} placeholder="Cari nama siswa, cerita, atau isi tulisan" aria-label="Cari di arsip refleksi" /></label>
          <select value={chapter} onChange={(event) => { setChapter(event.target.value); resetShown(); }} aria-label="Filter chapter"><option value="semua">Semua chapter</option>{chapters.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={kind} onChange={(event) => { setKind(event.target.value as typeof kind); resetShown(); }} aria-label="Filter jenis"><option value="semua">Refleksi dan kesimpulan</option><option value="refleksi">Refleksi saja</option><option value="kesimpulan">Kesimpulan saja</option></select>
          <select value={order} onChange={(event) => setOrder(event.target.value as typeof order)} aria-label="Urutan waktu"><option value="baru">Terbaru dulu</option><option value="lama">Terlama dulu</option></select>
        </div>
        {items ? <p className="archive-count">{filtered.length} tulisan ditampilkan dari {items.length} ({reflectionCount} refleksi, {items.length - reflectionCount} kesimpulan)</p> : null}

        {failed ? <EmptyState title="Arsip belum bisa dimuat" description="Coba muat ulang halaman ini." /> : null}
        {items === null && !failed ? <p className="topic-empty">Memuat arsip...</p> : null}
        {items && !filtered.length ? <EmptyState title="Tidak ada tulisan" description={items.length ? 'Ubah kata kunci atau filter.' : 'Siswa di kelas ini belum menulis refleksi atau kesimpulan.'} /> : null}

        <div className="archive-list">
          {filtered.slice(0, shown).map((item) => (
            <article className="archive-item" key={item.id}>
              <header>
                <span className="student-avatar">{item.initials}</span>
                <div><strong>{item.studentName}</strong><small>{item.moduleTitle} | {item.chapter}</small></div>
                <span className={`status-chip ${item.kind === 'refleksi' ? 'status-progress' : 'status-done'}`}>{item.kind === 'refleksi' ? (item.reflection?.kind === 'refresh' ? 'Refleksi harian' : 'Refleksi cerita') : `Kesimpulan ke-${item.conclusion?.attempt ?? 1}`}</span>
                <time>{item.time}</time>
              </header>
              {item.reflection ? <>
                {item.reflection.mostImpactful ? <p className="student-block-note">Keputusan paling berpengaruh menurut siswa: <strong>{item.reflection.mostImpactful}</strong></p> : null}
                <Exchange title="Alasan siswa" student={item.reflection.why} ai={item.reflection.aiFeedback} />
                <Exchange title="Yang akan dilakukan berbeda" student={item.reflection.doDifferently} ai={null} />
                {item.reflection.aiInsight ? <p className="student-block-note">Rangkuman sebab-akibat: {item.reflection.aiInsight}</p> : null}
              </> : null}
              {item.conclusion ? <>
                {item.conclusion.level ? <p className="student-block-meta"><span className={`status-chip ${LEVEL[item.conclusion.level].chip}`}>{LEVEL[item.conclusion.level].label}</span></p> : null}
                <Exchange title="Kesimpulan siswa" student={item.conclusion.text} ai={item.conclusion.aiFeedback} />
                {item.conclusion.aiReinforcement ? <p className="student-block-note">Penguatan dari Moni: {item.conclusion.aiReinforcement}</p> : null}
              </> : null}
            </article>
          ))}
        </div>
        {filtered.length > shown ? <button className="secondary-button archive-more" type="button" onClick={() => setShown((n) => n + PAGE)}>Tampilkan {Math.min(PAGE, filtered.length - shown)} tulisan lagi</button> : null}
      </article>
    </div>
  );
}
