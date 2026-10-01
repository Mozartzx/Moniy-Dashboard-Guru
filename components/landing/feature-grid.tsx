'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Kisi fitur. Hanya menandai saat keluar layar supaya animasi kecil di dalam kartu berhenti. */
export function FeatureGrid({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => el.setAttribute('data-off', String(!entry.isIntersecting)), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div className="nx-bento" ref={ref}>{children}</div>;
}
