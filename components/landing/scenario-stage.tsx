'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Panggung seksi skenario. Hanya menandai saat keluar layar supaya animasi cadangan (tanpa scroll timeline) berhenti. */
export function ScenarioStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => el.setAttribute('data-off', String(!entry.isIntersecting)), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div className="lp-cosmos-stage" ref={ref}>{children}</div>;
}
