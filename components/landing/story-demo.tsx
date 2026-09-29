'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const steps = [
  { label: 'Pilih', src: '/landing/screens/kondisi.webp', alt: 'Layar cerita Moniy: pilih salah satu dari tiga supplier dengan harga berbeda.' },
  { label: 'Hadapi', src: '/landing/screens/kejadian.webp', alt: 'Layar cerita Moniy: kejadian mendadak muncul dan kamu memilih tindakan.' },
  { label: 'Lihat hasil', src: '/landing/screens/hasil.webp', alt: 'Layar cerita Moniy: hasil dari supplier yang kamu pilih.' },
];

export function StoryDemo() {
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Autoplay while visible until the visitor picks a step; skipped for reduced motion.
  useEffect(() => {
    if (!inView || touched || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % steps.length), 3800);
    return () => window.clearInterval(timer);
  }, [inView, touched]);

  return (
    <div className="lp-story" ref={ref}>
      <div className="lp-phone">
        <div className="lp-phone-screen">
          {steps.map((step, i) => (
            <Image key={step.src} src={step.src} alt={step.alt} width={780} height={1688} sizes="(max-width: 860px) 72vw, 300px" className="lp-screen" data-active={i === index} aria-hidden={i !== index} />
          ))}
        </div>
      </div>
      <fieldset className="lp-steps"><legend className="lp-sr">Tahap cerita</legend>
        {steps.map((step, i) => (
          <button key={step.label} type="button" className="lp-step" aria-pressed={i === index} onClick={() => { setTouched(true); setIndex(i); }}>{step.label}</button>
        ))}
      </fieldset>
    </div>
  );
}
