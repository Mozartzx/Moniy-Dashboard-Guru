import { BarChart3, FileSpreadsheet, ShieldCheck, Users } from 'lucide-react';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { Rv } from './rv';

const items = [
  { icon: BarChart3, title: 'Progres per topik', text: 'Lihat topik yang sudah dikuasai dan yang masih perlu diulang.' },
  { icon: ShieldCheck, title: 'Sinyal judol per kelas', text: 'Angka gabungan satu kelas. Nama siswa tidak ikut tercatat.' },
  { icon: FileSpreadsheet, title: 'Laporan Excel', text: 'Unduh rekap kelas dalam satu klik.' },
  { icon: Users, title: 'Hanya kelasmu', text: 'Setiap guru hanya melihat kelas yang ia ampu.' },
];

export function TeacherSection() {
  return (
    <section className="nx-sec" id="guru" aria-labelledby="nx-guru-title">
      <div className="lp-wrap">
        <Rv className="nx-guru">
          <div className="nx-guru-copy">
            <p className="nx-eyebrow nx-eyebrow-light">Untuk guru</p>
            <h2 className="nx-h2 nx-h2-light" id="nx-guru-title">Pantau satu kelas tanpa membuka identitas siswa.</h2>
            <p className="nx-lede nx-lede-light">Dashboard menampilkan progres belajar dan sinyal judol per kelas, sehingga kamu tahu apa yang perlu dibahas ulang.</p>
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
