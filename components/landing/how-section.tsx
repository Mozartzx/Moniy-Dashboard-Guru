'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { PhoneFrame, phoneScreens } from './phone-frame';

const steps = [
  { title: 'Pilih cerita', text: 'Pilih modul seperti Berjualan Jus Segar, atau ketik ceritamu sendiri dan biarkan Moniy AI yang menyusunnya.', screen: phoneScreens.pilih },
  { title: 'Ambil keputusan', text: 'Pilih salah satu opsi, atau tulis langkahmu sendiri. Apa pun yang kamu putuskan, ceritanya ikut belok.', screen: phoneScreens.event },
  { title: 'Hadapi random event', text: 'Tiba-tiba listrik padam. Cara kamu menanganinya menentukan saldo dan hasil usahamu.', screen: phoneScreens.hasil },
  { title: 'Dapat julukan', text: 'Tiap cerita ditutup dengan julukan, misalnya Kancil Cerdik. Lanjut ke materi singkat dan jaga streak mingguanmu.', screen: phoneScreens.ending },
];

/** Bagian yang menempel di layar: langkah aktif mengikuti scroll, kata-katanya menyala lewat CSS scroll timeline (lihat landing-next.css). */
export function HowSection() {
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
    <section className="nx-sec nx-band nx-sc" id="cara-kerja" aria-labelledby="nx-how-title">
      <div className="nx-sc-stage">
        <div className="lp-wrap nx-sc-inner">
          <div className="nx-head">
            <p className="nx-eyebrow">Cara kerja</p>
            <h2 className="nx-h2" id="nx-how-title">Cukup mainkan, pilih aksi <em>sekreatif mungkin</em>.</h2>
          </div>
          <div className="nx-sc-panel">
            <ol className="nx-rail" aria-label="Langkah cerita">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <button type="button" aria-current={i === active ? 'step' : undefined} onClick={() => goTo(i)}>
                    <span className="nx-rail-n" aria-hidden="true">{i + 1}</span>
                    <span className="nx-rail-l">{step.title}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="nx-sc-phone"><PhoneFrame screens={steps.map((step) => step.screen)} index={active} /></div>
            <div className="nx-sc-copywrap">
              {steps.map((step, i) => {
                const words = step.text.split(' ');
                return (
                  <p key={step.title} className="nx-sc-copy" data-active={i === active}>
                    {words.map((word, k) => <span key={k} className="nx-w" style={{ '--i': k, '--n': words.length } as CSSProperties}>{word}{' '}</span>)}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="nx-sc-runway" aria-hidden="true">
        {steps.map((step, i) => <div key={step.title} data-i={i} ref={(el) => { runway.current[i] = el; }} />)}
      </div>
    </section>
  );
}
