'use client';

import Image from 'next/image';
import { HandHeart, MessageCircleMore, Minus, TrendingDown, TrendingUp, UsersRound } from 'lucide-react';
import type { ClassroomSnapshot } from '@/lib/moniy/types';
import { useDashboardContext } from '@/components/moniy/dashboard/dashboard-context';
import { EmptyState } from './page-primitives';

export function RiskPage({ snapshot }: { snapshot: ClassroomSnapshot }) {
  const { notify } = useDashboardContext();
  const isImproving = snapshot.riskDelta < 0;
  const max = Math.max(...snapshot.riskTrend.map((item) => item.events), 1);

  return (
    <div className="page-stack">
      <section className="risk-hero">
        <div className="risk-hero-visual">
          <Image className="risk-hero-image" src={isImproving ? '/assets/moniy-risk-safe.png' : '/assets/moniy-risk-alert.png'} alt="Maskot MONIY mendampingi keamanan finansial digital" fill sizes="(max-width: 900px) 100vw, 52vw" priority />
        </div>
        <div className="risk-hero-copy">
          <span className="page-kicker">Agregat anonim</span><h1>Peringatan judi online</h1><p>Sinyal preventif tingkat kelas untuk membantu pembinaan kolektif bersama guru BK.</p>
          <div className="risk-summary-line"><span className={`risk-level risk-${snapshot.riskLevel.toLowerCase()}`}>{snapshot.riskLevel}</span><span>{snapshot.riskDelta === 0 ? <><Minus size={18} /> Sama dengan periode lalu</> : <>{isImproving ? <TrendingDown size={18} /> : <TrendingUp size={18} />} {isImproving ? 'Turun' : 'Naik'} {Math.abs(snapshot.riskDelta)}% dari periode lalu</>}</span></div>
        </div>
      </section>

      <section className="risk-grid">
        <article className="surface-card trend-card">
          <div className="section-heading-row"><div><h2>Tren kejadian anonim</h2><p>Jumlah deteksi agregat, bukan jumlah siswa.</p></div><strong className="event-total">{snapshot.riskEventCount}<span>kejadian</span></strong></div>
          {snapshot.riskTrend.length ? <div className="bar-chart" aria-label="Grafik kejadian anonim tujuh hari">{snapshot.riskTrend.map((item) => <div className="bar-column" key={item.label}><span>{item.events}</span><div><i style={{ height: `${Math.max(12, item.events / max * 100)}%` }} /></div><small>{item.label}</small></div>)}</div> : <EmptyState title="Belum ada tren" description="Data agregat akan tampil saat tersedia." />}
        </article>
        <article className="surface-card coaching-card">
          <span className="card-icon blue"><UsersRound size={23} /></span><h2>Tindak lanjut yang disarankan</h2><p>Fokuskan respons pada edukasi kelas, bukan pemeriksaan individu.</p>
          <div className="coaching-list"><div><span className="solid-icon blue"><MessageCircleMore size={18} /></span><span><strong>Refleksi kelas 15 menit</strong>Bahas ciri tawaran untung cepat dan dampaknya.</span></div><div><span className="solid-icon blue"><HandHeart size={18} /></span><span><strong>Koordinasi dengan guru BK</strong>Gunakan pendekatan preventif untuk seluruh kelas.</span></div></div>
          <button className="primary-button" type="button" onClick={() => notify('Panduan pembinaan belum tersedia.')}>Buka panduan pembinaan</button>
        </article>
      </section>

    </div>
  );
}
