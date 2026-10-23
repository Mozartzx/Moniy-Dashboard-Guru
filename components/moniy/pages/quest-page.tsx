'use client';

import { ArrowLeft, Check, Loader2, RefreshCw, Send, Sparkles, Trash2, Wand2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  questApi, QuestApiError,
  type Background, type Balance, type Choice, type Proposal, type Quest, type QuestSummary, type RefreshOverview, type Step,
} from '@/lib/moniy/quest-api';
import { EmptyState } from './page-primitives';

type Notify = (message: string, duration?: number) => void;
type ClassOption = { value: string; label: string };

const rupiah = (value: number) => `Rp${value.toLocaleString('id-ID')}`;
const errText = (e: unknown) => (e instanceof QuestApiError ? e.message : 'Terjadi kesalahan. Coba lagi.');
const VERDICT_LABEL = { cerdas: 'Cerdas', biasa: 'Biasa', buruk: 'Buruk' } as const;

function NumberField({ label, value, onChange, step = 10_000, disabled, hint }: {
  label: string; value: number; onChange: (v: number) => void; step?: number; disabled?: boolean; hint?: string;
}) {
  return (
    <label className="field-group quest-number">{label}
      <input className="module-select" type="number" inputMode="numeric" step={step} value={Number.isFinite(value) ? value : 0} disabled={disabled}
        onChange={(e) => onChange(Math.round(Number(e.target.value)))} />
      <span className="field-hint">{hint ?? rupiah(value)}</span>
    </label>
  );
}

function BalancePanel({ balance }: { balance: Balance }) {
  return (
    <section className={`surface-card quest-balance ${balance.ok ? 'quest-balance-ok' : 'quest-balance-warn'}`}>
      <div className="section-heading-row"><div>
        <h2>{balance.ok ? 'Quest seimbang' : 'Perlu diperbaiki sebelum dikirim'}</h2>
        <p>Kas awal {rupiah(balance.startCash)}. Jalur cerdas berakhir {rupiah(balance.best)}, jalur buruk {rupiah(balance.worst)}. Target siswa: {balance.goal === null ? '-' : rupiah(balance.goal)}.</p>
      </div></div>
      {balance.warnings.length ? <ul className="quest-warnings">{balance.warnings.map((w) => <li key={w}>{w}</li>)}</ul> : null}
    </section>
  );
}

