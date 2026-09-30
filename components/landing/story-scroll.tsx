'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

const steps = [
  {
    label: 'Pilih supplier',
    src: '/landing/screens/kondisi.webp',
    alt: 'Layar cerita Moniy: pilih salah satu dari tiga supplier dengan harga berbeda.',
    text: 'Kamu memegang sebuah bisnis kecil. Di awal cerita ada tiga supplier dengan harga berbeda, dan hanya satu yang kamu ambil.',
  },
  {
    label: 'Hadapi random event',
    src: '/landing/screens/kejadian.webp',
    alt: 'Layar cerita Moniy: random event muncul dan kamu memilih tindakan.',
    text: 'Lalu datang random event yang tidak kamu duga. Kamu memilih sendiri tindakannya, dan pilihan itu ikut menentukan ceritanya.',
  },
  {
    label: 'Lihat hasilnya',
    src: '/landing/screens/hasil.webp',
    alt: 'Layar cerita Moniy: hasil dari supplier yang kamu pilih.',
    text: 'Di akhir, kamu melihat hasil dari supplier yang kamu pilih dan dari cara kamu menghadapi random event tadi.',
  },
];

/** Bagian yang menempel di layar: langkah aktif mengikuti scroll, kata-katanya menyala lewat CSS scroll timeline (lihat landing.css). */
export function StoryScroll() {
  const [active, setActive] = useState(0);
  const runway = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.i));
      }
    }, { rootMargin: '-50% 0px -50% 0px' });
    for (const el of runway.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    runway.current[index]?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section className="lp-scrolly" aria-labelledby="lp-story-title">
      <div className="lp-scrolly-stage">
        <div className="lp-wrap lp-scrolly-inner">
          <h2 id="lp-story-title">Kamu pemilik bisnisnya</h2>

          <ol className="lp-rail" aria-label="Tahap cerita">
            {steps.map((step, i) => (
              <li key={step.label}>
                <button type="button" aria-current={i === active ? 'step' : undefined} aria-label={step.label} onClick={() => goTo(i)}>
                  <span className="lp-rail-n" aria-hidden="true">{i + 1}</span>
                  <span className="lp-rail-l">{step.label}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="lp-scrolly-phone">
            <div className="lp-phone">
              <div className="lp-phone-screen">
                {steps.map((step, i) => (
                  <Image key={step.src} src={step.src} alt={step.alt} width={780} height={1688} sizes="(max-width: 860px) 60vw, 300px" className="lp-screen" loading="eager" fetchPriority="low" data-active={i === active} aria-hidden={i !== active} />
                ))}
              </div>
            </div>
          </div>

          <div className="lp-scrolly-copywrap">
            {steps.map((step, i) => {
              const words = step.text.split(' ');
              return (
                <p key={step.label} className="lp-scrolly-copy" data-active={i === active}>
                  {words.map((word, k) => (
                    <span key={k} className="lp-w" style={{ '--i': k, '--n': words.length } as CSSProperties}>{word}{' '}</span>
                  ))}
                </p>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lp-scrolly-runway" aria-hidden="true">
        {steps.map((step, i) => (
          <div key={step.label} data-i={i} ref={(el) => { runway.current[i] = el; }} />
        ))}
      </div>
    </section>
  );
}
