'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { PhoneFrame, phoneScreens } from './phone-frame';
import { Rv } from './rv';

const steps = [
  { label: 'Pilih supplier', screen: phoneScreens.pilih },
  { label: 'Hadapi random event', screen: phoneScreens.event },
  { label: 'Lihat hasilnya', screen: phoneScreens.hasil },
];

const points = [
  'Pilihanmu menentukan akhir ceritanya.',
  'Salah ambil keputusan? Ruginya di cerita, bukan di dompetmu.',
  'Guru memantau progres kelas, bukan mengintip siswa.',
];

export function AboutSection() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(() => setActive((current) => (current + 1) % steps.length), 3200);
    }, { threshold: 0.35 });
    observer.observe(el);
    return () => { observer.disconnect(); window.clearInterval(timer); };
  }, []);

  return (
    <section className="nx-sec" id="tentang" aria-labelledby="nx-about-title">
      <div className="lp-wrap nx-split">
        <Rv className="nx-copy">
          <p className="nx-eyebrow">Apa itu Moniy</p>
          <h2 className="nx-h2" id="nx-about-title">Kamu jadi pemilik usaha. Uangnya <em>kamu yang atur</em>.</h2>
          <p className="nx-lede">Moniy adalah aplikasi belajar keuangan untuk siswa SMA. Kamu memilih supplier, lalu sesekali dihantam random event seperti listrik padam. Setelah itu saldo usahamu berubah sesuai keputusanmu.</p>
          <ul className="nx-checks">
            {points.map((point) => <li key={point}><span className="nx-check" aria-hidden="true" />{point}</li>)}
          </ul>
        </Rv>
        <Rv className="nx-visual-wrap" delay={140}>
          <div className="nx-visual" ref={ref}>
            <PhoneFrame screens={steps.map((step) => step.screen)} index={active} />
            <ul className="nx-chips" aria-hidden="true">
              {steps.map((step, i) => <li key={step.label} data-i={i} data-on={i === active}>{step.label}</li>)}
            </ul>
            <Image className="nx-deco nx-deco-a" src="/landing/hero/bag.webp" alt="" width={212} height={260} unoptimized aria-hidden="true" />
            <Image className="nx-deco nx-deco-b" src="/landing/hero/coin-front.webp" alt="" width={260} height={260} unoptimized aria-hidden="true" />
            <Image className="nx-deco nx-deco-c" src="/landing/hero/spark-big.webp" alt="" width={198} height={200} unoptimized aria-hidden="true" />
          </div>
        </Rv>
      </div>
    </section>
  );
}
