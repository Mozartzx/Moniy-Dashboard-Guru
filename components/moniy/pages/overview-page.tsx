'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  ChevronRight,
  GraduationCap,
  HandHeart,
  Lightbulb,
  ShieldQuestion,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { ClassroomSnapshot } from '@/lib/moniy/types';
import { EmptyState } from './page-primitives';

export function OverviewPage({ snapshot }: { snapshot: ClassroomSnapshot }) {
  const pendingPosts = snapshot.communityPosts.filter((post) => !post.reviewed).slice(0, 2);
  const weakTopic = [...snapshot.topics].sort((a, b) => a.correctRate - b.correctRate)[0];
  const metrics = [
    { label: 'Nilai rata-rata', value: snapshot.averageScore.toFixed(1), helper: '+3,2 dari bulan lalu', icon: GraduationCap, tone: 'blue' },
    { label: 'Modul selesai', value: `${snapshot.completionRate}%`, helper: `${Math.round(snapshot.studentCount * snapshot.completionRate / 100)} dari ${snapshot.studentCount} siswa`, icon: BookOpenCheck, tone: 'cyan' },
    { label: 'Perlu penguatan', value: String(snapshot.supportCount), helper: 'Berdasarkan progres belajar', icon: HandHeart, tone: 'orange' },
    { label: 'Kerentanan kelas', value: snapshot.riskLevel, helper: `${snapshot.riskEventCount} kejadian anonim`, icon: ShieldQuestion, tone: snapshot.riskLevel === 'Rendah' ? 'green' : 'orange' },
  ];

  return (
    <div className="page-stack">
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="page-kicker">Ringkasan hari ini</span>
          <h1>Selamat datang, Bu Rani!</h1>
          <p><strong>{snapshot.className}</strong> sedang bertumbuh. Ada {snapshot.supportCount} siswa yang mungkin membutuhkan penguatan belajar.</p>
          <Link className="welcome-action" href="/dashboard/progres-belajar">Lihat progres kelas <ArrowRight size={18} /></Link>
        </div>
        <Image className="welcome-mascot" src="/assets/moniy-mascot-face.png" alt="Maskot MONIY" width={220} height={220} priority />
      </section>

      <section className="metric-grid" aria-label="Metrik kelas">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return <article className={`metric-card metric-${metric.tone}`} key={metric.label}><span className="metric-icon"><Icon size={23} /></span><div><p>{metric.label}</p><strong>{metric.value}</strong><span>{metric.helper}</span></div></article>;
        })}
      </section>

      <section className="overview-grid">
        <article className="surface-card topic-overview-card">
          <div className="section-heading-row"><div><h2>Progres per topik</h2><p>Lihat tingkat penyelesaian dan penguasaan kelas.</p></div><Link className="text-action" href="/dashboard/progres-belajar">Buka detail <ChevronRight size={17} /></Link></div>
          {snapshot.topics.length ? <div className="topic-progress-list">{snapshot.topics.map((topic) => <div className="topic-progress-row" key={topic.id}><div className="topic-progress-meta"><div><strong>{topic.name}</strong><span>{topic.completed} siswa selesai</span></div><b>{topic.correctRate}% benar</b></div><div className="thin-progress" aria-label={`${topic.correctRate}% keputusan benar`}><span style={{ width: `${topic.correctRate}%` }} /></div></div>)}</div> : <EmptyState title="Belum ada progres" description="Data topik akan muncul setelah siswa memulai modul." />}
        </article>

        <article className="surface-card insight-card">
          <div className="insight-topline"><span className="insight-icon"><BrainCircuit size={23} /></span><span className="ai-label"><Sparkles size={14} /> Dibantu AI</span></div>
          <h2>Pola pemahaman kelas</h2><p>{snapshot.insight}</p>
          {weakTopic ? <div className="insight-focus"><Lightbulb size={18} /><span><strong>Fokus berikutnya:</strong> {weakTopic.commonMistake}.</span></div> : null}
          <Link className="secondary-button" href="/dashboard/progres-belajar">Lihat saran tindak lanjut</Link>
          <small>Rekomendasi ini membantu guru. Keputusan pembelajaran tetap ditentukan oleh guru.</small>
        </article>
      </section>

      <section className="overview-grid lower-overview-grid">
        <article className="surface-card compact-card">
          <div className="section-heading-row"><div><h2>Sinyal perlindungan kelas</h2><p>Agregat anonim untuk pembinaan kolektif.</p></div><span className={`risk-level risk-${snapshot.riskLevel.toLowerCase()}`}>{snapshot.riskLevel}</span></div>
          <div className="risk-mini-row"><span className="solid-icon orange"><ShieldCheck size={22} /></span><div><strong>{snapshot.riskEventCount} kejadian terdeteksi</strong><span>{snapshot.riskDelta > 0 ? 'Meningkat' : 'Menurun'} {Math.abs(snapshot.riskDelta)}% dari periode lalu</span></div></div>
          <Link className="text-action" href="/dashboard/peringatan-judi">Buka peringatan kelas <ArrowRight size={17} /></Link>
        </article>

        <article className="surface-card compact-card">
          <div className="section-heading-row"><div><h2>Perlu ditinjau</h2><p>Hasil Simulasi Bisnis terbaru.</p></div><Link className="text-action" href="/dashboard/komunitas-kelas">Lihat semua</Link></div>
          {pendingPosts.length ? pendingPosts.map((post) => <Link className="community-mini-row" href="/dashboard/komunitas-kelas" key={post.id}><span className="student-avatar">{post.initials}</span><span><strong>{post.title}</strong><small>{post.studentName}, {post.submittedAt}</small></span><ChevronRight size={17} /></Link>) : <EmptyState title="Semua sudah ditinjau" description="Tidak ada postingan yang menunggu." />}
        </article>
      </section>
    </div>
  );
}
