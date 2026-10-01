import { BookOpen, Flame, Shield, Sparkles, Workflow } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { FeatureGrid } from './feature-grid';
import { Rv } from './rv';

function Card({ icon, title, text, className = '', children, delay = 0 }: { icon: ReactNode; title: string; text: string; className?: string; children: ReactNode; delay?: number }) {
  return (
    <Rv className={`nx-card ${className}`} delay={delay}>
      <div className="nx-card-top" aria-hidden="true">{children}</div>
      <div className="nx-card-body">
        <h3><span className="nx-card-ic" aria-hidden="true">{icon}</span>{title}</h3>
        <p>{text}</p>
      </div>
    </Rv>
  );
}

export function FeaturesSection() {
  return (
    <section className="nx-sec" id="fitur" aria-labelledby="nx-feat-title">
      <div className="lp-wrap">
        <Rv className="nx-head">
          <p className="nx-eyebrow">Fitur</p>
          <h2 className="nx-h2" id="nx-feat-title">Satu aplikasi, <em>lima alasan</em> untuk terus belajar.</h2>
        </Rv>
        <FeatureGrid>
          <Card className="nx-c-wide" icon={<Workflow size={18} strokeWidth={2.4} />} title="Cerita interaktif" text="Pilih supplier, hadapi random event, lalu lihat akibatnya pada saldo dan hasil usahamu.">
            <div className="w-story">
              <p className="w-q">Supplier mana yang kamu pilih?</p>
              <p className="w-opt w-o1">Supplier A <b>Rp 250.000</b></p>
              <p className="w-opt w-o2">Supplier B <b>Rp 70.000</b></p>
              <p className="w-opt w-o3">Supplier C <b>Rp 120.000</b></p>
              <p className="w-evt">Random event: listrik padam!</p>
            </div>
          </Card>
          <Card icon={<Sparkles size={18} strokeWidth={2.4} />} title="Moniy AI" text="Ketik cerita yang kamu mau. Moniy AI menyusunnya jadi modul." delay={80}>
            <div className="w-ai">
              <p className="w-type"><span>Aku buka warung kopi di sekolah</span></p>
              <p className="w-done">Modul siap dimainkan</p>
            </div>
          </Card>
          <Card icon={<Shield size={18} strokeWidth={2.4} />} title="Perisai anti judol" text="Aktifkan Perisai, dan situs judi online diblokir di ponselmu.">
            <div className="w-shield">
              <div className="w-sw"><span>Proteksi JUDOL</span><i /></div>
              <p className="w-blk w-b1">Situs judi <b>Diblokir</b></p>
              <p className="w-blk w-b2">Iklan taruhan <b>Diblokir</b></p>
            </div>
          </Card>
          <Card icon={<Flame size={18} strokeWidth={2.4} />} title="Streak dan lencana" text="Belajar sedikit tiap minggu, kumpulkan lencana dan julukan." delay={80}>
            <div className="w-streak">
              <p className="w-sn">Streak mingguan</p>
              <div className="w-days">{[0, 1, 2, 3, 4, 5, 6].map((i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}</div>
            </div>
          </Card>
          <Card icon={<BookOpen size={18} strokeWidth={2.4} />} title="Bacaan dari sumber resmi" text="Materi singkat yang bersumber dari OJK dan Kemendikdasmen." delay={160}>
            <div className="w-read">
              <p className="w-r w-r1">Mengenal OJK <b>OJK</b></p>
              <p className="w-r w-r2">Waspada penipuan <b>OJK</b></p>
              <p className="w-r w-r3">Pinjaman dan utang <b>OJK</b></p>
            </div>
          </Card>
        </FeatureGrid>
      </div>
    </section>
  );
}
