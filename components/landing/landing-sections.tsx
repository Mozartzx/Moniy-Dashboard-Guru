import { PiggyBank, Store, TrendingUp, Wallet } from 'lucide-react';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { APP_DOWNLOAD_URL } from './landing-config';
import { HeroSprites } from './hero-sprites';
import { HeroStage } from './hero-stage';

const topics = [
  { label: 'Manajemen keuangan pribadi', icon: Wallet },
  { label: 'Bisnis', icon: Store },
  { label: 'Investasi', icon: TrendingUp },
  { label: 'Simpan / Pinjam', icon: PiggyBank },
];

export function Hero() {
  return (
    <section className="lp-hero" id="lp-hero">
      <HeroStage layer={<HeroSprites />}>
        <div className="lp-hero-copy">
          <h1>Belajar keuangan lewat cerita yang kamu pilih sendiri</h1>
          <p>Ambil keputusan di tengah cerita, lalu lihat sendiri uangmu naik atau amblas.</p>
          <div className="lp-cta-stack">
            <a className="lp-btn lp-btn-primary" href={APP_DOWNLOAD_URL}>Unduh aplikasi</a>
            <BrowserNavigationLink className="lp-btn lp-btn-secondary" href="/login">Masuk sebagai guru</BrowserNavigationLink>
          </div>
        </div>
      </HeroStage>
      <ul className="lp-topics" aria-label="Topik yang bisa dipelajari">
        {topics.map(({ label, icon: Icon }) => (
          <li key={label}><Icon size={20} strokeWidth={2.2} aria-hidden="true" />{label}</li>
        ))}
      </ul>
    </section>
  );
}
