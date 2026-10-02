'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Rv } from './rv';

const faqs = [
  { q: 'Moniy itu untuk siapa?', a: 'Untuk siswa SMA kelas X (Fase E) yang mau belajar ekonomi dan wirausaha lewat cerita. Guru memakai dashboard web untuk memantau kelasnya.' },
  { q: 'Apakah guru bisa melihat siapa yang terpapar judi online?', a: 'Tidak. Guru hanya melihat angka satu kelas secara keseluruhan. Datanya memang tidak pernah menyimpan nama siswa.' },
  { q: 'Bagaimana cara kerja Perisai?', a: 'Nyalakan Perisai di aplikasi, dan situs judi online yang kamu buka akan diblokir. Moniy hanya mencatat bahwa ada percobaan, bukan siapa pelakunya.' },
  { q: 'Apa itu Moniy AI?', a: 'Fitur yang mengubah ceritamu jadi modul. Kamu ketik idenya, misalnya buka warung kopi di sekolah, lalu Moniy AI menyusun pilihan dan kejadiannya.' },
  { q: 'Apakah siswa perlu login ke dashboard guru?', a: 'Tidak. Dashboard hanya untuk guru. Siswa belajar lewat aplikasi Moniy di ponsel.' },
  { q: 'Di mana saya bisa mengunduh aplikasinya?', a: 'Belum dirilis. Begitu ada, tombol "Unduh aplikasi" di halaman ini langsung mengarah ke sana.' },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="nx-sec nx-band" id="faq" aria-labelledby="nx-faq-title">
      <div className="lp-wrap">
        <Rv className="nx-head">
          <h2 className="nx-h2" id="nx-faq-title">FAQ</h2>
        </Rv>
        <Rv className="nx-faq" delay={100}>
          {faqs.map((item, i) => (
            <div key={item.q} className="nx-faq-item" data-open={open === i}>
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={`nx-faq-${i}`} id={`nx-faq-btn-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                  <span>{item.q}</span>
                  <ChevronDown size={20} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </h3>
              <section className="nx-faq-panel" id={`nx-faq-${i}`} aria-labelledby={`nx-faq-btn-${i}`}><div><p>{item.a}</p></div></section>
            </div>
          ))}
        </Rv>
      </div>
    </section>
  );
}
