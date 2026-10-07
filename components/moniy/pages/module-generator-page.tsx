'use client';

import { Loader2, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EmptyState } from './page-primitives';

type Topic = { id: number; title: string };
type CreatedModule = { id: number; title: string; topic: string; createdAt: string };
type GenerateResult = { moduleId: number; title: string; role: string; goal: number; cash: number; conditions: number; events: number; topic: string };

const rupiah = (value: number) => `Rp${value.toLocaleString('id-ID')}`;

async function fetchCreated(): Promise<CreatedModule[]> {
  const { data } = await createClient()
    .from('modules')
    .select('id, title, created_at, module_topics(title)')
    .eq('genre', 'AI Generated')
    .order('created_at', { ascending: false })
    .limit(8);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    topic: (row.module_topics as unknown as { title: string } | null)?.title ?? '-',
    createdAt: new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
  }));
}

export function ModuleGeneratorPage({ notify }: { notify: (message: string, duration?: number) => void }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [created, setCreated] = useState<CreatedModule[]>([]);
  const [topicId, setTopicId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerateResult | null>(null);

  useEffect(() => {
    void createClient().from('module_topics').select('id, title').order('id').then(({ data }) => {
      setTopics(data ?? []);
      if (data?.length) setTopicId(String(data[0].id));
    });
    void fetchCreated().then(setCreated);
  }, []);

  const submit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/modul/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: Number(topicId), prompt }),
      });
      const body = (await res.json().catch(() => ({}))) as GenerateResult & { error?: string };
      if (!res.ok) {
        setError(body.error ?? 'Gagal membuat modul. Coba lagi.');
        return;
      }
      setResult(body);
      setPrompt('');
      notify('Modul AI berhasil dibuat.');
      void fetchCreated().then(setCreated);
    } catch {
      setError('Koneksi terputus. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const promptLength = prompt.trim().length;

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="page-kicker">Modul AI</span>
          <h1>Buat modul dengan AI</h1>
          <p>Pilih topik dan tulis ide ceritanya. AI menyusun modul simulasi lengkap seperti di aplikasi siswa, dengan 7 kondisi dan 2 kejadian acak.</p>
        </div>
      </section>

      <section className="surface-card">
        <form className="module-form" onSubmit={submit}>
          <label className="field-group">Topik
            <select className="module-select" value={topicId} onChange={(event) => setTopicId(event.target.value)} disabled={busy || !topics.length}>
              {topics.map((topic) => <option value={topic.id} key={topic.id}>{topic.title}</option>)}
            </select>
          </label>
          <label className="field-group">Ide cerita
            <textarea className="module-textarea" rows={4} maxLength={300} value={prompt} onChange={(event) => setPrompt(event.target.value)} disabled={busy}
              placeholder="Contoh: siswa membuka usaha minuman boba di dekat sekolah dengan modal terbatas" />
            <span className="field-hint">{promptLength}/300 karakter, minimal 10.</span>
          </label>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <div className="module-form-actions">
            <button className="primary-button" type="submit" disabled={busy || !topicId || promptLength < 10}>
              {busy ? <><Loader2 size={18} className="module-spin" /> AI sedang menyusun cerita...</> : <><Wand2 size={18} /> Buat modul</>}
            </button>
            {busy ? <small className="field-hint">Proses ini bisa memakan waktu sampai satu menit.</small> : null}
          </div>
        </form>
      </section>

      {result ? (
        <section className="surface-card module-result">
          <span className="status-chip status-done">Berhasil dibuat</span>
          <h2>{result.title}</h2>
          <p>Topik {result.topic}. Peran siswa: {result.role}.</p>
          <dl className="module-facts">
            <div><dt>Kas awal</dt><dd>{rupiah(result.cash)}</dd></div>
            <div><dt>Target kas</dt><dd>{rupiah(result.goal)}</dd></div>
            <div><dt>Kondisi</dt><dd>{result.conditions}</dd></div>
            <div><dt>Kejadian acak</dt><dd>{result.events}</dd></div>
          </dl>
          <p>Modul sudah tersimpan dan langsung muncul di aplikasi siswa.</p>
        </section>
      ) : null}

      <section className="surface-card data-table-card">
        <div className="section-heading-row"><div><h2>Modul AI terbaru</h2><p>Modul hasil generate AI yang tersedia di aplikasi.</p></div></div>
        {created.length ? (
          <table className="data-table">
            <thead><tr><th>Judul</th><th>Topik</th><th>Dibuat</th></tr></thead>
            <tbody>{created.map((item) => <tr key={item.id}><td><strong>{item.title}</strong></td><td>{item.topic}</td><td>{item.createdAt}</td></tr>)}</tbody>
          </table>
        ) : <EmptyState title="Belum ada modul AI" description="Modul yang kamu buat akan muncul di sini." />}
      </section>
    </div>
  );
}
