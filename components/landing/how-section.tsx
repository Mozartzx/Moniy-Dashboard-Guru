'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PhoneFrame, phoneScreens } from './phone-frame';
import { Rv } from './rv';

const STEP_MS = 5200;

const steps = [
  { title: 'Pilih cerita', text: 'Mulai dari modul bawaan seperti Berjualan Jus Segar, atau ketik cerita yang kamu mau dan biarkan Moniy AI menyusunnya.', screen: phoneScreens.pilih },
  { title: 'Ambil keputusan', text: 'Pilih salah satu opsi, atau tulis sendiri apa yang akan kamu lakukan. Keputusanmu dinilai dan menggerakkan ceritanya.', screen: phoneScreens.event },
  { title: 'Hadapi random event', text: 'Di tengah cerita muncul kejadian tak terduga. Saldo dan hasil usahamu ikut berubah sesuai keputusanmu.', screen: phoneScreens.hasil },
  { title: 'Dapat julukan, lalu terus belajar', text: 'Tiap cerita berakhir dengan julukan dan pencapaian. Lanjutkan dengan materi singkat dan jaga streak mingguanmu.', screen: phoneScreens.ending },
];

export function HowSection() {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const [hold, setHold] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting && !reduce), { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const next = useCallback(() => setActive((current) => (current + 1) % steps.length), []);
  const playing = running && !hold;

  return (
    <section className="nx-sec nx-band" id="cara-kerja" aria-labelledby="nx-how-title">
      <div className="lp-wrap">
        <Rv className="nx-head">
          <p className="nx-eyebrow">Cara kerja</p>
          <h2 className="nx-h2" id="nx-how-title">Empat langkah dari <em>bingung</em> jadi <em>paham</em>.</h2>
        </Rv>
        <Rv className="nx-how" delay={120}>
          <div className="nx-how-grid" ref={ref}>
            <div className="nx-steps" role="tablist" aria-label="Langkah belajar di Moniy" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
              {steps.map((step, i) => (
                <button key={step.title} type="button" role="tab" id={`nx-tab-${i}`} aria-selected={i === active} aria-controls="nx-how-panel" tabIndex={i === active ? 0 : -1} className="nx-step" data-active={i === active} onClick={() => setActive(i)}>
                  <span className="nx-step-n" aria-hidden="true">{i + 1}</span>
                  <span className="nx-step-body">
                    <span className="nx-step-title">{step.title}</span>
                    <span className="nx-step-text"><span>{step.text}</span></span>
                  </span>
                  {i === active ? <span className="nx-step-bar" aria-hidden="true"><i key={active} data-run={playing} style={{ animationDuration: `${STEP_MS}ms` }} onAnimationEnd={playing ? next : undefined} /></span> : null}
                </button>
              ))}
            </div>
            <div className="nx-how-phone" id="nx-how-panel" role="tabpanel" aria-labelledby={`nx-tab-${active}`}>
              <PhoneFrame screens={steps.map((step) => step.screen)} index={active} />
            </div>
          </div>
        </Rv>
      </div>
    </section>
  );
}
