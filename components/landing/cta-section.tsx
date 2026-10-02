import Image from 'next/image';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { APP_DOWNLOAD_URL } from './landing-config';
import { Rv } from './rv';

const deco = [
  { id: 'moniy-utama', w: 502, h: 560, cls: 'nx-cta-l' },
  { id: 'moniy-roket', w: 451, h: 560, cls: 'nx-cta-r' },
  { id: 'coin-front', w: 260, h: 260, cls: 'nx-cta-c1' },
  { id: 'star-y', w: 232, h: 236, cls: 'nx-cta-s1' },
  { id: 'spark-big', w: 198, h: 200, cls: 'nx-cta-s2' },
  { id: 'heart-r', w: 224, h: 200, cls: 'nx-cta-h' },
];

export function CtaSection() {
  return (
    <section className="nx-sec nx-cta" id="unduh" aria-labelledby="nx-cta-title">
      <div className="nx-cta-stage">
        {deco.map((d) => <Image key={d.id} className={`nx-cta-i ${d.cls}`} src={`/landing/hero/${d.id}.webp`} alt="" width={d.w} height={d.h} unoptimized aria-hidden="true" />)}
        <Rv className="nx-cta-copy">
          <h2 className="nx-h2" id="nx-cta-title">Usahamu menunggu <em>keputusan pertamamu</em>.</h2>
          <p className="nx-lede">Unduh Moniy dan mainkan satu cerita. Guru bisa langsung masuk ke dashboard kelas.</p>
          <div className="nx-btn-row">
            <a className="lp-btn lp-btn-primary" href={APP_DOWNLOAD_URL}>Unduh aplikasi</a>
            <BrowserNavigationLink className="lp-btn lp-btn-secondary" href="/login">Masuk sebagai guru</BrowserNavigationLink>
          </div>
        </Rv>
      </div>
    </section>
  );
}