function BackgroundEditor({ quest, onSaved, notify }: { quest: Quest; onSaved: () => Promise<void>; notify: Notify }) {
  const [bg, setBg] = useState<Background>(quest.background);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = quest.status !== 'draft';
  const save = async () => {
    setBusy(true); setError('');
    try {
      await questApi.saveBackground(quest.id, { role: bg.role, story: bg.story, cash: bg.cash, income: bg.income, cost: bg.cost });
      await onSaved();
      notify('Latar cerita disimpan.');
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  };
  return (
    <section className="surface-card module-form">
      <h2>Latar cerita</h2>
      <label className="field-group">Peran siswa
        <input className="module-select" maxLength={80} value={bg.role} disabled={locked} onChange={(e) => setBg({ ...bg, role: e.target.value })} />
      </label>
      <label className="field-group">Cerita pembuka
        <textarea className="module-textarea" rows={4} maxLength={1200} value={bg.story} disabled={locked} onChange={(e) => setBg({ ...bg, story: e.target.value })} />
        <span className="field-hint">Kalimat target kas ditambahkan otomatis sesuai keseimbangan.</span>
      </label>
      <div className="quest-grid">
        <NumberField label="Kas awal" value={bg.cash} disabled={locked} onChange={(v) => setBg({ ...bg, cash: v })} />
        <NumberField label="Pemasukan harian" value={bg.income} disabled={locked} onChange={(v) => setBg({ ...bg, income: v })} />
        <NumberField label="Pengeluaran harian" value={bg.cost} disabled={locked} onChange={(v) => setBg({ ...bg, cost: v })} />
      </div>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      {locked ? null : <div className="module-form-actions"><button className="primary-button" type="button" onClick={save} disabled={busy}>{busy ? <Loader2 size={18} className="module-spin" /> : null} Simpan latar</button></div>}
    </section>
  );
}

function ScenarioEditor({ questId, step, locked, onSaved, notify }: {
  questId: number; step: Step; locked: boolean; onSaved: () => Promise<void>; notify: Notify;
}) {
  const [draft, setDraft] = useState<Step>(step);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Muat ulang isian saat data dari server berganti (setelah simpan/terapkan usulan AI).
  const [seen, setSeen] = useState(step);
  if (seen !== step) {
    setSeen(step);
    setDraft(step);
  }

  const setChoice = (i: number, patch: Partial<Choice>) =>
    setDraft({ ...draft, choices: draft.choices.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });

  const save = async () => {
    setBusy(true); setError('');
    try {
      await questApi.saveScenario(questId, step.rowId, { story: draft.story, question: draft.question, hint: draft.hint, choices: draft.choices });
      await onSaved();
      notify('Skenario disimpan.');
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  };

  const title = step.type === 'condition' ? `Kondisi ${step.step}` : `Kejadian acak ${step.step}`;
  return (
    <section className="surface-card module-form quest-scenario">
      <h3>{title}</h3>
      <label className="field-group">Cerita
        <textarea className="module-textarea" rows={3} maxLength={1200} value={draft.story} disabled={locked} onChange={(e) => setDraft({ ...draft, story: e.target.value })} />
      </label>
      <label className="field-group">Pertanyaan
        <input className="module-select" maxLength={300} value={draft.question} disabled={locked} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
      </label>
      <label className="field-group">Petunjuk (opsional)
        <input className="module-select" maxLength={400} value={draft.hint ?? ''} disabled={locked} onChange={(e) => setDraft({ ...draft, hint: e.target.value || null })} />
      </label>
      {draft.choices.map((c, i) => (
        <div className={`quest-choice quest-choice-${c.verdict}`} key={i}>
          <div className="quest-choice-head">
            <strong>Pilihan {i + 1}</strong>
            <select className="module-select quest-verdict" value={c.verdict} disabled={locked} onChange={(e) => setChoice(i, { verdict: e.target.value as Choice['verdict'] })}>
              {Object.entries(VERDICT_LABEL).map(([v, l]) => <option value={v} key={v}>{l}</option>)}
            </select>
          </div>
          <input className="module-select" maxLength={200} value={c.label} disabled={locked} aria-label="Teks pilihan" onChange={(e) => setChoice(i, { label: e.target.value })} />
          <textarea className="module-textarea" rows={2} maxLength={400} value={c.consequence} disabled={locked} aria-label="Akibat pilihan" onChange={(e) => setChoice(i, { consequence: e.target.value })} />
          <div className="quest-grid">
            <NumberField label="Kas sekali jalan" value={c.cash} disabled={locked} onChange={(v) => setChoice(i, { cash: v })} hint={`${c.cash >= 0 ? 'Menambah' : 'Mengurangi'} kas ${rupiah(Math.abs(c.cash))}`} />
            <NumberField label="Pemasukan harian" value={c.income} step={5_000} disabled={locked} onChange={(v) => setChoice(i, { income: v })} />
            <NumberField label="Pengeluaran harian" value={c.cost} step={5_000} disabled={locked} onChange={(v) => setChoice(i, { cost: v })} />
            <NumberField label="Hari berjalan" value={c.days} step={1} disabled={locked} onChange={(v) => setChoice(i, { days: Math.min(30, Math.max(1, v)) })} hint="1 sampai 30 hari" />
          </div>
        </div>
      ))}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      {locked ? null : <div className="module-form-actions"><button className="secondary-button" type="button" onClick={save} disabled={busy}>{busy ? <Loader2 size={18} className="module-spin" /> : <Check size={18} />} Simpan skenario</button></div>}
    </section>
  );
}

function PolishPanel({ quest, onApplied, notify }: { quest: Quest; onApplied: () => Promise<void>; notify: Notify }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [proposals, setProposals] = useState<Proposal[] | null>(null);

  const run = async () => {
    setBusy(true); setError('');
    try {
      const { proposals: all } = await questApi.polish(quest.id);
      setProposals(all.filter((p) => p.changed));
      if (!all.some((p) => p.changed)) notify('AI tidak menemukan yang perlu diperbaiki.');
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  };

  const accept = async (p: Proposal) => {
    const step = [...quest.conditions, ...quest.events].find((s) => s.rowId === p.rowId);
    if (!step) return;
    try {
      await questApi.saveScenario(quest.id, p.rowId, {
        story: p.after.story, question: p.after.question, hint: p.after.hint,
        choices: step.choices.map((c, i) => ({ ...c, label: p.after.choices[i]?.label ?? c.label, consequence: p.after.choices[i]?.consequence ?? c.consequence })),
      });
      setProposals((list) => (list ?? []).filter((x) => x.rowId !== p.rowId));
      await onApplied();
      notify('Usulan AI diterapkan.');
    } catch (e) { setError(errText(e)); }
  };
  const reject = (p: Proposal) => setProposals((list) => (list ?? []).filter((x) => x.rowId !== p.rowId));

  return (
    <section className="surface-card module-form">
      <div className="section-heading-row"><div>
        <h2>Sempurnakan dengan AI</h2>
        <p>AI hanya merapikan teks, tidak mengubah angka. Tiap usulan boleh kamu terima atau tolak.</p>
      </div></div>
      <div className="module-form-actions">
        <button className="secondary-button" type="button" onClick={run} disabled={busy}>
          {busy ? <><Loader2 size={18} className="module-spin" /> AI membaca ceritamu...</> : <><Sparkles size={18} /> Minta usulan AI</>}
        </button>
      </div>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      {proposals?.map((p) => (
        <div className="quest-proposal" key={p.rowId}>
          <strong>{p.type === 'condition' ? `Kondisi ${p.step}` : `Kejadian acak ${p.step}`}</strong>
          <div className="quest-diff"><div><small>Sebelum</small><p>{p.before.story}</p></div><div><small>Usulan AI</small><p>{p.after.story}</p></div></div>
          <div className="module-form-actions">
            <button className="primary-button" type="button" onClick={() => accept(p)}><Check size={16} /> Terima</button>
            <button className="secondary-button" type="button" onClick={() => reject(p)}><X size={16} /> Tolak</button>
          </div>
        </div>
      ))}
      {proposals && !proposals.length ? <p className="field-hint">Tidak ada usulan yang tersisa.</p> : null}
    </section>
  );
}

function SendPanel({ quest, classOptions, onDone, notify }: { quest: Quest; classOptions: ClassOption[]; onDone: () => Promise<void>; notify: Notify }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(quest.refreshEnabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const draft = quest.status === 'draft';
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const send = async () => {
    setBusy(true); setError('');
    try {
      if (draft) await questApi.publish(quest.id, picked, refresh); else await questApi.assign(quest.id, picked);
      setPicked([]);
      await onDone();
      notify(draft ? 'Quest dikirim ke kelas.' : 'Quest ditambahkan ke kelas.');
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  };

  return (
    <section className="surface-card module-form">
      <div className="section-heading-row"><div>
        <h2>{draft ? 'Kirim ke kelas' : 'Tambah ke kelas lain'}</h2>
        <p>Hanya siswa yang sudah bergabung di kelas terpilih yang melihat Quest ini.{draft ? ' Setelah dikirim, isi Quest tidak bisa diedit lagi.' : ''}</p>
      </div></div>
      <div className="quest-classes">
        {classOptions.map((c) => (
          <label className="quest-class" key={c.value}><input type="checkbox" checked={picked.includes(c.value)} onChange={() => toggle(c.value)} /> {c.label}</label>
        ))}
      </div>
      {draft ? (
        <label className="quest-class"><input type="checkbox" checked={refresh} onChange={(e) => setRefresh(e.target.checked)} /> Refreshment harian: AI melanjutkan cerita tiap hari untuk setiap siswa</label>
      ) : null}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <div className="module-form-actions">
        <button className="primary-button" type="button" onClick={send} disabled={busy || !picked.length || (draft && !quest.balance.ok)}>
          {busy ? <Loader2 size={18} className="module-spin" /> : <Send size={18} />} {draft ? 'Kirim Quest' : 'Tambahkan'}
        </button>
        {draft && !quest.balance.ok ? <small className="field-hint">Perbaiki peringatan keseimbangan dulu.</small> : null}
      </div>
    </section>
  );
}

function RefreshPanel({ quest, onChanged, notify }: { quest: Quest; onChanged: () => Promise<void>; notify: Notify }) {
  const [overview, setOverview] = useState<RefreshOverview | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => questApi.refreshOverview(quest.id).then(setOverview).catch((e) => setError(errText(e))), [quest.id]);
  useEffect(() => { void load(); }, [load]);

  const toggle = async () => {
    try {
      const { refreshEnabled } = await questApi.setRefresh(quest.id, !quest.refreshEnabled);
      await onChanged();
      await load();
      notify(refreshEnabled ? 'Refreshment harian diaktifkan.' : 'Refreshment harian dijeda.');
    } catch (e) { setError(errText(e)); }
  };

  return (
    <section className="surface-card data-table-card">
      <div className="section-heading-row">
        <div><h2>Refreshment harian</h2><p>{quest.refreshEnabled ? 'Aktif: cerita siswa dilanjutkan AI tiap hari.' : 'Dijeda: tidak ada lanjutan cerita baru.'}</p></div>
        <button className="secondary-button" type="button" onClick={toggle}><RefreshCw size={16} /> {quest.refreshEnabled ? 'Jeda' : 'Aktifkan'}</button>
      </div>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      {overview?.students.length ? (
        <table className="data-table">
          <thead><tr><th>Siswa</th><th>Status</th><th>Hari refresh</th><th>Terakhir</th><th>Kas</th></tr></thead>
          <tbody>{overview.students.map((s) => (
            <tr key={s.userId}><td><strong>{s.name}</strong></td><td>{s.started ? (s.phase ?? 'Berjalan') : 'Belum mulai'}</td><td>{s.refreshDays}</td><td>{s.lastRefreshDate ?? '-'}</td><td>{s.cash === null ? '-' : rupiah(s.cash)}</td></tr>
          ))}</tbody>
        </table>
      ) : <EmptyState title="Belum ada siswa" description="Siswa muncul di sini setelah bergabung ke kelas yang menerima Quest ini." />}
    </section>
  );
}

function QuestEditor({ id, classOptions, notify, onBack }: { id: number; classOptions: ClassOption[]; notify: Notify; onBack: () => void }) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    try { setQuest(await questApi.get(id)); } catch (e) { setError(errText(e)); }
  }, [id]);
  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  if (error) return <div className="page-stack"><button className="secondary-button" onClick={onBack}><ArrowLeft size={16} /> Kembali</button><p className="field-error">{error}</p></div>;
  if (!quest) return <div className="page-stack"><p className="field-hint"><Loader2 size={16} className="module-spin" /> Memuat Quest...</p></div>;
  const locked = quest.status !== 'draft';

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <button className="secondary-button" type="button" onClick={onBack}><ArrowLeft size={16} /> Semua Quest</button>
          <h1>{quest.title}</h1>
          <p>Topik {quest.topic ?? '-'} · <span className={`status-chip ${locked ? 'status-done' : ''}`}>{locked ? 'Sudah dikirim' : 'Draft'}</span></p>
        </div>
      </section>
      <BalancePanel balance={quest.balance} />
      <BackgroundEditor quest={quest} onSaved={reload} notify={notify} />
      {[...quest.conditions, ...quest.events].map((s) => (
        <ScenarioEditor key={s.rowId} questId={quest.id} step={s} locked={locked} onSaved={reload} notify={notify} />
      ))}
      {locked ? null : <PolishPanel quest={quest} onApplied={reload} notify={notify} />}
      <SendPanel quest={quest} classOptions={classOptions} onDone={reload} notify={notify} />
      {locked ? <RefreshPanel quest={quest} onChanged={reload} notify={notify} /> : null}
    </div>
  );
}

