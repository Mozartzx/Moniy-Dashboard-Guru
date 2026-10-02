import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ScenarioStage } from './scenario-stage';

const css = (vars: Record<string, string | number>) => vars as CSSProperties;

/** 24 latar cerita aplikasi (270 x 600). Tiap kolom mengambil gambar dengan langkah 7 supaya tetangga tidak kembar. */
const images = [
  'b-investasi-aktivitas', 'b-menabung-netral', 'b-pajak-pembuka', 'b-utang-tantangan', 'b-wirausaha-aktivitas', 'b-penganggaran-netral',
  'b-investasi-netral', 'b-menabung-pembuka', 'b-pajak-tantangan', 'b-utang-aktivitas', 'b-wirausaha-netral', 'b-penganggaran-pembuka',
  'b-investasi-pembuka', 'b-menabung-tantangan', 'b-pajak-aktivitas', 'b-utang-netral', 'b-wirausaha-pembuka', 'b-penganggaran-tantangan',
  'b-investasi-tantangan', 'b-menabung-aktivitas', 'b-pajak-netral', 'b-utang-pembuka', 'b-wirausaha-tantangan', 'b-penganggaran-aktivitas',
];

/** Tiga kolom per sisi, dihitung dari tengah. Kolom luar lebih panjang sehingga menempuh jarak lebih jauh dan terlihat lebih cepat. */
const columns = (['l', 'r'] as const).flatMap((side) =>
  [4, 5, 6].map((count, k) => ({
    side, k, count,
    cards: Array.from({ length: count }, (_, row) => images[(k * 5 + row * 7 + (side === 'r' ? 3 : 0)) % images.length]),
  })),
);

/** Seksi "banyak skenario": kolom kartu gambar naik dari bawah mengikuti scroll, kiri dan kanan judul (lihat landing.css). */
export function ScenarioWall() {
  return (
    <section className="lp-cosmos" aria-labelledby="lp-cosmos-title">
      <ScenarioStage>
        <div className="cs-cols" aria-hidden="true">
          {columns.map((col) => (
            <div key={`${col.side}${col.k}`} className={`cs-col cs-${col.side}`} style={css({ '--k': col.k, '--n': col.count })}>
              {col.cards.map((src, row) => (
                <div key={row} className="cs-card">
                  <Image src={`/landing/skenario/${src}.webp`} alt="" width={270} height={600} loading="eager" fetchPriority="low" unoptimized draggable={false} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="cs-copy">
          <h2 id="lp-cosmos-title"><span>1000+</span> skenario yang bisa kamu jelajahi</h2>
          <p>Tiap pilihan membawamu ke akhir cerita yang lain.</p>
        </div>
      </ScenarioStage>
      <div className="lp-cosmos-runway" aria-hidden="true" />
    </section>
  );
}
