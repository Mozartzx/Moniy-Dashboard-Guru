import { BarChart3, FileSpreadsheet, ShieldCheck, Users } from 'lucide-react';
import Image from 'next/image';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { Rv } from './rv';

const items = [
  { icon: BarChart3, title: 'Progres per topik', text: 'Topik mana yang sudah dikuasai kelas, mana yang perlu dibahas lagi.' },
  { icon: ShieldCheck, title: 'Sinyal judol per kelas', text: 'Hanya angka gabungan kelas. Nama siswa tidak ikut tercatat.' },
  { icon: FileSpreadsheet, title: 'Laporan Excel', text: 'Unduh rekap kelas dalam satu klik.' },
  { icon: Users, title: 'Hanya kelasmu', text: 'Kamu hanya melihat kelas yang kamu ampu.' },
];

export function TeacherSection() {
  return (
    <section className="nx-sec" id="guru" aria-labelledby="nx-guru-title">
      <div className="lp-wrap">
        <Rv className="nx-guru">
          <div className="nx-guru-mascot" aria-hidden="true">
            <Image src="/landing/guru/moniy-guru.webp" alt="" width={611} height={640} unoptimized priority />
            <Image className="nx-guru-blink" src="/landing/guru/moniy-guru-mata.webp" alt="" width={229} height={124} unoptimized />
          </div>
          <div className="nx-guru-copy">
            <p className="nx-eyebrow nx-eyebrow-light">Untuk guru</p>
            <h2 className="nx-h2 nx-h2-light" id="nx-guru-title">Pantau kelas, tanpa mengintip siswa.</h2>
            <p className="nx-lede nx-lede-light">Dashboard menunjukkan topik mana yang masih lemah dan seberapa rawan kelasmu terhadap judol. Nama siswa tidak pernah muncul.</p>
            <div className="nx-btn-row">
              <BrowserNavigationLink className="lp-btn nx-btn-white" href="/login">Masuk sebagai guru</BrowserNavigationLink>
              <BrowserNavigationLink className="lp-btn nx-btn-ghost" href="/register">Daftar sebagai guru</BrowserNavigationLink>
            </div>
          </div>
          <ul className="nx-guru-grid">
            {items.map(({ icon: Icon, title, text }) => (
              <li key={title}><span className="nx-guru-ic" aria-hidden="true"><Icon size={22} strokeWidth={2.2} /></span><h3>{title}</h3><p>{text}</p></li>
            ))}
          </ul>
        </Rv>
      </div>
    </section>
  );
}
