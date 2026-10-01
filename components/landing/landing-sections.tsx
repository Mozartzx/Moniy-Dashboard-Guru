import Image from 'next/image';
import { BarChart3, FileSpreadsheet, PiggyBank, ShieldCheck, Store, TrendingUp, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { APP_DOWNLOAD_URL } from './landing-config';
import { HeroSprites } from './hero-sprites';
import { HeroStage } from './hero-stage';
import { Reveal } from './reveal';
import { ShieldDemo } from './shield-demo';
import { StoryScroll } from './story-scroll';

const topics = [
  { label: 'Manajemen keuangan pribadi', icon: Wallet },
  { label: 'Bisnis', icon: Store },
  { label: 'Investasi', icon: TrendingUp },
  { label: 'Simpan / Pinjam', icon: PiggyBank },
];

function Phone({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="lp-phone">
      <div className="lp-phone-screen">
        <Image src={src} alt={alt} width={780} height={1688} sizes="(max-width: 860px) 72vw, 300px" className="lp-screen" data-active="true" />
      </div>
    </div>
  );
}

function Feature({ title, children, media, flip = false }: { title: string; children: ReactNode; media: ReactNode; flip?: boolean }) {
  return (
    <section className="lp-feature">
      <div className="lp-wrap lp-feature-grid" data-flip={flip}>
        <Reveal className="lp-feature-copy"><h2>{title}</h2><p>{children}</p></Reveal>
        <Reveal className="lp-feature-media" delay={120}>{media}</Reveal>
      </div>
    </section>
  );
}

export function Hero() {
  return (
    <section className="lp-hero" id="lp-hero">
      <HeroStage layer={<HeroSprites />}>
        <div className="lp-hero-copy">
          <h1>Belajar keuangan lewat cerita yang kamu pilih sendiri</h1>
          <p>Kamu mengambil keputusan di tengah cerita, lalu melihat apa yang terjadi karenanya.</p>
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

export function Features() {
  return (
    <>
      <StoryScroll />
      <Feature flip title="Julukan di akhir cerita" media={<Phone src="/landing/screens/ending.webp" alt="Layar akhir cerita Moniy: lencana Kancil Cerdik sebagai pencapaian dan tombol kembali ke beranda." />}>
        Tiap cerita ditutup dengan julukan, misalnya Kancil Cerdik, sesuai keputusanmu. Kalau hasilnya kurang bagus, kamu bisa mengulang ceritanya.
      </Feature>
    </>
  );
}

export function ShieldBand() {
  return (
    <section className="lp-band">
      <div className="lp-wrap lp-band-inner">
        <Reveal className="lp-feature-copy lp-band-copy">
          <h2>Nyalakan Perisai untuk memblokir situs judol</h2>
          <p>Saat Perisai aktif, Moniy memblokir situs judi online di ponselmu. Guru hanya melihat angka gabungan satu kelas, nama siswa tidak pernah muncul.</p>
        </Reveal>
        <Reveal className="lp-band-demo" delay={120}><ShieldDemo /></Reveal>
      </div>
    </section>
  );
}

export function MoreFeatures() {
  return (
    <>
      <Feature title="Buat cerita sendiri dengan Moniy AI" media={<Phone src="/landing/screens/materi.webp" alt="Layar materi Moniy: cara menghitung laba kotor dengan papan tulis dan rumus." />}>
        Ketik cerita yang kamu inginkan dan Moniy AI menyusunnya menjadi modul. Ada juga materi singkat, misalnya cara menghitung laba kotor.
      </Feature>
      <Feature flip title="Belajar rutin dengan streak mingguan" media={<Phone src="/landing/screens/beranda.webp" alt="Beranda Moniy: streak pembelajaran mingguan dan tombol lanjutkan modul terakhir." />}>
        Streak mingguan mencatat seberapa rutin kamu belajar. Modul terakhir bisa dilanjutkan dengan satu ketukan.
      </Feature>
    </>
  );
}

const guruPoints = [
  { icon: BarChart3, title: 'Progres per topik', text: 'Lihat topik yang sudah dikuasai dan yang masih perlu diulang.' },
  { icon: ShieldCheck, title: 'Sinyal judol per kelas', text: 'Angka gabungan satu kelas. Nama siswa tidak ikut tercatat.' },
  { icon: FileSpreadsheet, title: 'Laporan Excel', text: 'Unduh rekap kelas dalam satu klik.' },
];

export function GuruPanel() {
  return (
    <section className="lp-guru">
      <div className="lp-wrap">
        <Reveal className="lp-guru-panel">
          <div className="lp-guru-top">
            <Image src="/landing/guru-banner.webp" alt="Maskot Moniy duduk di meja, tenang karena proteksi judol aktif" width={1400} height={764} sizes="(max-width: 860px) 92vw, 640px" className="lp-guru-banner" />
            <div className="lp-guru-intro">
              <h2>Dashboard untuk guru</h2>
              <p>Dashboard menampilkan progres belajar dan sinyal judol per kelas. Identitas siswa tidak ditampilkan.</p>
            </div>
          </div>
          <div className="lp-guru-body">
            <ul className="lp-points">
              {guruPoints.map(({ icon: Icon, title, text }) => (
                <li key={title}><span className="lp-point-icon"><Icon size={24} strokeWidth={2.2} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></li>
              ))}
            </ul>
            <div className="lp-cta-row">
              <BrowserNavigationLink className="lp-btn lp-btn-primary" href="/login">Masuk sebagai guru</BrowserNavigationLink>
              <BrowserNavigationLink className="lp-btn lp-btn-secondary" href="/register">Daftar sebagai guru</BrowserNavigationLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="lp-footer" id="unduh">
      <div className="lp-wrap lp-footer-grid">
        <div className="lp-footer-brand">
          <Image src="/landing/app-icon.webp" alt="" width={192} height={192} />
          <span>Moniy</span>
        </div>
        <nav aria-label="Untuk siswa"><h3>Untuk siswa</h3><a href={APP_DOWNLOAD_URL}>Unduh aplikasi</a></nav>
        <nav aria-label="Untuk guru"><h3>Untuk guru</h3><BrowserNavigationLink href="/login">Masuk sebagai guru</BrowserNavigationLink><BrowserNavigationLink href="/register">Daftar sebagai guru</BrowserNavigationLink></nav>
      </div>
      <p className="lp-wrap lp-footer-note">Moniy 2026. Aplikasi belajar keuangan berbasis cerita interaktif.</p>
    </footer>
  );
}
