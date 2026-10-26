'use client';

import { Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { errText, questApi, type QuestSummary } from '@/lib/moniy/quest-api';
import { EmptyState } from './page-primitives';
import { QuestChat } from './quest-chat';

type Notify = (message: string, duration?: number) => void;
type ClassOption = { value: string; label: string };

export function QuestPage({ notify, classOptions, onFocusChange }: { notify: Notify; classOptions: ClassOption[]; onFocusChange: (focus: boolean, onBack?: () => void) => void }) {
  const [topics, setTopics] = useState<{ id: number; title: string }[]>([]);
  const [list, setList] = useState<QuestSummary[] | null>(null);
  const [chatActive, setChatActive] = useState(false);
  const [error, setError] = useState('');
  // Draft atau simulasi yang dibuka dari daftar; null = mulai simulasi baru.
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [session, setSession] = useState(0);

  const loadList = useCallback(() => questApi.mine().then(setList).catch((e) => { setList([]); setError(errText(e)); }), []);
  useEffect(() => {
    void questApi.topics().then(setTopics);
    void loadList();
  }, [loadList]);
  // Saat obrolan berjalan, halaman fokus ke pembuatan: sidebar dan kontrol topbar disembunyikan.
  // Tombol Kembali di mode fokus: tutup obrolan dan kembali ke daftar (daftar dimuat ulang).
  const backToList = useCallback(() => { setResumeId(null); setSession((n) => n + 1); void loadList(); }, [loadList]);
  useEffect(() => {
    onFocusChange(chatActive, backToList);
    return () => onFocusChange(false);
  }, [chatActive, backToList, onFocusChange]);

  // Gagal membuka draft: tampilkan alasannya dan kembali ke daftar (bukan diam).
  const resumeFailed = useCallback((message: string) => { setError(message); setResumeId(null); }, []);

  const remove = async (q: QuestSummary) => {
    try { await questApi.remove(q.id); notify('Simulasi dihapus.'); await loadList(); } catch (e) { setError(errText(e)); }
  };

  return (
    <div className="page-stack">
      {chatActive ? null : <section className="page-intro">
        <div>
          <span className="page-kicker">Simulasi</span>
          <h1>Buat Simulasi Keuangan</h1>
          <p>Pilih topik dan tulis ide ceritanya. Moniy menyusun kerangka dan langsung menulis simulasinya lengkap dengan pilihan jawaban.</p>
        </div>
      </section>}

      <QuestChat key={`${resumeId ?? 'baru'}-${session}`} topics={topics} classOptions={classOptions} notify={notify} resumeId={resumeId} onActiveChange={setChatActive} onResumeFailed={resumeFailed} />

      {chatActive ? null : <section className="surface-card data-table-card">
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        <div className="section-heading-row"><div><h2>Simulasi saya</h2><p>Draft dan simulasi yang sudah dikirim ke kelas. Pilih salah satu untuk membuka dan mengeditnya.</p></div></div>
        {list === null ? <div className="quest-list-skeleton" aria-label="Memuat simulasi"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div> : list.length ? (
          <table className="data-table">
            <thead><tr><th>Judul</th><th>Topik</th><th>Status</th><th>Kelas</th><th aria-label="Aksi" /></tr></thead>
            <tbody>{list.map((q) => (
              <tr className="row-link" key={q.id}>
                <td><button className="link-button" type="button" onClick={() => setResumeId(q.id)}>{q.title}</button></td>
                <td>{q.topic ?? '-'}</td>
                <td><span className={`status-chip sim-status ${q.status === 'published' ? 'status-done' : ''}`}>{q.status === 'published' ? 'Terkirim' : 'Draft'}</span></td>
                <td>{q.classIds.length}</td>
                <td>{q.status === 'draft' ? <button className="icon-button" type="button" aria-label={`Hapus ${q.title}`} onClick={() => remove(q)}><Trash2 size={16} /></button> : null}</td>
              </tr>
            ))}</tbody>
          </table>
        ) : <EmptyState title="Belum ada simulasi" description="Simulasi yang kamu buat akan muncul di sini." />}
      </section>}
    </div>
  );
}
