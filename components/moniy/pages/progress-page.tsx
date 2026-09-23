'use client';

import { CircleAlert, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { ClassroomSnapshot } from '@/lib/moniy/types';
import { EmptyState } from './page-primitives';

export function ProgressPage({ snapshot }: { snapshot: ClassroomSnapshot }) {
  const [selectedTopicId, setSelectedTopicId] = useState(snapshot.topics[0]?.id ?? '');
  const [category, setCategory] = useState('semua');
  const visibleTopics = snapshot.topics.filter((topic) => category === 'semua' || topic.category === category);
  const selected = snapshot.topics.find((topic) => topic.id === selectedTopicId) ?? visibleTopics[0];
  const categories = Array.from(new Set(snapshot.topics.map((topic) => topic.category)));

  return (
    <div className="page-stack">
      <section className="page-intro"><div><span className="page-kicker">Progres belajar</span><h1>Pahami pola keputusan kelas</h1><p>Bandingkan penyelesaian, nilai kuis, dan pola keputusan pada setiap topik.</p></div><label className="compact-select"><span>Kelompok topik</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="semua">Semua topik</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></section>

      <article className="surface-card data-table-card">
        <div className="section-heading-row"><div><h2>Ringkasan per topik</h2><p>Pilih satu baris untuk membuka pola keputusan yang perlu diperhatikan.</p></div><span className="mock-data-label">Data contoh</span></div>
        {visibleTopics.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Topik</th><th>Belum</th><th>Berjalan</th><th>Selesai</th><th>Nilai kuis</th><th>Keputusan benar</th></tr></thead><tbody>{visibleTopics.map((topic) => <tr key={topic.id} className={selected?.id === topic.id ? 'selected-row' : ''}><td><button className="topic-row-button" type="button" onClick={() => setSelectedTopicId(topic.id)} aria-label={`Pilih ${topic.name}`}><strong>{topic.name}</strong><span>{topic.category}</span></button></td><td>{topic.notStarted}</td><td>{topic.inProgress}</td><td>{topic.completed}</td><td><b>{topic.quizAverage}</b></td><td><div className="table-rate"><span>{topic.correctRate}%</span><progress max={100} value={topic.correctRate} aria-label={`Keputusan benar ${topic.correctRate}%`} /></div></td></tr>)}</tbody></table></div> : <EmptyState title="Belum ada data topik" description="Coba pilih kelas atau periode lain." />}
      </article>

      {selected ? <section className="progress-detail-grid">
        <article className="surface-card mistake-card">
          <span className="card-icon orange"><CircleAlert size={22} /></span><h2>Keputusan yang paling sering keliru</h2><p>{selected.commonMistake}</p>
          <div className="mistake-number"><strong>{selected.mistakeRate}%</strong><span>siswa memilih keputusan yang perlu direfleksikan</span></div>
          <div className="answer-split"><span><i className="answer-wrong" /> Perlu refleksi {selected.mistakeRate}%</span><span><i className="answer-right" /> Tepat {100 - selected.mistakeRate}%</span></div>
        </article>
        <article className="surface-card recommendation-card">
          <div className="insight-topline"><span className="card-icon blue"><Sparkles size={21} /></span><span className="ai-label"><Sparkles size={14} /> Dibantu AI</span></div><h2>Saran tindak lanjut</h2><p>{snapshot.recommendation}</p>
          <div className="recommendation-steps"><div><span>1</span><p><strong>Bandingkan pilihan</strong>Tampilkan dua skenario dengan tingkat risiko berbeda.</p></div><div><span>2</span><p><strong>Ajak siswa memberi alasan</strong>Fokus pada proses berpikir, bukan hanya jawaban akhir.</p></div></div>
          <button className="primary-button" type="button" onClick={() => window.alert('Contoh bahan refleksi disiapkan. Belum ada layanan AI atau penyimpanan yang terhubung.')}>Siapkan bahan refleksi</button>
        </article>
      </section> : null}
    </div>
  );
}
