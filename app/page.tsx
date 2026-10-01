import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing/landing-header';
import { Features, GuruPanel, Hero, LandingFooter, MoreFeatures, ShieldBand } from '@/components/landing/landing-sections';
import { ScenarioWall } from '@/components/landing/scenario-wall';
import './landing.css';

export const metadata: Metadata = {
  title: 'Moniy | Belajar keuangan lewat cerita seru',
  description: 'Moniy mengajak siswa SMA belajar keuangan lewat cerita interaktif, simulasi bisnis, dan proteksi judi online. Guru memantau kelas lewat dashboard.',
};

export default function Home() {
  return (
    <div className="lp">
      <a className="lp-skip" href="#lp-main">Lewati ke konten</a>
      <LandingHeader />
      <main id="lp-main">
        <Hero />
        <ScenarioWall />
        <Features />
        <ShieldBand />
        <MoreFeatures />
        <GuruPanel />
      </main>
      <LandingFooter />
    </div>
  );
}
