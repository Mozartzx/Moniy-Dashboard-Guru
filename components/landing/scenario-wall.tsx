import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ScenarioStage } from './scenario-stage';
import { scenarioTiles } from './scenario-tiles';

const css = (vars: Record<string, string | number>) => vars as CSSProperties;

/** Seksi "banyak skenario": kartu gambar modul mengalir serong dari kiri atas dan kanan atas, digerakkan scroll (lihat landing.css). */
export function ScenarioWall() {
  return (
    <section className="lp-cosmos" aria-labelledby="lp-cosmos-title">
      <ScenarioStage>
        <div className="cs-tiles" aria-hidden="true">
          {scenarioTiles.map((tile) => (
            <div key={tile.src} className={`cs-tile cs-${tile.side}`} style={css({ '--ww': tile.ww, '--x0': tile.x0, '--x1': tile.x1, '--y0': tile.y0, '--y1': tile.y1, '--r0': tile.r0, '--r1': tile.r1, '--ry': tile.ry, '--a': tile.a, '--b': tile.b, '--f': tile.f, '--dl': tile.dl })}>
              <Image src={`/landing/skenario/${tile.src}.webp`} alt="" width={tile.w} height={tile.h} loading="eager" fetchPriority="low" unoptimized draggable={false} />
            </div>
          ))}
        </div>
        <div className="cs-copy">
          <h2 id="lp-cosmos-title"><span>1000+</span> skenario yang bisa kamu jelajahi</h2>
          <p>Setiap keputusan membuka cabang cerita yang berbeda.</p>
        </div>
      </ScenarioStage>
      <div className="lp-cosmos-runway" aria-hidden="true" />
    </section>
  );
}
