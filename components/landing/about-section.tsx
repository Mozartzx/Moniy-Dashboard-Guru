'use client';

import { Check } from 'lucide-react';
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
  'Cerita bercabang: tiap pilihan membawa ke akhir yang berbeda.',
  'Belajar dari akibat keputusanmu, bukan dari hafalan.',
  'Guru memantau kelas tanpa membuka identitas siswa.',
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
          <h2 className="nx-h2" id="nx-about-title">Belajar uang paling seru kalau <em>kamu yang menentukan ceritanya</em>.</h2>
          <p className="nx-lede">Moniy adalah aplikasi belajar keuangan dan wirausaha untuk siswa SMA. Kamu jadi pemilik bisnis kecil, mengambil keputusan, menghadapi kejadian tak terduga, lalu melihat akibatnya.</p>
          <ul className="nx-checks">
            {points.map((point) => <li key={point}><span className="nx-check"><Check size={14} strokeWidth={3} aria-hidden="true" /></span>{point}</li>)}
          </ul>
        </Rv>
        <Rv className="nx-visual-wrap" delay={140}>
          <div className="nx-visual" ref={ref}>
            <div className="nx-visual-glow" aria-hidden="true" />
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
