import Image from 'next/image';
import { BarChart3, FileSpreadsheet, PiggyBank, ShieldCheck, Store, TrendingUp, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { APP_DOWNLOAD_URL } from './landing-config';
import { Reveal } from './reveal';
import { ShieldDemo } from './shield-demo';
import { StoryDemo } from './story-demo';

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
      <div className="lp-wrap lp-hero-main">
        <div className="lp-hero-art">
          <Image src="/landing/mascot/mascot-wave.webp" alt="Maskot Moniy, monyet biru berhoodie yang melambaikan tangan" width={601} height={720} priority className="lp-mascot" />
        </div>
        <div className="lp-hero-copy">
          <h1>Cara paling seru untuk belajar keuangan!</h1>
          <p>Ambil keputusan, hadapi kejadian tak terduga, lalu lihat hasilnya lewat cerita interaktif.</p>
          <div className="lp-cta-stack">
            <a className="lp-btn lp-btn-primary" href={APP_DOWNLOAD_URL}>Unduh aplikasi</a>
            <BrowserNavigationLink className="lp-btn lp-btn-secondary" href="/login">Masuk sebagai guru</BrowserNavigationLink>
          </div>
        </div>
      </div>
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
      <Feature title="kamu yang menentukan ceritanya" media={<StoryDemo />}>
        Kamu jadi pemilik bisnis. Pilih supplier, hadapi kejadian mendadak, dan lihat akibat dari setiap keputusanmu.
      </Feature>
      <Feature flip title="dapat julukan di akhir cerita" media={<Phone src="/landing/screens/ending.webp" alt="Layar akhir cerita Moniy: lencana Kancil Cerdik sebagai pencapaian dan tombol kembali ke beranda." />}>
        Setiap cerita berakhir dengan julukan dan pencapaian sesuai keputusanmu. Salah pilih? Tidak apa, coba lagi dan belajar dari hasilnya.
      </Feature>
    </>
  );
}

export function ShieldBand() {
  return (
    <section className="lp-band">
      <div className="lp-wrap lp-band-inner">
        <Reveal className="lp-feature-copy lp-band-copy">
          <h2>proteksi judol, cukup sekali nyalakan</h2>
          <p>Aktifkan Perisai dan Moniy membantu memblokir situs judi online di ponselmu. Guru hanya melihat angka gabungan kelas, tanpa nama siswa.</p>
        </Reveal>
        <Reveal className="lp-band-demo" delay={120}><ShieldDemo /></Reveal>
      </div>
    </section>
  );
}

export function MoreFeatures() {
  return (
    <>
      <Feature title="ceritamu sendiri, dibuat oleh AI" media={<Phone src="/landing/screens/materi.webp" alt="Layar materi Moniy: cara menghitung laba kotor dengan papan tulis dan rumus." />}>
        Ketik cerita yang kamu mau, lalu Moniy AI menyusun modulnya. Ada juga materi singkat untuk memahami rumus seperti laba kotor.
      </Feature>
      <Feature flip title="sedikit tiap hari, jadi kebiasaan" media={<Phone src="/landing/screens/beranda.webp" alt="Beranda Moniy: streak pembelajaran mingguan dan tombol lanjutkan modul terakhir." />}>
        Streak mingguan menemanimu belajar rutin. Lanjutkan modul terakhir dengan satu ketukan, kapan pun kamu sempat.
      </Feature>
    </>
  );
}

const guruPoints = [
  { icon: BarChart3, title: 'Progres per topik', text: 'Lihat topik yang sudah dikuasai dan yang perlu penguatan.' },
  { icon: ShieldCheck, title: 'Sinyal judol tingkat kelas', text: 'Angka gabungan yang anonim, tanpa nama siswa.' },
  { icon: FileSpreadsheet, title: 'Laporan Excel', text: 'Unduh rekap kelas sekali klik.' },
];

export function GuruPanel() {
  return (
    <section className="lp-guru">
      <div className="lp-wrap">
        <Reveal className="lp-guru-panel">
          <div className="lp-guru-top">
            <Image src="/landing/guru-banner.webp" alt="Maskot Moniy duduk di meja, tenang karena proteksi judol aktif" width={1400} height={764} sizes="(max-width: 860px) 92vw, 640px" className="lp-guru-banner" />
            <div className="lp-guru-intro">
              <h2>untuk guru: pantau kelas dengan tenang</h2>
              <p>Dashboard guru menampilkan progres belajar dan sinyal judol tingkat kelas, tanpa membuka identitas siswa.</p>
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
      <p className="lp-wrap lp-footer-note">Moniy 2026. Belajar keuangan lewat cerita seru.</p>
    </footer>
  );
}
