'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { errText, questApi, type Quest, type RefreshOverview } from '@/lib/moniy/quest-api';
import { EmptyState } from './page-primitives';

type Notify = (message: string, duration?: number) => void;

const rupiah = (value: number) => `Rp${value.toLocaleString('id-ID')}`;

export function RefreshPanel({ quest, onChanged, notify }: { quest: Quest; onChanged: () => Promise<void>; notify: Notify }) {
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
          <thead><tr><th>Siswa</th><th>Status</th><th>Hari refresh</th><th>Terakhir</th><th>Saldo</th></tr></thead>
          <tbody>{overview.students.map((s) => (
            <tr key={s.userId}><td><strong>{s.name}</strong></td><td>{s.started ? (s.phase ?? 'Berjalan') : 'Belum mulai'}</td><td>{s.refreshDays}</td><td>{s.lastRefreshDate ?? '-'}</td><td>{s.cash === null ? '-' : rupiah(s.cash)}</td></tr>
          ))}</tbody>
        </table>
      ) : <EmptyState title="Belum ada siswa" description="Siswa muncul di sini setelah bergabung ke kelas yang menerima simulasi ini." />}
    </section>
  );
}
