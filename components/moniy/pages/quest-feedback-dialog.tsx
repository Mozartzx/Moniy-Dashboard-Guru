'use client';

import { Loader2, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { errText, questApi, type FeedbackAspect } from '@/lib/moniy/quest-api';

const ASPECTS: { value: FeedbackAspect; label: string }[] = [
  { value: 'angka', label: 'Angka dan hitungan' },
  { value: 'realistis', label: 'Kasus realistis' },
  { value: 'level', label: 'Sesuai level siswa' },
  { value: 'tujuan', label: 'Sesuai tujuan belajar' },
  { value: 'soal', label: 'Soal dan pilihan jawaban' },
  { value: 'bahasa', label: 'Bahasa' },
];

/** Muncul sekali setelah simulasi dikirim ke kelas. Hanya penilaian yang wajib; sisanya boleh dilewati. */
export function FeedbackDialog({ questId, open, onClose, notify }: { questId: number; open: boolean; onClose: () => void; notify: (message: string) => void }) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [aspects, setAspects] = useState<FeedbackAspect[]>([]);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Chip maksimal dua: memilih yang ketiga menggeser yang tertua.
  const toggle = (a: FeedbackAspect) => setAspects((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a].slice(-2)));

  const submit = async () => {
    if (!rating) return;
    setBusy(true); setError('');
    try {
      await questApi.feedback(questId, { rating, aspects, comment: comment.trim() || undefined });
      notify('Terima kasih, masukanmu tersimpan.');
      onClose();
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="detail-modal" showCloseButton={false}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Tutup"><X size={20} /></button>
        <DialogTitle>Bagaimana simulasi ini?</DialogTitle>
        <DialogDescription className="modal-lead">Masukanmu dipakai untuk memperbaiki simulasi yang disusun Moniy berikutnya.</DialogDescription>
        <div className="feedback-rate">
          <button className={rating === 'up' ? 'primary-button' : 'secondary-button'} type="button" aria-pressed={rating === 'up'} onClick={() => setRating('up')}><ThumbsUp size={18} /> Sesuai</button>
          <button className={rating === 'down' ? 'primary-button' : 'secondary-button'} type="button" aria-pressed={rating === 'down'} onClick={() => setRating('down')}><ThumbsDown size={18} /> Kurang sesuai</button>
        </div>
        {rating ? (
          <>
            <div className="modal-section">
              <h3>{rating === 'up' ? 'Apa yang paling bagus? (pilih maksimal 2)' : 'Apa yang kurang? (pilih maksimal 2)'}</h3>
              <div className="feedback-chips">
                {ASPECTS.map((a) => (
                  <button key={a.value} className={`feedback-chip ${aspects.includes(a.value) ? 'feedback-chip-on' : ''}`} type="button" aria-pressed={aspects.includes(a.value)} onClick={() => toggle(a.value)}>{a.label}</button>
                ))}
              </div>
            </div>
            <div className="modal-section">
              <h3>Ada yang ingin disampaikan? (opsional)</h3>
              <textarea rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
          </>
        ) : null}
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Lewati</button>
          <button className="primary-button" type="button" onClick={submit} disabled={!rating || busy}>
            {busy ? <Loader2 size={18} className="module-spin" /> : null} Kirim masukan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
