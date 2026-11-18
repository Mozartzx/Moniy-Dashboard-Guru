'use client';

import { Lightbulb, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { errText, fetchLearningInsight } from '@/lib/moniy/quest-api';
import type { LearningInsight } from '@/lib/moniy/types';

const cacheKey = (classId: string) => `moniy.insight.${classId}`;

function readCache(classId: string): LearningInsight | null {
  try {
    const raw = window.sessionStorage.getItem(cacheKey(classId));
    return raw ? (JSON.parse(raw) as LearningInsight) : null;
  } catch { return null; }
}

/** Insight Pembelajaran (Contextual Prompting): pola keputusan, refleksi, dan kesimpulan kelas dirangkum Gemini. */
export function LearningInsightCard({ classId }: { classId: string }) {
  const [insight, setInsight] = useState<LearningInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh: boolean) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLearningInsight(classId, refresh);
      setInsight(data);
      try { window.sessionStorage.setItem(cacheKey(classId), JSON.stringify(data)); } catch { /* sessionStorage boleh gagal */ }
    } catch (err) {
      setError(errText(err));
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    const cached = readCache(classId);
    // Muat dari penyimpanan sesi bila ada; selainnya minta ke server (server menyimpan hasil 10 menit).
    const timer = window.setTimeout(() => { if (cached) { setInsight(cached); setLoading(false); } else void load(false); }, 0);
    return () => window.clearTimeout(timer);
  }, [classId, load]);

  const basis = insight?.basis;
  return (
    <article className="surface-card insight-card">
      <div className="section-heading-row">
        <div><h2><Sparkles size={20} aria-hidden="true" /> Insight pembelajaran</h2><p>Gambaran pemahaman kelas dari keputusan, refleksi, dan kesimpulan siswa.</p></div>
        <button className="secondary-button" type="button" onClick={() => void load(true)} disabled={loading}>{loading ? <Loader2 size={16} className="module-spin" /> : <RefreshCw size={16} />} {insight ? 'Perbarui' : 'Buat insight'}</button>
      </div>

      {loading && !insight ? <div className="insight-loading" aria-live="polite"><Loader2 size={20} className="module-spin" /> Moniy sedang membaca keputusan dan refleksi kelas...</div> : null}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      {insight && !insight.available ? <p className="topic-empty">{insight.message ?? 'Insight belum tersedia untuk kelas ini.'}</p> : null}

      {insight?.available ? <div className="insight-body">
        {insight.summary ? <p className="insight-summary">{insight.summary}</p> : null}
        <div className="insight-columns">
          <section>
            <h3>Temuan</h3>
            <ul className="insight-list">{(insight.findings ?? []).map((item) => <li key={item.title}><strong>{item.title}</strong><span>{item.detail}</span></li>)}</ul>
          </section>
          <section>
            <h3><Lightbulb size={16} aria-hidden="true" /> Tindak lanjut</h3>
            <ol className="insight-list insight-actions">{(insight.actions ?? []).map((item, index) => <li key={item.title}><span className="insight-step">{index + 1}</span><div><strong>{item.title}</strong><span>{item.detail}</span></div></li>)}</ol>
          </section>
        </div>
        {basis ? <small className="insight-basis">Dasar: {basis.decisions} keputusan, {basis.reflections} refleksi, {basis.conclusions} kesimpulan dari {basis.students} siswa. Tanpa nama siswa dan tanpa data Perisai Judi.</small> : null}
      </div> : null}
    </article>
  );
}
