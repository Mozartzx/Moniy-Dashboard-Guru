'use client';

import Image from 'next/image';
import { useState } from 'react';

export function ShieldDemo() {
  const [on, setOn] = useState(false);

  return (
    <div className="lp-shield">
      <div className="lp-shield-card">
        <Image src="/landing/screens/perisai-mati.webp" alt="" width={780} height={426} sizes="(max-width: 768px) 92vw, 460px" data-active={!on} />
        <Image src="/landing/screens/perisai-aktif.webp" alt="" width={780} height={426} sizes="(max-width: 768px) 92vw, 460px" data-active={on} />
      </div>
      <div className="lp-shield-row">
        <span id="lp-shield-label">Proteksi JUDOL</span>
        <button type="button" role="switch" aria-checked={on} aria-labelledby="lp-shield-label" className="lp-switch" onClick={() => setOn((value) => !value)}>
          <span className="lp-switch-thumb" />
        </button>
      </div>
      <p className="lp-sr" aria-live="polite">{on ? 'Kamu aman karena proteksi dinyalakan.' : 'Proteksi belum dinyalakan.'}</p>
    </div>
  );
}
