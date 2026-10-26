'use client';

import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { errText, questApi, type Quest } from '@/lib/moniy/quest-api';
import { FeedbackDialog } from './quest-feedback-dialog';

type Notify = (message: string, duration?: number) => void;
type ClassOption = { value: string; label: string };

export function SendPanel({ quest, classOptions, assigned, onDone, notify }: { quest: Quest; classOptions: ClassOption[]; assigned: string[]; onDone: () => Promise<void>; notify: Notify }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(quest.refreshEnabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [askFeedback, setAskFeedback] = useState(false);
  const draft = quest.status === 'draft';
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const send = async () => {
    setBusy(true); setError('');
    try {
      if (draft) await questApi.publish(quest.id, picked, refresh); else await questApi.assign(quest.id, picked);
      setPicked([]);
      await onDone();
      notify(draft ? 'Simulasi dikirim ke kelas.' : 'Simulasi ditambahkan ke kelas.');
      // Ditanyakan sekali, saat pengiriman pertama (draft jadi terkirim).
      if (draft) setAskFeedback(true);
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  };

  return (
    <section className="surface-card module-form">
      <div className="section-heading-row"><div>
        <h2>{draft ? 'Kirim ke kelas' : 'Tambah ke kelas lain'}</h2>
        <p>Hanya siswa yang sudah bergabung di kelas terpilih yang melihat simulasi ini.{draft ? ' Setelah dikirim, isi simulasi tidak bisa diedit lagi.' : ''}</p>
      </div></div>
      <div className="quest-classes">
        {classOptions.map((c) => assigned.includes(c.value) ? (
          // Kelas yang sudah menerima simulasi ini: dicoret dan tidak bisa dipilih lagi.
          <label className="quest-class quest-class-done" key={c.value}><input type="checkbox" checked disabled /> <s>{c.label}</s> <small>sudah dikirim</small></label>
        ) : (
          <label className="quest-class" key={c.value}><input type="checkbox" checked={picked.includes(c.value)} onChange={() => toggle(c.value)} /> {c.label}</label>
        ))}
      </div>
      {draft ? (
        <label className="quest-class"><input type="checkbox" checked={refresh} onChange={(e) => setRefresh(e.target.checked)} /> Refreshment harian: AI melanjutkan cerita tiap hari untuk setiap siswa</label>
      ) : null}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <div className="module-form-actions">
        <button className="primary-button" type="button" onClick={send} disabled={busy || !picked.length || (draft && !quest.balance.ok)}>
          {busy ? <Loader2 size={18} className="module-spin" /> : <Send size={18} />} {draft ? 'Kirim Simulasi' : 'Tambahkan'}
        </button>
        {draft && !quest.balance.ok ? <small className="field-hint">Perbaiki peringatan keseimbangan dulu.</small> : null}
      </div>
      <FeedbackDialog questId={quest.id} open={askFeedback} onClose={() => setAskFeedback(false)} notify={notify} />
    </section>
  );
}
