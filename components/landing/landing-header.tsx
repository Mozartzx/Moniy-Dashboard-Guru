'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { APP_DOWNLOAD_URL } from './landing-config';

export function LandingHeader() {
  const [pastHero, setPastHero] = useState(false);

  // Compact download button appears once the hero CTA has scrolled away (IntersectionObserver, no scroll listener).
  useEffect(() => {
    const hero = document.getElementById('lp-hero');
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="lp-header" data-stuck={pastHero}>
      <div className="lp-wrap lp-header-inner">
        <BrowserNavigationLink href="/" aria-label="Moniy, ke beranda">
          <Image src="/landing/logo.webp" alt="Moniy" width={520} height={150} className="lp-logo" priority />
        </BrowserNavigationLink>
        <nav className="lp-nav" aria-label="Bagian halaman">
          <a href="#tentang">Apa itu Moniy</a>
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#fitur">Fitur</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="lp-header-actions">
          <BrowserNavigationLink className="lp-link" href="/login">Masuk sebagai guru</BrowserNavigationLink>
          <a className="lp-btn lp-btn-primary lp-btn-sm lp-header-cta" href={APP_DOWNLOAD_URL}>Unduh aplikasi</a>
        </div>
      </div>
    </header>
  );
}
