import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { LandingHeader } from '@/components/landing/landing-header';
import { Features, GuruPanel, Hero, LandingFooter, MoreFeatures, ShieldBand } from '@/components/landing/landing-sections';
import './landing.css';

const nunito = Nunito({ variable: '--font-nunito', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Moniy | Belajar keuangan lewat cerita seru',
  description: 'Moniy mengajak siswa SMA belajar keuangan lewat cerita interaktif, simulasi bisnis, dan proteksi judi online. Guru memantau kelas lewat dashboard.',
};

export default function Home() {
  return (
    <div className={`lp ${nunito.variable}`}>
      <a className="lp-skip" href="#lp-main">Lewati ke konten</a>
      <LandingHeader />
      <main id="lp-main">
        <Hero />
        <Features />
        <ShieldBand />
        <MoreFeatures />
        <GuruPanel />
      </main>
      <LandingFooter />
    </div>
  );
}
