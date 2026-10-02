/**
 * Api streak yang sama dengan aplikasi (HdStreakFlame di Flutter): tiga lapis (luar merah-oranye,
 * tengah kuning, inti putih) ditambah kilap yang menyapu ke samping. Koordinat disalin dari painter
 * aslinya pada kanvas 100 x 115.
 */
export function FlameDefs() {
  return (
    <svg className="mf-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mf-out" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff2a00" />
          <stop offset="0.48" stopColor="#ff6d00" />
          <stop offset="1" stopColor="#ffab00" />
        </linearGradient>
        <linearGradient id="mf-mid" gradientUnits="userSpaceOnUse" x1="0" y1="29.9" x2="0" y2="115">
          <stop offset="0" stopColor="#ffd600" />
          <stop offset="1" stopColor="#ff9100" />
        </linearGradient>
        <linearGradient id="mf-core" gradientUnits="userSpaceOnUse" x1="0" y1="62.1" x2="0" y2="103.5">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#fffde7" />
        </linearGradient>
        <linearGradient id="mf-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.65" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="mf-glow">
          <stop offset="0" stopColor="#ff6d00" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ff6d00" stopOpacity="0" />
        </radialGradient>
        <clipPath id="mf-clip"><path d={OUTER} /></clipPath>
      </defs>
    </svg>
  );
}

const OUTER = 'M50 0C60 20.7 68 29.9 72 36.8C84 29.9 94 41.4 96 55.2C98 73.6 88 96.6 72 108.1C60 115 40 115 28 108.1C12 96.6 2 73.6 4 55.2C6 41.4 16 29.9 28 36.8C32 29.9 40 20.7 50 0Z';
const MID = 'M50 29.9C58 43.7 64 50.6 68 57.5C78 55.2 82 66.7 80 80.5C78 96.6 66 107 50 107C34 107 22 96.6 20 80.5C18 66.7 22 55.2 32 57.5C36 50.6 42 43.7 50 29.9Z';
const CORE = 'M50 62.1C60 75.9 64 87.4 58 98.9C54 103.5 46 103.5 42 98.9C36 87.4 40 75.9 50 62.1Z';

/** Pakai satu `FlameDefs` per halaman; semua `Flame` merujuk gradien di dalamnya. */
export function Flame({ className = '' }: { className?: string }) {
  return (
    <svg className={`mf ${className}`} viewBox="-12 -4 124 126" aria-hidden="true" focusable="false">
      <circle cx="50" cy="69" r="44" fill="url(#mf-glow)" />
      <path d={OUTER} fill="url(#mf-out)" />
      <path d={MID} fill="url(#mf-mid)" />
      <path d={CORE} fill="url(#mf-core)" />
      <g clipPath="url(#mf-clip)"><rect className="mf-sheen" x="0" y="0" width="70" height="115" fill="url(#mf-sheen)" /></g>
    </svg>
  );
}
