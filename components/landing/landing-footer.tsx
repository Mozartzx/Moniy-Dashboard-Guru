import Image from 'next/image';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { APP_DOWNLOAD_URL } from './landing-config';

export function LandingFooter() {
  return (
    <footer className="nx-footer">
      <div className="lp-wrap nx-footer-grid">
        <div className="nx-footer-brand">
          <Image src="/landing/app-icon.webp" alt="" width={192} height={192} />
          <span>Moniy</span>
        </div>
        <nav aria-label="Halaman"><h3>Halaman</h3><a href="#tentang">Apa itu Moniy</a><a href="#cara-kerja">Cara kerja</a><a href="#fitur">Fitur</a><a href="#faq">FAQ</a></nav>
        <nav aria-label="Untuk siswa"><h3>Untuk siswa</h3><a href={APP_DOWNLOAD_URL}>Unduh aplikasi</a></nav>
        <nav aria-label="Untuk guru"><h3>Untuk guru</h3><BrowserNavigationLink href="/login">Masuk sebagai guru</BrowserNavigationLink><BrowserNavigationLink href="/register">Daftar sebagai guru</BrowserNavigationLink></nav>
      </div>
      <p className="lp-wrap nx-footer-note">Moniy 2026. Aplikasi belajar keuangan berbasis cerita interaktif.</p>
    </footer>
  );
}
