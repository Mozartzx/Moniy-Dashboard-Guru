'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** Fades content in once when it scrolls into view. Hidden state lives in landing.css so no-JS stays visible. */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.classList.add('is-in');
      observer.disconnect();
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`lp-reveal ${className}`} style={{ '--d': `${delay}ms` } as CSSProperties}>{children}</div>;
}
