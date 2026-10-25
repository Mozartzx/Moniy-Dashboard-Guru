'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { questApi, type Outline, type Quest } from '@/lib/moniy/quest-api';
import { SendPanel } from './quest-send-panel';

type Notify = (message: string, duration?: number) => void;
type ClassOption = { value: string; label: string };
export type DoneInfo = { questId: number; title: string; balanceOk: boolean; warnings: string[] };

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;
const VERDICT = { cerdas: 'Cerdas', biasa: 'Biasa', buruk: 'Buruk' } as const;

export function OutlineView({ outline }: { outline: Outline }) {
  return (
    <div className="sim-outline">
      <div className="sim-outline-head">
        <strong>{outline.judul}</strong>
        <span>{outline.tokoh}</span>
        {outline.rentang ? <span>Rentang cerita: {outline.rentang}</span> : null}
      </div>
      <ol>
        {outline.items.map((it, i) => (
          <li className="sim-item" key={i}>
            <div className="sim-item-top">
              <span className="sim-num">{i + 1}</span>
              <span className={`sim-badge sim-badge-${it.jenis}`}>{it.jenis === 'kondisi' ? 'Kondisi' : 'Kejadian acak'}</span>
              {it.waktu ? <span className="sim-when">{it.waktu}</span> : null}
              <strong>{it.judul}</strong>
            </div>
            <p>{it.inti}</p>
            <div className="sim-learn">
              <span>Yang dipelajari siswa</span>
              <ul>{it.belajar.map((b, j) => <li key={j}>{b}</li>)}</ul>
            </div>
          </li>
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

/** Pratinjau baca-saja: latar, tiap skenario (bisa dilipat), dan pilihan beserta dampaknya. */
function QuestPreview({ quest }: { quest: Quest }) {
  const steps = [...quest.conditions, ...quest.events];
  const bg = quest.background;
  return (
    <div className="sim-preview">
      <div className="sim-preview-bg">
        <strong>Latar cerita</strong>
        <p>{bg.story}</p>
        <p className="sim-meta">
          Peran: {bg.role}. Saldo awal {rupiah(bg.cash)}, pemasukan {rupiah(bg.income)} per hari, pengeluaran {rupiah(bg.cost)} per hari, target {rupiah(bg.goal)}.
        </p>
      </div>
      {steps.map((s, i) => (
        <details className="sim-step-detail" key={s.rowId}>
          <summary>
            <span className="sim-num">{i + 1}</span>
            <span className={`sim-badge sim-badge-${s.type === 'condition' ? 'kondisi' : 'kejadian'}`}>{s.type === 'condition' ? 'Kondisi' : 'Kejadian acak'}</span>
            <span className="sim-step-q">{s.question}</span>
          </summary>
          <p>{s.story}</p>
          <ul className="sim-choices">
            {s.choices.map((c, j) => (
              <li key={j}>
                <span className={`sim-badge sim-badge-${c.verdict}`}>{VERDICT[c.verdict]}</span>
                <div>
                  <strong>{c.label}</strong>
                  <p>{c.consequence}</p>
                  <small>Saldo {c.cash >= 0 ? '+' : '-'}{rupiah(Math.abs(c.cash))}, {c.days} hari berjalan</small>
                </div>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

function SimulasiView({ done, classOptions, notify, onOpen }: { done: DoneInfo; classOptions: ClassOption[]; notify: Notify; onOpen: (id: number) => void }) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const reload = useCallback(async () => { setQuest(await questApi.get(done.questId)); }, [done.questId]);
  useEffect(() => {
    let live = true;
    void questApi.get(done.questId).then((q) => { if (live) setQuest(q); });
    return () => { live = false; };
  }, [done.questId]);
  return (
    <div className="sim-done">
      <div className="sim-done-head">
        <strong>{done.title}</strong>
        <span className={`sim-badge ${done.balanceOk ? 'sim-badge-ok' : 'sim-badge-warn'}`}>{done.balanceOk ? 'Seimbang' : 'Perlu diperbaiki'}</span>
      </div>
      {done.warnings.length ? <ul className="quest-warnings">{done.warnings.map((w) => <li key={w}>{w}</li>)}</ul> : null}
      {quest ? <SendPanel quest={quest} classOptions={classOptions} onDone={reload} notify={notify} /> : <div className="skeleton sim-skeleton" aria-label="Memuat pengiriman" />}
      {quest ? <QuestPreview quest={quest} /> : <div className="skeleton sim-skeleton" aria-label="Memuat pratinjau" />}
      <div><button className="secondary-button" type="button" onClick={() => onOpen(done.questId)}>Buka detail dan edit manual</button></div>
    </div>
  );
}

export function SimPanel({ versions, picked, onPick, view, onView, done, classOptions, notify, onOpen, onClose }: {
  versions: Outline[]; picked: number; onPick: (i: number) => void; view: 'kerangka' | 'simulasi'; onView: (v: 'kerangka' | 'simulasi') => void;
  done: DoneInfo | null; classOptions: ClassOption[]; notify: Notify; onOpen: (id: number) => void; onClose: () => void;
}) {
  return (
    <aside className="sim-panel" aria-label="Panel kerangka dan simulasi">
      <div className="sim-panel-head">
        <div className="sim-tabs" role="tablist">
          <button className="sim-tab" role="tab" type="button" aria-selected={view === 'kerangka'} onClick={() => onView('kerangka')}>Kerangka</button>
          <button className="sim-tab" role="tab" type="button" aria-selected={view === 'simulasi'} disabled={!done} onClick={() => onView('simulasi')}>Simulasi</button>
        </div>
        {view === 'kerangka' && versions.length > 1 ? (
          <div className="sim-tabs" role="tablist" aria-label="Versi kerangka">
            {versions.map((_, i) => <button className="sim-tab sim-tab-small" role="tab" type="button" key={i} aria-selected={picked === i} onClick={() => onPick(i)}>v{i + 1}</button>)}
          </div>
        ) : null}
        <button className="icon-button sim-panel-close" type="button" onClick={onClose} aria-label="Tutup panel"><X size={18} /></button>
      </div>
      <div className="sim-panel-body">
        {view === 'simulasi' && done ? <SimulasiView done={done} classOptions={classOptions} notify={notify} onOpen={onOpen} />
          : versions[picked] ? <OutlineView outline={versions[picked]} /> : <div className="skeleton sim-skeleton" aria-label="Menyusun kerangka" />}
      </div>
    </aside>
  );
}
