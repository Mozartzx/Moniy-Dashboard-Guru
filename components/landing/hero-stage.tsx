'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Panggung hero: parallax halus mengikuti kursor (hanya mouse) dan jeda animasi saat keluar layar. */
export function HeroStage({ layer, children }: { layer: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => el.setAttribute('data-off', String(!entry.isIntersecting)), { threshold: 0.05 });
    observer.observe(el);

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let px = 0;
    let py = 0;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      px = -((event.clientX - rect.left) / rect.width - 0.5);
      py = -((event.clientY - rect.top) / rect.height - 0.5);
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; el.style.setProperty('--px', px.toFixed(3)); el.style.setProperty('--py', py.toFixed(3)); });
    };
    const onLeave = () => { el.style.setProperty('--px', '0'); el.style.setProperty('--py', '0'); };
    if (fine && !reduce) {
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
    }
    return () => {
      observer.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="lp-hero-stage" ref={ref}>
      <div className="hs-blob" style={{ left: '-6%', top: '14%', width: '34%' }} aria-hidden="true" />
      <div className="hs-blob" style={{ right: '-8%', top: '38%', width: '30%' }} aria-hidden="true" />
      <div className="hs-blob hs-nm" style={{ left: '20%', top: '68%', width: '13%' }} aria-hidden="true" />
      <div className="hs-blob hs-nm" style={{ right: '24%', top: '4%', width: '11%' }} aria-hidden="true" />
      {layer}
      {children}
    </div>
  );
}
