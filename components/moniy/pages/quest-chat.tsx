'use client';

import { Check, Loader2, PanelRightClose, PanelRightOpen, Send, X } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useDefaultLayout } from 'react-resizable-panels';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { errText, questApi, type Outline, type StreamEvent } from '@/lib/moniy/quest-api';
import { FormSelect } from './form-select';
import { SimPanel, type DoneInfo } from './quest-panel';

type Notify = (message: string, duration?: number) => void;
type ClassOption = { value: string; label: string };
type Topic = { id: number; title: string };
type StepRow = { key: string; label: string; status: 'running' | 'done' | 'failed' };
type AiTurn = { id: number; role: 'ai'; stage: 'kerangka' | 'simulasi'; steps: StepRow[]; outline?: Outline; reply?: string; error?: string; done?: DoneInfo; running: boolean };
type Turn = { id: number; role: 'user'; text: string } | AiTurn;

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

/** Layar sempit: panel menggantikan chat (bukan berdampingan). */
function useNarrow() {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia('(max-width: 900px)'); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
    () => window.matchMedia('(max-width: 900px)').matches,
    () => false,
  );
}

/** Dua kolom yang bisa digeser; lebar tersimpan di browser. Hanya dirender setelah obrolan dimulai (tidak ikut SSR). */
function SplitLayout({ chat, panel, open, narrow }: { chat: ReactNode; panel: ReactNode; open: boolean; narrow: boolean }) {
  const layout = useDefaultLayout({ id: 'sim-split', panelIds: ['chat', 'panel'] });
  if (narrow) return <div className="sim-single">{open ? panel : chat}</div>;
  return (
    <ResizablePanelGroup orientation="horizontal" className="sim-split" id="sim-split" defaultLayout={layout.defaultLayout} onLayoutChanged={layout.onLayoutChanged}>
      <ResizablePanel id="chat" minSize="30%">{chat}</ResizablePanel>
      {open ? (
        <>
          <ResizableHandle withHandle className="sim-handle" />
          <ResizablePanel id="panel" defaultSize="45%" minSize="28%" maxSize="70%">{panel}</ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  );
}

/** Riwayat chat dan kerangka tersimpan di server per simulasi (tabel quest_chats), supaya terlihat lagi di perangkat mana pun. */
const asTurns = (raw: unknown): Turn[] => (Array.isArray(raw)
  ? (raw as Turn[]).filter((t) => t && typeof t.id === 'number' && (t.role === 'user' || t.role === 'ai')).map((t) => (t.role === 'ai' ? { ...t, running: false } : t))
  : []);

/** Riwayat lama yang sempat disimpan di browser (sebelum ada database): dibaca sekali lalu dipindahkan ke server. */
function legacyTurns(questId: number): Turn[] {
  try {
    const raw = window.localStorage.getItem(`moniy.sim.chat.${questId}`);
    return raw ? asTurns((JSON.parse(raw) as { turns?: unknown }).turns) : [];
  } catch { return []; }
}

export function QuestChat({ topics, classOptions, notify, resumeId, onActiveChange, onResumeFailed }: {
  topics: Topic[]; classOptions: ClassOption[]; notify: Notify; resumeId: number | null; onActiveChange: (active: boolean) => void; onResumeFailed: (message: string) => void;
}) {
  const [pickedTopic, setPickedTopic] = useState('');
  const [idea, setIdea] = useState('');
  const [reply, setReply] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [pickedVersion, setPickedVersion] = useState<number | null>(null);
  const [resuming, setResuming] = useState(resumeId !== null);
  const [resumeTopic, setResumeTopic] = useState('');
  const narrow = useNarrow();
  const nextId = useRef(1);
  // Giliran yang sudah ada di server (dimuat atau baru disimpan); mencegah menyimpan ulang yang sama.
  const savedTurns = useRef<Turn[] | null>(null);
  const active = turns.length > 0;
  const topicId = pickedTopic || (topics.length ? String(topics[0].id) : '');

  // Membuka draft atau simulasi yang sudah ada: panel langsung menampilkan simulasinya, chat tetap bisa dipakai bertanya.
  useEffect(() => {
    if (resumeId === null) return;
    let live = true;
    void Promise.all([questApi.get(resumeId), questApi.getChat(resumeId).catch(() => ({ turns: [] }))]).then(([q, chat]) => {
      if (!live) return;
      const info: DoneInfo = { questId: q.id, title: q.title, balanceOk: q.balance.ok, warnings: q.balance.warnings };
      setResumeTopic(q.topic ?? '');
      let saved = asTurns(chat.turns);
      if (!saved.length) {
        saved = legacyTurns(resumeId);
        if (saved.length) void questApi.saveChat(resumeId, saved).catch(() => undefined);
      }
      if (saved.length) {
        nextId.current = Math.max(...saved.map((t) => t.id)) + 1;
        savedTurns.current = saved;
        setTurns(saved);
      } else {
        setTurns([{
          id: nextId.current++, role: 'ai', stage: 'simulasi', steps: [], running: false, done: info,
          reply: q.status === 'draft'
            ? 'Draft dibuka. Kamu bisa bertanya di sini, atau mengedit langsung di panel kanan lewat ikon pensil.'
            : 'Simulasi ini sudah dikirim ke kelas. Kamu bisa bertanya tentang isinya di sini.',
        }]);
      }
      setPanelOpen(true); setResuming(false);
    }).catch((err) => { if (live) { setResuming(false); onResumeFailed(`Simulasi tidak bisa dibuka. ${errText(err)}`); } });
    return () => { live = false; };
  }, [resumeId, onResumeFailed]);

  useEffect(() => { onActiveChange(active || resuming); }, [active, resuming, onActiveChange]);
  const lastUserId = [...turns].reverse().find((t) => t.role === 'user')?.id;
  useEffect(() => {
    if (lastUserId !== undefined) document.getElementById(`sim-turn-${lastUserId}`)?.scrollIntoView({ block: 'start' });
  }, [lastUserId]);
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  const aiTurns = turns.filter((t): t is AiTurn => t.role === 'ai');
  const versions = aiTurns.flatMap((t) => (t.outline ? [t.outline] : []));
  const latestOutline = versions[versions.length - 1];
  const shownVersion = Math.min(pickedVersion ?? versions.length - 1, versions.length - 1);
  const doneInfo = aiTurns.find((t) => t.done)?.done ?? null;
  useEffect(() => {
    if (!doneInfo || busy || turns === savedTurns.current) return;
    savedTurns.current = turns;
    void questApi.saveChat(doneInfo.questId, turns.slice(-60)).catch(() => undefined);
  }, [turns, doneInfo, busy]);
  const topicLabel = resumeId !== null ? resumeTopic : (topics.find((t) => String(t.id) === topicId)?.title ?? '');

  const run = async (stage: 'kerangka' | 'simulasi', go: (onEvent: (e: StreamEvent) => void) => Promise<void>) => {
    const id = nextId.current++;
    const patch = (fn: (t: AiTurn) => AiTurn) => setTurns((prev) => prev.map((t) => (t.id === id && t.role === 'ai' ? fn(t) : t)));
    setTurns((prev) => [...prev, { id, role: 'ai', stage, steps: [], running: true }]);
    setBusy(true);
    let ended = false;
    let wantsApprove = false;
    const onEvent = (e: StreamEvent) => {
      if (e.type === 'step') {
        patch((t) => ({ ...t, steps: t.steps.some((s) => s.key === e.key) ? t.steps.map((s) => (s.key === e.key ? { ...s, label: e.label, status: e.status } : s)) : [...t.steps, { key: e.key, label: e.label, status: e.status }] }));
      } else if (e.type === 'outline') {
        ended = true; patch((t) => ({ ...t, outline: e.outline }));
        setPickedVersion(null); setPanelOpen(true);
      } else if (e.type === 'reply') { ended = true; wantsApprove = e.approve; patch((t) => ({ ...t, reply: e.text })); }
      else if (e.type === 'done') {
        ended = true; patch((t) => ({ ...t, done: { questId: e.questId, title: e.title, balanceOk: e.balanceOk, warnings: e.warnings } }));
        setPanelOpen(true);
      } else if (e.type === 'error') { ended = true; patch((t) => ({ ...t, error: e.message })); }
    };
    try { await go(onEvent); } catch (err) { patch((t) => ({ ...t, error: errText(err) })); ended = true; }
    if (!ended) patch((t) => ({ ...t, error: 'Koneksi terputus sebelum selesai. Coba lagi.' }));
    patch((t) => ({ ...t, running: false }));
    setBusy(false);
    return wantsApprove;
  };

  const addUser = (text: string) => setTurns((prev) => [...prev, { id: nextId.current++, role: 'user', text }]);

  const start = () => {
    const text = idea.trim();
    addUser(text);
    void run('kerangka', (on) => questApi.outlineStream({ topicId: Number(topicId), prompt: text }, on));
  };
  const revise = () => {
    const text = reply.trim();
    if (busy || !text || (!latestOutline && !doneInfo)) return;
    // Riwayat dikirim agar jawaban singkat ("namanya Sara") dipahami sesuai pertanyaan Moniy sebelumnya.
    const history = turns.flatMap((t): { role: 'guru' | 'moni'; text: string }[] => {
      if (t.role === 'user') return [{ role: 'guru', text: t.text }];
      if (t.reply) return [{ role: 'moni', text: t.reply }];
      if (t.outline) return [{ role: 'moni', text: `Membuat kerangka: ${t.outline.judul}` }];
      return [];
    }).slice(-8);
    addUser(text); setReply('');
    // Setelah simulasi jadi, chat hanya untuk bertanya; sebelum itu Moniy menentukan sendiri: tanya, revisi kerangka, atau setuju.
    if (doneInfo) {
      void run('kerangka', (on) => questApi.outlineStream({ questId: doneInfo.questId, instruction: text, history }, on));
      return;
    }
    void run('kerangka', (on) => questApi.outlineStream({ topicId: Number(topicId), prompt: idea.trim(), outline: latestOutline, instruction: text, history }, on))
      .then((wantsApprove) => { if (wantsApprove) approve(); });
  };
  const approve = () => {
    if (!latestOutline) return;
    addUser('Kerangka disetujui. Buat simulasinya.');
    void run('simulasi', (on) => questApi.draftStream({ topicId: Number(topicId), prompt: idea.trim(), outline: latestOutline }, on));
  };
  // Kerangka terbaru bisa diedit langsung di panel; hasilnya menggantikan versi itu (bukan versi baru).
  const editOutline = (next: Outline) => setTurns((prev) => {
    const last = prev.map((t, i) => (t.role === 'ai' && t.outline ? i : -1)).filter((i) => i >= 0).pop();
    return prev.map((t, i) => (i === last && t.role === 'ai' ? { ...t, outline: next } : t));
  });
  const showVersion = (i: number) => { setPickedVersion(i); setPanelOpen(true); };

  if (resuming && !active) return <div className="skeleton quest-skeleton" aria-label="Membuka simulasi" />;

  if (!active) {
    const len = idea.trim().length;
    return (
      <section className="surface-card">
        <form className="module-form" onSubmit={(e) => { e.preventDefault(); start(); }}>
          <div className="field-group">Topik
            <FormSelect label="Topik" value={topicId} options={topics.map((t) => ({ value: String(t.id), label: t.title }))} onValueChange={setPickedTopic} disabled={!topics.length} />
          </div>
          <label className="field-group">Ide cerita
            <textarea className="module-textarea" rows={4} maxLength={300} value={idea} onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (topicId && idea.trim().length >= 10) start(); } }} placeholder={`Contoh: ${exampleFor(topicLabel)}`} />
            <span className="field-hint">Tulis tokoh, dilema utama, rentang waktu, dan konsep yang ingin diajarkan. {len}/300, minimal 10 karakter. Enter untuk kirim, Shift+Enter untuk baris baru.</span>
          </label>
          <div className="module-form-actions">
            <button className="primary-button" type="submit" disabled={!topicId || len < 10}><Send size={18} /> Buat kerangka</button>
          </div>
        </form>
      </section>
    );
  }

  const hasPanelContent = versions.length > 0 || !!doneInfo;
  const versionIndex = new Map<number, number>();
  aiTurns.forEach((t) => { if (t.outline) versionIndex.set(t.id, versionIndex.size); });

  const chat = (
    <div className="sim-chatcol">
      <div className="sim-chat-top">
        <p>{topicLabel}</p>
        <div className="sim-chat-actions">
          {hasPanelContent ? (
            <button className="secondary-button" type="button" onClick={() => setPanelOpen((v) => !v)} aria-pressed={panelOpen}>
              {panelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />} {panelOpen ? 'Tutup panel' : 'Buka panel'}
            </button>
          ) : null}
        </div>
      </div>
      <div className="sim-thread">
        {turns.map((t) => {
          if (t.role === 'user') return <div className="sim-msg sim-msg-user" id={`sim-turn-${t.id}`} key={t.id}>{t.text}</div>;
          const myVersion = versionIndex.get(t.id) ?? -1;
          return (
            <div className="sim-msg sim-msg-ai" key={t.id}>
              <StepList steps={t.steps} />
              {t.reply ? <p className="sim-reply">{t.reply}</p> : null}
              {t.running ? <p className="sim-wait">{WAIT_NOTE}</p> : null}
              {t.outline ? (
                <div className="sim-result">
                  <div><strong>Kerangka versi {myVersion + 1} siap</strong><span>{t.outline.judul}, {t.outline.items.length} skenario</span></div>
                  <button className="secondary-button" type="button" onClick={() => showVersion(myVersion)}>Lihat di panel</button>
                </div>
              ) : null}
              {t.error ? <p className="field-error" role="alert">{t.error}</p> : null}
              {t.done ? (
                <div className="sim-result">
                  <div><strong>Simulasi {t.steps.length ? 'siap' : 'dibuka'}</strong><span>{t.done.title}</span></div>
                  <span className={`sim-badge ${t.done.balanceOk ? 'sim-badge-ok' : 'sim-badge-warn'}`}>{t.done.balanceOk ? 'Seimbang' : 'Perlu diperbaiki'}</span>
                  <button className="secondary-button" type="button" onClick={() => setPanelOpen(true)}>Lihat di panel</button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="sim-composer">
        <textarea className="module-textarea" rows={2} maxLength={400} value={reply} disabled={busy || (!latestOutline && !doneInfo)} onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); revise(); } }}
          aria-label="Pesan untuk Moniy"
          placeholder={doneInfo ? 'Tanya Moniy tentang simulasi ini. Untuk mengubah isi, klik ikon pensil di panel.' : 'Tanya Moniy atau minta perubahan, misalnya: ganti skenario 3 jadi soal bunga tabungan.'} />
        <div className="sim-composer-actions">
          <button className="secondary-button" type="button" onClick={revise} disabled={busy || (!latestOutline && !doneInfo) || reply.trim().length < 2}><Send size={16} /> Kirim</button>
          {doneInfo ? null : <button className="primary-button" type="button" onClick={approve} disabled={busy || !latestOutline}>Setujui kerangka dan buat simulasi</button>}
        </div>
      </div>
    </div>
  );

  const panel = (
    <SimPanel versions={versions} picked={Math.max(shownVersion, 0)} onPick={showVersion} onEditOutline={editOutline} done={doneInfo}
      classOptions={classOptions} notify={notify} onClose={() => setPanelOpen(false)} />
  );

  return <SplitLayout chat={chat} panel={panel} open={panelOpen && hasPanelContent} narrow={narrow} />;
}
