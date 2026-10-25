'use client';

import { Check, Loader2, RotateCcw, Send, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { errText, questApi, type Outline, type Quest, type StreamEvent } from '@/lib/moniy/quest-api';
import { FormSelect } from './form-select';
import { SendPanel } from './quest-send-panel';

type Notify = (message: string, duration?: number) => void;
type ClassOption = { value: string; label: string };
type Topic = { id: number; title: string };
type StepRow = { key: string; label: string; status: 'running' | 'done' | 'failed' };
type DoneInfo = { questId: number; title: string; balanceOk: boolean; warnings: string[] };
type Turn =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'ai'; stage: 'kerangka' | 'simulasi'; steps: StepRow[]; outline?: Outline; error?: string; done?: DoneInfo; running: boolean };

const WAIT_NOTE = 'Proses generate memakan waktu. Mohon jangan tutup halaman ini.';

/** Contoh ide per chapter: tokoh, dilema, dan konsep dalam dua kalimat. */
const EXAMPLES: Record<number, string> = {
  1: 'Rafi dapat uang saku Rp300.000 per bulan. Ia ingin membeli headset baru, padahal buku tugas juga perlu dibeli. Ia harus membedakan kebutuhan dan keinginan.',
  2: 'Dinda punya Rp200.000 untuk sebulan, tetapi ada iuran kelas, ongkos, dan ajakan nonton bareng. Ia harus menyusun urutan prioritas pengeluarannya.',
  3: 'Dino dapat uang saku Rp500.000 per bulan, ingin membeli sepatu, tetapi orang tuanya menyarankan membuka tabungan di bank. Ia belajar soal bunga dan biaya admin.',
  4: 'Rafi baru punya penghasilan dari jualan dan ditawari arisan serta koperasi sekolah. Ia harus memahami beda bank dan lembaga nonbank.',
  5: 'Dinda tergoda pinjaman online cepat cair untuk membeli ponsel. Ia harus membandingkan bunga, denda, dan risikonya sebelum memutuskan.',
  6: 'Rafi diajak temannya bermain judi online dengan iming-iming menang cepat. Ia harus menolak dan memahami risikonya bagi uang saku dan masa depannya.',
  7: 'Dinda berjualan camilan di sekolah, tetapi uang usaha dan uang jajannya tercampur. Ia belajar mencatat pemasukan dan pengeluaran agar tahu untung atau rugi.',
  8: 'Dino ingin tahu apakah keuangannya sehat: ada tabungan, utang kecil, dan pengeluaran rutin. Ia belajar menilai porsi tabungan dan dana darurat.',
};
const exampleFor = (label: string) => EXAMPLES[Number(/Chapter (\d+)/.exec(label)?.[1])] ?? 'Tulis tokoh, dilema utama, dan konsep yang ingin diajarkan.';

