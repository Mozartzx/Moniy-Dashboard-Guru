'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Rv } from './rv';

const faqs = [
  { q: 'Moniy itu untuk siapa?', a: 'Untuk siswa SMA (Fase E) yang ingin belajar ekonomi, keuangan, dan wirausaha lewat cerita. Guru memakai dashboard untuk memantau kelasnya.' },
  { q: 'Apakah guru bisa melihat siapa yang terpapar judi online?', a: 'Tidak. Guru hanya melihat angka gabungan per kelas. Nama siswa tidak pernah dikaitkan dengan data deteksi judi online.' },
  { q: 'Bagaimana cara kerja Perisai?', a: 'Saat Perisai aktif, Moniy memblokir situs judi online di ponselmu. Guru hanya melihat angka gabungan satu kelas, bukan siapa yang mencobanya.' },
  { q: 'Apa itu Moniy AI?', a: 'Fitur yang menyusun modul dari cerita yang kamu ketik. Selain itu ada materi singkat untuk memahami konsep seperti laba kotor.' },
  { q: 'Apakah siswa perlu login ke dashboard guru?', a: 'Tidak. Dashboard khusus guru. Siswa belajar lewat aplikasi Moniy di ponsel.' },
  { q: 'Di mana saya bisa mengunduh aplikasinya?', a: 'Tautan unduh akan tersedia pada tombol "Unduh aplikasi" di halaman ini begitu Moniy dirilis.' },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="nx-sec nx-band" id="faq" aria-labelledby="nx-faq-title">
      <div className="lp-wrap">
        <Rv className="nx-head">
          <h2 className="nx-h2" id="nx-faq-title">Ada pertanyaan? <em>Ini jawabannya.</em></h2>
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
