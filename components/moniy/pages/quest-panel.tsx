'use client';

import { Check, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Pencil, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { errText, questApi, type Outline, type OutlineItem, type Quest, type Step } from '@/lib/moniy/quest-api';
import { RefreshPanel } from './quest-refresh-panel';
import { SendPanel } from './quest-send-panel';

type Notify = (message: string, duration?: number) => void;
type ClassOption = { value: string; label: string };
export type DoneInfo = { questId: number; title: string; balanceOk: boolean; warnings: string[] };

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;
const VERDICT = { cerdas: 'Cerdas', biasa: 'Biasa', buruk: 'Buruk' } as const;
const messageOf = (e: unknown) => (e instanceof Error ? e.message : errText(e));

/** Tempel sebagai teks biasa (tanpa format dari sumber lain). */
function pastePlain(e: React.ClipboardEvent<HTMLElement>) {
  e.preventDefault();
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(e.clipboardData.getData('text/plain'));
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Teks yang bisa diketik langsung di tempatnya (tanpa kotak isian). Nilainya dibaca saat menyimpan lewat
 * atribut data-edit, jadi tidak perlu state per bagian.
 */
function Editable({ name, initial, multiline, numeric }: { name: string; initial: string; multiline?: boolean; numeric?: boolean }) {
  return (
    <span
      className={`sim-editable${numeric ? ' sim-editable-num' : ''}`}
      data-edit={name}
      contentEditable
      suppressContentEditableWarning
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- edit langsung di tempat butuh elemen contentEditable, bukan input
      role="textbox"
      tabIndex={0}
      aria-multiline={multiline ? true : undefined}
      inputMode={numeric ? 'numeric' : 'text'}
      onKeyDown={(e) => { if (e.key === 'Enter' && !multiline) e.preventDefault(); }}
      onPaste={pastePlain}
    >{initial}</span>
  );
}

const readText = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`[data-edit="${name}"]`)?.innerText.trim() ?? '';
function readNumber(root: HTMLElement, name: string, label: string): number {
  const n = parseInt(readText(root, name).replace(/[^\d-]/g, ''), 10);
  if (!Number.isFinite(n)) throw new Error(`${label} harus berupa angka.`);
  return n;
}

function EditButtons({ editing, saving, disabled, label, onEdit, onSave, onCancel }: {
  editing: boolean; saving: boolean; disabled: boolean; label: string; onEdit: () => void; onSave: () => void; onCancel: () => void;
}) {
  return editing ? (
    <span className="sim-edit-actions">
      <button className="icon-button sim-icon-ok" type="button" onClick={onSave} disabled={saving} aria-label={`Simpan ${label}`} title="Simpan"><Check size={16} /></button>
      <button className="icon-button" type="button" onClick={onCancel} disabled={saving} aria-label={`Batal ${label}`} title="Batal"><X size={16} /></button>
    </span>
  ) : (
    <span className="sim-edit-actions">
      <button className="icon-button" type="button" onClick={onEdit} disabled={disabled} aria-label={`Edit ${label}`} title="Edit"><Pencil size={15} /></button>
    </span>
  );
}

/** Satu skenario pada kerangka: judul, waktu, inti, dan poin belajar bisa diedit langsung. */
function OutlineItemView({ item, index, editable, editing, setEditing, onSave, children }: {
  item: OutlineItem; index: number; editable: boolean; editing: string | null; setEditing: (k: string | null) => void; onSave: (next: OutlineItem) => void; children?: ReactNode;
}) {
  const key = `i${index}`;
  const isEditing = editing === key;
  const root = useRef<HTMLLIElement>(null);
  const [error, setError] = useState('');
  const save = () => {
    if (!root.current) return;
    const el = root.current;
    const next: OutlineItem = {
      ...item,
      judul: readText(el, 'judul'),
      waktu: readText(el, 'waktu'),
      inti: readText(el, 'inti'),
      belajar: item.belajar.map((_, j) => readText(el, `b${j}`)),
    };
    if (!next.judul || !next.inti || next.belajar.some((b) => !b)) { setError('Judul, inti, dan poin belajar tidak boleh kosong.'); return; }
    setError(''); onSave(next); setEditing(null);
  };
  return (
    <li className="sim-item" ref={root}>
      <div className="sim-item-top">
        <span className="sim-num">{index + 1}</span>
        <span className={`sim-badge sim-badge-${item.jenis}`}>{item.jenis === 'kondisi' ? 'Kondisi' : 'Kejadian acak'}</span>
        {isEditing ? <span className="sim-when"><Editable name="waktu" initial={item.waktu ?? ''} /></span> : item.waktu ? <span className="sim-when">{item.waktu}</span> : null}
        <strong className="sim-step-q">{isEditing ? <Editable name="judul" initial={item.judul} /> : item.judul}</strong>
        {editable ? <EditButtons editing={isEditing} saving={false} disabled={editing !== null} label={`skenario ${index + 1}`} onEdit={() => setEditing(key)} onSave={save} onCancel={() => { setEditing(null); setError(''); }} /> : null}
      </div>
      <p>{isEditing ? <Editable name="inti" initial={item.inti} multiline /> : item.inti}</p>
      {item.belajar.length ? (
        <div className="sim-learn">
          <span>Yang dipelajari siswa</span>
          <ul>{item.belajar.map((b, j) => <li key={j}>{isEditing ? <Editable name={`b${j}`} initial={b} multiline /> : b}</li>)}</ul>
        </div>
      ) : null}
      {children}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
    </li>
  );
}

export function OutlineView({ outline, editable, onSave, renderChoices }: { outline: Outline; editable?: boolean; onSave?: (next: Outline) => void; renderChoices?: (index: number) => ReactNode }) {
  const [editing, setEditing] = useState<string | null>(null);
  const head = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const canEdit = !!editable && !!onSave;
  const saveHead = () => {
    if (!head.current || !onSave) return;
    const next = { ...outline, judul: readText(head.current, 'judul'), tokoh: readText(head.current, 'tokoh'), rentang: readText(head.current, 'rentang') };
    if (!next.judul || !next.tokoh) { setError('Judul dan tokoh tidak boleh kosong.'); return; }
    setError(''); onSave(next); setEditing(null);
  };
  return (
    <div className="sim-outline">
      <div className="sim-outline-head" ref={head}>
        <div className="sim-bg-head">
          <strong>{editing === 'head' ? <Editable name="judul" initial={outline.judul} /> : outline.judul}</strong>
          {canEdit ? <EditButtons editing={editing === 'head'} saving={false} disabled={editing !== null} label="judul kerangka" onEdit={() => setEditing('head')} onSave={saveHead} onCancel={() => { setEditing(null); setError(''); }} /> : null}
        </div>
        <span>{editing === 'head' ? <Editable name="tokoh" initial={outline.tokoh} /> : outline.tokoh}</span>
        {outline.rentang || editing === 'head' ? <span>Rentang cerita: {editing === 'head' ? <Editable name="rentang" initial={outline.rentang ?? ''} /> : outline.rentang}</span> : null}
        {error ? <p className="field-error" role="alert">{error}</p> : null}
      </div>
      <ol>
        {outline.items.map((it, i) => (
          <OutlineItemView key={i} item={it} index={i} editable={canEdit} editing={editing} setEditing={setEditing}
            onSave={(next) => onSave?.({ ...outline, items: outline.items.map((x, j) => (j === i ? next : x)) })}>
            {renderChoices?.(i)}
          </OutlineItemView>
        ))}
      </ol>
      {outline.cakupan?.length ? (
        <div className="sim-coverage">
          <strong>Cakupan materi chapter</strong>
          <ul>{outline.cakupan.map((c) => <li key={c.materi}>{c.materi}: skenario {c.skenario.join(', ')}</li>)}</ul>
        </div>
      ) : null}
    </div>
  );
}

/** Latar cerita: teks dan angka awal bisa diedit langsung. */
function BackgroundItem({ quest, canEdit, editing, setEditing, reload, notify }: {
  quest: Quest; canEdit: boolean; editing: string | null; setEditing: (k: string | null) => void; reload: () => Promise<void>; notify: Notify;
}) {
  const bg = quest.background;
  const isEditing = editing === 'bg';
  const root = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    if (!root.current) return;
    setSaving(true); setError('');
    try {
      // Hanya kolom yang diubah yang dikirim, supaya data lama yang sudah melewati batas tidak ikut ditolak.
      const next = {
        role: readText(root.current, 'role'),
        story: readText(root.current, 'story'),
        cash: readNumber(root.current, 'cash', 'Saldo awal'),
        income: readNumber(root.current, 'income', 'Pemasukan'),
        cost: readNumber(root.current, 'cost', 'Pengeluaran'),
      };
      const patch = Object.fromEntries(Object.entries(next).filter(([k, v]) => v !== bg[k as keyof typeof next]));
      if (Object.keys(patch).length) {
        await questApi.saveBackground(quest.id, patch);
        await reload(); notify('Latar cerita disimpan.');
      }
      setEditing(null);
    } catch (e) { setError(messageOf(e)); } finally { setSaving(false); }
  };
  return (
    <div className="sim-preview-bg" ref={root}>
      <div className="sim-bg-head">
        <strong>Latar cerita</strong>
        {canEdit ? <EditButtons editing={isEditing} saving={saving} disabled={editing !== null} label="latar cerita" onEdit={() => setEditing('bg')} onSave={save} onCancel={() => { setEditing(null); setError(''); }} /> : null}
      </div>
      <p>{isEditing ? <Editable name="story" initial={bg.story} multiline /> : bg.story}</p>
      <p className="sim-meta">
        Peran: {isEditing ? <Editable name="role" initial={bg.role} multiline /> : bg.role}.
        {' '}Saldo awal Rp{isEditing ? <Editable name="cash" initial={String(bg.cash)} numeric /> : bg.cash.toLocaleString('id-ID')},
        {' '}pemasukan Rp{isEditing ? <Editable name="income" initial={String(bg.income)} numeric /> : bg.income.toLocaleString('id-ID')} per hari,
        {' '}pengeluaran Rp{isEditing ? <Editable name="cost" initial={String(bg.cost)} numeric /> : bg.cost.toLocaleString('id-ID')} per hari,
        {' '}target {rupiah(bg.goal)} (dihitung otomatis).
      </p>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}

/** Pilihan jawaban satu skenario, di dalam kartu kerangkanya: kepala baris bisa diklik untuk membuka atau melipat; ikon pensil membuat teksnya bisa diketik langsung. */
function StepChoices({ quest, step, index, sameText, canEdit, editing, setEditing, open, onToggle, reload, notify }: {
  quest: Quest; step: Step; index: number; sameText: boolean; canEdit: boolean; editing: string | null; setEditing: (k: string | null) => void;
  open: boolean; onToggle: () => void; reload: () => Promise<void>; notify: Notify;
}) {
  const key = `s${step.rowId}`;
  const isEditing = editing === key;
  const root = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    if (!root.current) return;
    setSaving(true); setError('');
    try {
      // Hanya bagian yang diubah yang dikirim.
      const el = root.current;
      const patch: { question?: string; story?: string; choices?: Partial<Step['choices'][number]>[] } = {};
      const question = readText(el, 'question');
      if (question !== step.question) patch.question = question;
      const story = readText(el, 'story');
      if (story !== step.story) patch.story = story;
      const choices = step.choices.map((c, i) => {
        const out: Partial<typeof c> = {};
        const label = readText(el, `label${i}`);
        if (label !== c.label) out.label = label;
        const consequence = readText(el, `cons${i}`);
        if (consequence !== c.consequence) out.consequence = consequence;
        const cash = readNumber(el, `cash${i}`, `Saldo pilihan ${i + 1}`);
        if (cash !== c.cash) out.cash = cash;
        const days = readNumber(el, `days${i}`, `Hari pilihan ${i + 1}`);
        if (days !== c.days) out.days = days;
        return out;
      });
      if (choices.some((o) => Object.keys(o).length)) patch.choices = choices;
      if (Object.keys(patch).length) {
        await questApi.saveScenario(quest.id, step.rowId, patch);
        await reload(); notify(`Skenario ${index + 1} disimpan.`);
      }
      setEditing(null);
    } catch (e) { setError(messageOf(e)); } finally { setSaving(false); }
  };
  const label = `skenario ${index + 1}`;
  return (
    <section className="sim-step-detail" ref={root}>
      <div className="sim-step-head">
        {/* Tombol selubung menutup seluruh kepala kartu supaya klik di mana pun membuka atau melipat; mati saat mengedit. */}
        {isEditing ? null : <button className="sim-step-toggle" type="button" onClick={onToggle} aria-expanded={open} aria-label={open ? `Tutup pilihan jawaban ${label}` : `Lihat pilihan jawaban ${label}`} />}
        <span className="sim-step-chevron" aria-hidden="true">{open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
        <span className="sim-step-q">Lihat pilihan jawaban</span>
        {canEdit ? <EditButtons editing={isEditing} saving={saving} disabled={editing !== null} label={label} onEdit={() => { setEditing(key); if (!open) onToggle(); }} onSave={save} onCancel={() => { setEditing(null); setError(''); }} /> : null}
      </div>
      {open ? (
        <div className="sim-step-body">
          {/* Kartu sudah menampilkan teks yang sama persis (kerangka dari skenario): tampil lagi hanya saat diedit. */}
          {isEditing || !sameText ? (
            <>
              <p>{isEditing ? <Editable name="story" initial={step.story} multiline /> : step.story}</p>
              <p><strong>{isEditing ? <Editable name="question" initial={step.question} /> : step.question}</strong></p>
            </>
          ) : null}
          <ul className="sim-choices">
            {step.choices.map((c, j) => (
              <li key={j}>
                <span className={`sim-badge sim-badge-${c.verdict}`}>{VERDICT[c.verdict]}</span>
                <div>
                  <strong>{isEditing ? <Editable name={`label${j}`} initial={c.label} /> : c.label}</strong>
                  <p>{isEditing ? <Editable name={`cons${j}`} initial={c.consequence} multiline /> : c.consequence}</p>
                  <small>
                    {isEditing
                      ? <>Saldo Rp<Editable name={`cash${j}`} initial={String(c.cash)} numeric />, <Editable name={`days${j}`} initial={String(c.days)} numeric /> hari berjalan</>
                      : <>Saldo {c.cash >= 0 ? '+' : '-'}{rupiah(Math.abs(c.cash))}, {c.days} hari berjalan</>}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
    </section>
  );
}

/** Kerangka bila tidak ada catatan kerangka (draft lama): disusun dari skenario simulasinya. */
const outlineOf = (quest: Quest): Outline => ({
  judul: quest.title,
  tokoh: quest.background.role,
  items: [...quest.conditions, ...quest.events].map((s) => ({ jenis: s.type === 'condition' ? 'kondisi' : 'kejadian', judul: s.question, inti: s.story, belajar: [] })),
});

/** Kerangka dan simulasi dalam satu tampilan: tiap kartu kerangka membawa pilihan jawaban skenarionya (tertutup di awal). */
function SimulasiView({ outline, done, classOptions, notify }: { outline: Outline | undefined; done: DoneInfo; classOptions: ClassOption[]; notify: Notify }) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const reload = async () => {
    const [q, mine] = await Promise.all([questApi.get(done.questId), questApi.mine()]);
    setQuest(q);
    setAssigned(mine.find((m) => m.id === done.questId)?.classIds ?? []);
  };
  useEffect(() => {
    let live = true;
    void Promise.all([questApi.get(done.questId), questApi.mine()]).then(([q, mine]) => {
      if (!live) return;
      setQuest(q);
      setAssigned(mine.find((m) => m.id === done.questId)?.classIds ?? []);
    });
    return () => { live = false; };
  }, [done.questId]);
  const toggle = (id: number) => setOpenIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const balanceOk = quest?.balance.ok ?? done.balanceOk;
  const warnings = quest?.balance.warnings ?? done.warnings;
  const canEdit = quest?.status === 'draft';
  const steps = quest ? [...quest.conditions, ...quest.events] : [];
  const allOpen = steps.length > 0 && steps.every((s) => openIds.has(s.rowId));
  // Kartu kerangka ke-i dipasangkan dengan skenario sejenis yang urutannya sama.
  const shown = quest ? (outline && outline.items.length === steps.length ? outline : outlineOf(quest)) : null;
  const stepAt = (i: number) => {
    if (!quest || !shown) return undefined;
    const jenis = shown.items[i].jenis;
    return (jenis === 'kondisi' ? quest.conditions : quest.events)[shown.items.slice(0, i).filter((x) => x.jenis === jenis).length];
  };
  return (
    <div className="sim-done">
      <div className="sim-done-head">
        <strong>{quest?.title ?? done.title}</strong>
        <span className={`sim-badge ${balanceOk ? 'sim-badge-ok' : 'sim-badge-warn'}`}>{balanceOk ? 'Seimbang' : 'Perlu diperbaiki'}</span>
        {quest && quest.status !== 'draft' ? <span className="sim-badge sim-badge-biasa">Terkirim</span> : null}
      </div>
      {warnings.length ? <ul className="quest-warnings">{warnings.map((w) => <li key={w}>{w}</li>)}</ul> : null}
      {quest ? <SendPanel quest={quest} classOptions={classOptions} assigned={assigned} onDone={reload} notify={notify} /> : <div className="skeleton sim-skeleton" aria-label="Memuat pengiriman" />}
      {quest && shown ? (
        <div className="sim-preview">
          <BackgroundItem quest={quest} canEdit={canEdit} editing={editing} setEditing={setEditing} reload={reload} notify={notify} />
          <div className="sim-toolbar">
            <button className="secondary-button" type="button" onClick={() => setOpenIds(allOpen ? new Set() : new Set(steps.map((s) => s.rowId)))}>
              {allOpen ? <ChevronsDownUp size={16} /> : <ChevronsUpDown size={16} />} {allOpen ? 'Tutup semua' : 'Buka semua'}
            </button>
          </div>
          <OutlineView outline={shown} renderChoices={(i) => {
            const step = stepAt(i);
            return step ? (
              <StepChoices quest={quest} step={step} index={i} sameText={shown.items[i].inti === step.story} canEdit={canEdit} editing={editing} setEditing={setEditing}
                open={openIds.has(step.rowId)} onToggle={() => toggle(step.rowId)} reload={reload} notify={notify} />
            ) : null;
          }} />
        </div>
      ) : <div className="skeleton sim-skeleton" aria-label="Memuat pratinjau" />}
      {quest && quest.status !== 'draft' ? <RefreshPanel quest={quest} onChanged={reload} notify={notify} /> : null}
    </div>
  );
}

export function SimPanel({ versions, picked, onPick, onEditOutline, done, classOptions, notify, onClose }: {
  versions: Outline[]; picked: number; onPick: (i: number) => void; onEditOutline: (outline: Outline) => void;
  done: DoneInfo | null; classOptions: ClassOption[]; notify: Notify; onClose: () => void;
}) {
  const isLatest = picked === versions.length - 1;
  return (
    <aside className="sim-panel" aria-label="Panel kerangka dan simulasi">
      <div className="sim-panel-head">
        {versions.length > 1 && !done ? (
          <div className="sim-tabs" role="tablist" aria-label="Versi kerangka">
            {versions.map((_, i) => <button className="sim-tab sim-tab-small" role="tab" type="button" key={i} aria-selected={picked === i} onClick={() => onPick(i)}>v{i + 1}</button>)}
          </div>
        ) : null}
        <button className="icon-button sim-panel-close" type="button" onClick={onClose} aria-label="Tutup panel"><X size={18} /></button>
      </div>
      <div className="sim-panel-body">
        {done ? <SimulasiView outline={versions[versions.length - 1]} done={done} classOptions={classOptions} notify={notify} />
          : versions[picked] ? <OutlineView key={picked} outline={versions[picked]} editable={isLatest} onSave={onEditOutline} />
          : <div className="skeleton sim-skeleton" aria-label="Menyusun kerangka" />}
      </div>
    </aside>
  );
}