function StepList({ steps }: { steps: StepRow[] }) {
  return (
    <ul className="sim-steps" aria-live="polite">
      {steps.map((s) => (
        <li className={`sim-step sim-step-${s.status}`} key={s.key}>
          <span className="sim-step-icon" aria-hidden="true">
            {s.status === 'running' ? <Loader2 size={16} className="module-spin" /> : s.status === 'done' ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
          </span>
          <span>{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

function OutlineView({ outline }: { outline: Outline }) {
  return (
    <div className="sim-outline">
      <div className="sim-outline-head"><strong>{outline.judul}</strong><span>{outline.tokoh}</span></div>
      <ol>
        {outline.items.map((it, i) => (
          <li className="sim-item" key={i}>
            <div className="sim-item-top">
              <span className="sim-num">{i + 1}</span>
              <span className={`sim-badge sim-badge-${it.jenis}`}>{it.jenis === 'kondisi' ? 'Kondisi' : 'Kejadian acak'}</span>
              <strong>{it.judul}</strong>
            </div>
            <p>{it.inti}</p>
            <p className="sim-learn"><span>Yang dipelajari siswa</span>{it.belajar}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function DonePanel({ done, classOptions, notify, onOpen }: { done: DoneInfo; classOptions: ClassOption[]; notify: Notify; onOpen: (id: number) => void }) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const load = useCallback(async () => { setQuest(await questApi.get(done.questId)); }, [done.questId]);
  useEffect(() => {
    let live = true;
    void questApi.get(done.questId).then((q) => { if (live) setQuest(q); });
    return () => { live = false; };
  }, [done.questId]);
  return (
    <div className="sim-done">
      <div className="sim-done-head">
        <strong>Simulasi siap: {done.title}</strong>
        <span className={`sim-badge ${done.balanceOk ? 'sim-badge-ok' : 'sim-badge-warn'}`}>{done.balanceOk ? 'Seimbang' : 'Perlu diperbaiki'}</span>
      </div>
      {done.warnings.length ? <ul className="quest-warnings">{done.warnings.map((w) => <li key={w}>{w}</li>)}</ul> : null}
      {quest ? <SendPanel quest={quest} classOptions={classOptions} onDone={load} notify={notify} /> : <div className="skeleton sim-skeleton" aria-label="Memuat pengiriman" />}
      <div><button className="secondary-button" type="button" onClick={() => onOpen(done.questId)}>Buka detail dan edit manual</button></div>
    </div>
  );
}

export function QuestChat({ topics, classOptions, notify, onOpen, onActiveChange }: {
  topics: Topic[]; classOptions: ClassOption[]; notify: Notify; onOpen: (id: number) => void; onActiveChange: (active: boolean) => void;
}) {
  const [pickedTopic, setPickedTopic] = useState('');
  const [idea, setIdea] = useState('');
  const [reply, setReply] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const active = turns.length > 0;
  const topicId = pickedTopic || (topics.length ? String(topics[0].id) : '');

  useEffect(() => { onActiveChange(active); }, [active, onActiveChange]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [turns]);
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  const topicLabel = topics.find((t) => String(t.id) === topicId)?.title ?? '';
  const latestOutline = [...turns].reverse().find((t): t is Extract<Turn, { role: 'ai' }> => t.role === 'ai' && !!t.outline)?.outline;
  const finished = turns.some((t) => t.role === 'ai' && t.done);

  const run = async (stage: 'kerangka' | 'simulasi', go: (onEvent: (e: StreamEvent) => void) => Promise<void>) => {
    const id = nextId.current++;
    const patch = (fn: (t: Extract<Turn, { role: 'ai' }>) => Extract<Turn, { role: 'ai' }>) =>
      setTurns((prev) => prev.map((t) => (t.id === id && t.role === 'ai' ? fn(t) : t)));
    setTurns((prev) => [...prev, { id, role: 'ai', stage, steps: [], running: true }]);
    setBusy(true);
    let ended = false;
    const onEvent = (e: StreamEvent) => {
      if (e.type === 'step') {
        patch((t) => ({ ...t, steps: t.steps.some((s) => s.key === e.key) ? t.steps.map((s) => (s.key === e.key ? { ...s, label: e.label, status: e.status } : s)) : [...t.steps, { key: e.key, label: e.label, status: e.status }] }));
      } else if (e.type === 'outline') { ended = true; patch((t) => ({ ...t, outline: e.outline })); }
      else if (e.type === 'done') { ended = true; patch((t) => ({ ...t, done: { questId: e.questId, title: e.title, balanceOk: e.balanceOk, warnings: e.warnings } })); }
      else if (e.type === 'error') { ended = true; patch((t) => ({ ...t, error: e.message })); }
    };
    try { await go(onEvent); } catch (err) { patch((t) => ({ ...t, error: errText(err) })); ended = true; }
    if (!ended) patch((t) => ({ ...t, error: 'Koneksi terputus sebelum selesai. Coba lagi.' }));
    patch((t) => ({ ...t, running: false }));
    setBusy(false);
  };

  const addUser = (text: string) => setTurns((prev) => [...prev, { id: nextId.current++, role: 'user', text }]);

  const start = () => {
    const text = idea.trim();
    addUser(text);
    void run('kerangka', (on) => questApi.outlineStream({ topicId: Number(topicId), prompt: text }, on));
  };
  const revise = () => {
    const text = reply.trim();
    if (!latestOutline || !text) return;
    addUser(text); setReply('');
    void run('kerangka', (on) => questApi.outlineStream({ topicId: Number(topicId), prompt: idea.trim(), outline: latestOutline, instruction: text }, on));
  };
  const approve = () => {
    if (!latestOutline) return;
    addUser('Kerangka disetujui. Buat simulasinya.');
    void run('simulasi', (on) => questApi.draftStream({ topicId: Number(topicId), prompt: idea.trim(), outline: latestOutline }, on));
  };
  const reset = () => { setTurns([]); setReply(''); };

  if (!active) {
    const len = idea.trim().length;
    return (
      <section className="surface-card">
        <form className="module-form" onSubmit={(e) => { e.preventDefault(); start(); }}>
          <div className="field-group">Topik
            <FormSelect label="Topik" value={topicId} options={topics.map((t) => ({ value: String(t.id), label: t.title }))} onValueChange={setPickedTopic} disabled={!topics.length} />
          </div>
          <label className="field-group">Ide cerita
            <textarea className="module-textarea" rows={4} maxLength={300} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder={`Contoh: ${exampleFor(topicLabel)}`} />
            <span className="field-hint">Tulis tokoh, dilema utama, dan konsep yang ingin diajarkan. {len}/300, minimal 10 karakter.</span>
          </label>
          <div className="module-form-actions">
            <button className="primary-button" type="submit" disabled={!topicId || len < 10}><Send size={18} /> Buat kerangka</button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <div className="sim-chat">
      <div className="sim-chat-top">
        <p>{topicLabel}</p>
        <button className="secondary-button" type="button" onClick={reset} disabled={busy}><RotateCcw size={16} /> Mulai baru</button>
      </div>
      <div className="sim-thread">
        {turns.map((t) => {
          if (t.role === 'user') return <div className="sim-msg sim-msg-user" key={t.id}>{t.text}</div>;
          const isLatest = t.outline && t.outline === latestOutline;
          return (
            <div className="sim-msg sim-msg-ai" key={t.id}>
              <StepList steps={t.steps} />
              {t.running ? <p className="sim-wait">{WAIT_NOTE}</p> : null}
              {t.running && t.stage === 'kerangka' && !t.outline ? <div className="sim-skeletons" aria-label="Menyusun kerangka"><div className="skeleton sim-skeleton" /><div className="skeleton sim-skeleton" /><div className="skeleton sim-skeleton" /></div> : null}
              {t.outline ? (isLatest ? <OutlineView outline={t.outline} /> : <details className="sim-old"><summary>Lihat kerangka versi sebelumnya</summary><OutlineView outline={t.outline} /></details>) : null}
              {t.error ? <p className="field-error" role="alert">{t.error}</p> : null}
              {t.done ? <DonePanel done={t.done} classOptions={classOptions} notify={notify} onOpen={onOpen} /> : null}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {finished ? (
        <div><button className="secondary-button" type="button" onClick={reset}>Buat simulasi baru</button></div>
      ) : (
        <div className="sim-composer">
          <textarea className="module-textarea" rows={2} maxLength={400} value={reply} disabled={busy || !latestOutline} onChange={(e) => setReply(e.target.value)}
            aria-label="Perubahan yang diinginkan" placeholder="Tulis perubahan yang kamu inginkan, misalnya: ganti skenario 3 jadi soal bunga tabungan." />
          <div className="sim-composer-actions">
            <button className="secondary-button" type="button" onClick={revise} disabled={busy || !latestOutline || reply.trim().length < 3}><Send size={16} /> Kirim perubahan</button>
            <button className="primary-button" type="button" onClick={approve} disabled={busy || !latestOutline}>Setujui kerangka dan buat simulasi</button>
          </div>
        </div>
      )}
    </div>
  );
}