export function QuestPage({ notify, classOptions }: { notify: Notify; classOptions: ClassOption[] }) {
  const [topics, setTopics] = useState<{ id: number; title: string }[]>([]);
  const [list, setList] = useState<QuestSummary[] | null>(null);
  const [topicId, setTopicId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const loadList = useCallback(() => questApi.mine().then(setList).catch((e) => { setList([]); setError(errText(e)); }), []);
  useEffect(() => {
    void questApi.topics().then((t) => { setTopics(t); if (t.length) setTopicId(String(t[0].id)); });
    void loadList();
  }, [loadList]);

  if (openId !== null) return <QuestEditor id={openId} classOptions={classOptions} notify={notify} onBack={() => { setOpenId(null); void loadList(); }} />;

  const create = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try {
      const quest = await questApi.createDraft(Number(topicId), prompt.trim());
      setPrompt('');
      notify('Draft Quest siap. Periksa dan sesuaikan sebelum dikirim.');
      setOpenId(quest.id);
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  };

  const remove = async (q: QuestSummary) => {
    try { await questApi.remove(q.id); notify('Quest dihapus.'); await loadList(); } catch (e) { setError(errText(e)); }
  };

  const promptLength = prompt.trim().length;
  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="page-kicker">Quest</span>
          <h1>Buat Moniy Quest</h1>
          <p>Pilih topik dan tulis ide ceritanya. AI menyusun seluruh skenario sebagai draft. Kamu periksa, ubah angkanya, sempurnakan, lalu kirim ke kelas.</p>
        </div>
      </section>

      <section className="surface-card">
        <form className="module-form" onSubmit={create}>
          <label className="field-group">Topik
            <select className="module-select" value={topicId} onChange={(e) => setTopicId(e.target.value)} disabled={busy || !topics.length}>
              {topics.map((t) => <option value={t.id} key={t.id}>{t.title}</option>)}
            </select>
          </label>
          <label className="field-group">Ide cerita
            <textarea className="module-textarea" rows={4} maxLength={300} value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={busy}
              placeholder="Contoh: siswa membuka usaha minuman boba di dekat sekolah dengan modal terbatas" />
            <span className="field-hint">{promptLength}/300 karakter, minimal 10.</span>
          </label>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <div className="module-form-actions">
            <button className="primary-button" type="submit" disabled={busy || !topicId || promptLength < 10}>
              {busy ? <><Loader2 size={18} className="module-spin" /> AI sedang menyusun draft...</> : <><Wand2 size={18} /> Buat draft Quest</>}
            </button>
            {busy ? <small className="field-hint">Bisa sampai beberapa menit. Jangan tutup halaman ini.</small> : null}
          </div>
        </form>
      </section>

      <section className="surface-card data-table-card">
        <div className="section-heading-row"><div><h2>Quest saya</h2><p>Draft dan Quest yang sudah dikirim ke kelas.</p></div></div>
        {list === null ? <p className="field-hint"><Loader2 size={16} className="module-spin" /> Memuat...</p> : list.length ? (
          <table className="data-table">
            <thead><tr><th>Judul</th><th>Topik</th><th>Status</th><th>Kelas</th><th aria-label="Aksi" /></tr></thead>
            <tbody>{list.map((q) => (
              <tr key={q.id}>
                <td><button className="link-button" type="button" onClick={() => setOpenId(q.id)}>{q.title}</button></td>
                <td>{q.topic ?? '-'}</td>
                <td><span className={`status-chip ${q.status === 'published' ? 'status-done' : ''}`}>{q.status === 'published' ? 'Terkirim' : 'Draft'}</span></td>
                <td>{q.classIds.length}</td>
                <td>{q.status === 'draft' ? <button className="icon-button" type="button" aria-label={`Hapus ${q.title}`} onClick={() => remove(q)}><Trash2 size={16} /></button> : null}</td>
              </tr>
            ))}</tbody>
          </table>
        ) : <EmptyState title="Belum ada Quest" description="Quest yang kamu buat akan muncul di sini." />}
      </section>
    </div>
  );
}
