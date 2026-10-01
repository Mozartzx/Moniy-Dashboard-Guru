import Image from 'next/image';
import type { CSSProperties } from 'react';
import { heroSprites } from './hero-layout';

const css = (vars: Record<string, string | number>) => vars as CSSProperties;

/** Lapisan sprite dekoratif hero. Murni markup statis; gerak ada di landing.css, parallax dan jeda di HeroStage. */
export function HeroSprites() {
  return (
    <div className="hs-layer" aria-hidden="true">
      <svg className="hs-squig" viewBox="0 0 120 50"><path d="M6 30 C 24 4, 40 46, 58 22 S 92 6, 112 26" /></svg>
      {heroSprites.map((sp, i) => (
        <div key={i} className={`hs${sp.m ? '' : ' hs-nm'}${sp.eager ? ' hs-big' : ''}`} style={css({ '--x': sp.x, '--y': sp.y, '--s': sp.s, '--d': sp.d, '--n': i, ...(sp.m ? { '--mx': sp.m[0], '--my': sp.m[1], '--ms': sp.m[2] } : {}) })}>
          <div className="hs-in" style={css({ '--anim': `hs-${sp.a}`, '--dur': `${sp.t}s`, '--delay': `-${(sp.e * 2).toFixed(1)}s`, '--amp': sp.amp ?? 10, '--rot': sp.rot ?? 4 })}>
            <Image src={`/landing/hero/${sp.id}.webp`} alt="" width={sp.w} height={sp.h} priority={sp.eager} unoptimized draggable={false} />
            {sp.blink ? (
              <Image className="hs-blink" src={`/landing/hero/${sp.id}-mata.webp`} alt="" width={sp.blink.w} height={sp.blink.h} priority unoptimized draggable={false} style={css({ left: `${sp.blink.left}%`, top: `${sp.blink.top}%`, width: `${sp.blink.width}%`, '--bt': `${sp.blink.t}s`, '--bd': `-${sp.blink.e}s` })} />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
