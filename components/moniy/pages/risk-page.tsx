'use client';

import Image from 'next/image';
import { HandHeart, MessageCircleMore, Minus, TrendingDown, TrendingUp, UsersRound, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { ClassroomSnapshot } from '@/lib/moniy/types';
import { EmptyState } from './page-primitives';

// Maskot tenang saat tidak ada kejadian, maskot waspada hanya saat ada kejadian pada periode ini.
const BANNER_AMAN = '/assets/banner-peringatan-aman.webp';
const BANNER_WASPADA = '/assets/banner-peringatan-judol.webp';

const GUIDE_STEPS = [
  { title: 'Siapkan kelas', body: 'Pilih waktu 15 menit di akhir pertemuan. Jelaskan bahwa pembahasan ini untuk seluruh kelas dan tidak mencari siapa pun yang terlibat.' },
  { title: 'Buka dengan cerita, bukan tuduhan', body: 'Mulai dari contoh iklan atau ajakan untung cepat yang sering muncul di media sosial. Minta siswa menyebut tanda-tanda yang membuatnya mencurigakan.' },
  { title: 'Ajak siswa menghitung dampaknya', body: 'Tanyakan apa yang terjadi pada saldo kalau uang jajan atau tabungan dipakai untuk mengejar untung cepat. Hubungkan dengan hasil simulasi keuangan di kelas.' },
  { title: 'Tutup dengan langkah kecil', body: 'Sepakati satu kebiasaan bersama, misalnya menutup iklan yang menjanjikan untung cepat dan bercerita ke guru atau orang tua bila ada ajakan bermain.' },
];

const GUIDE_QUESTIONS = [
  'Apa yang membuat tawaran untung cepat terasa meyakinkan?',
  'Siapa yang sebenarnya untung dari permainan seperti ini?',
  'Kalau teman mengajak, apa yang bisa kamu katakan tanpa membuatnya merasa dihakimi?',
];

const GUIDE_AVOID = [
  'Meminta siswa mengaku atau menunjuk teman yang pernah bermain.',
  'Mencocokkan kejadian di halaman ini dengan nama siswa, karena data ini sengaja anonim dan agregat.',
  'Memberi hukuman kelas. Pendekatan yang aman adalah edukasi dan pendampingan.',
];

export function RiskPage({ snapshot }: { snapshot: ClassroomSnapshot }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const isImproving = snapshot.riskDelta < 0;
  const max = Math.max(...snapshot.riskTrend.map((item) => item.events), 1);
  const hasEvents = snapshot.riskEventCount > 0;

  return (
    <div className="page-stack">
      <section className="risk-hero">
        <div className="risk-hero-visual">
          <Image className="risk-hero-image" src={hasEvents ? BANNER_WASPADA : BANNER_AMAN} alt={hasEvents ? 'Maskot MONIY waspada terhadap tautan berbahaya' : 'Maskot MONIY bersantai karena transaksi aman'} fill sizes="(max-width: 900px) 100vw, 52vw" priority />
        </div>
        <div className="risk-hero-copy">
          <span className="page-kicker">Agregat anonim</span><h1>Peringatan judi online</h1><p>Sinyal preventif tingkat kelas untuk membantu pembinaan kolektif bersama guru BK.</p>
          <div className="risk-summary-line"><span className={`risk-level risk-${snapshot.riskLevel.toLowerCase()}`}>{snapshot.riskEventCount}</span><span>{snapshot.riskDelta === 0 ? <><Minus size={18} /> Sama dengan periode lalu</> : <>{isImproving ? <TrendingDown size={18} /> : <TrendingUp size={18} />} {isImproving ? 'Turun' : 'Naik'} {Math.abs(snapshot.riskDelta)}% dari periode lalu</>}</span></div>
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
          <button className="primary-button" type="button" onClick={() => setGuideOpen(true)}>Buka panduan pembinaan</button>
        </article>
      </section>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="detail-modal guide-modal" showCloseButton={false}>
          <button className="modal-close" type="button" onClick={() => setGuideOpen(false)} aria-label="Tutup"><X size={20} /></button>
          <span className="page-kicker">Panduan pembinaan</span>
          <DialogTitle>Refleksi kelas tentang judi online</DialogTitle>
          <DialogDescription>{hasEvents ? `Ada ${snapshot.riskEventCount} kejadian anonim pada periode ini. Gunakan langkah berikut untuk pembinaan seluruh kelas.` : 'Belum ada kejadian pada periode ini. Panduan ini tetap bisa dipakai sebagai pencegahan.'}</DialogDescription>
          <div className="guide-body">
            <h3>Langkah pembinaan</h3>
            <ol className="guide-steps">{GUIDE_STEPS.map((step, index) => <li key={step.title}><span>{index + 1}</span><p><strong>{step.title}</strong>{step.body}</p></li>)}</ol>
            <h3>Pertanyaan pemantik</h3>
            <ul className="guide-list">{GUIDE_QUESTIONS.map((question) => <li key={question}>{question}</li>)}</ul>
            <h3>Koordinasi dengan guru BK</h3>
            <p>Sampaikan ringkasan agregat kelas ini, bukan nama siswa. Minta BK menyiapkan sesi bimbingan klasikal dan saluran konsultasi sukarela bagi siswa yang ingin bercerita.</p>
            <h3>Yang sebaiknya dihindari</h3>
            <ul className="guide-list">{GUIDE_AVOID.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="guide-actions"><button className="primary-button" type="button" onClick={() => setGuideOpen(false)}>Mengerti</button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
