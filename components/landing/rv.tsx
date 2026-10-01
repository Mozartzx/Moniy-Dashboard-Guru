'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** Muncul dengan naik dan memudar sekali saat masuk layar. Keadaan awal hanya disembunyikan bila JS aktif (lihat landing-next.css). */
export function Rv({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.classList.add('is-in');
      observer.disconnect();
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`nx-rv ${className}`} style={{ '--d': `${delay}ms` } as CSSProperties}>{children}</div>;
}
