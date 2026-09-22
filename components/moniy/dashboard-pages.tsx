'use client';

import Image from 'next/image';
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Download,
  FileSpreadsheet,
  GraduationCap,
  HandHeart,
  Lightbulb,
  LockKeyhole,
  MessageCircleMore,
  Search,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UsersRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { ClassroomSnapshot, CommunityPost, LearningStatus, Student } from '@/lib/moniy/types';

type Navigate = (page: string) => void;

const statusClass = (status: LearningStatus) => {
  if (status === 'Selesai') return 'status-chip status-done';
  if (status === 'Berjalan') return 'status-chip status-progress';
  return 'status-chip status-not-started';
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <Search size={28} />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function OverviewPage({ snapshot, navigate }: { snapshot: ClassroomSnapshot; navigate: Navigate }) {
  const pendingPosts = snapshot.communityPosts.filter((post) => !post.reviewed).slice(0, 2);
  const weakTopic = [...snapshot.topics].sort((a, b) => a.correctRate - b.correctRate)[0];
  const metrics = [
    { label: 'Nilai rata-rata', value: snapshot.averageScore.toFixed(1), helper: '+3,2 dari bulan lalu', icon: GraduationCap, tone: 'blue' },
    { label: 'Modul selesai', value: `${snapshot.completionRate}%`, helper: `${Math.round(snapshot.studentCount * snapshot.completionRate / 100)} dari ${snapshot.studentCount} siswa`, icon: BookOpenCheck, tone: 'cyan' },
    { label: 'Perlu penguatan', value: String(snapshot.supportCount), helper: 'Berdasarkan progres belajar', icon: HandHeart, tone: 'orange' },
    { label: 'Kerentanan kelas', value: snapshot.riskLevel, helper: `${snapshot.riskEventCount} kejadian anonim`, icon: ShieldQuestion, tone: snapshot.riskLevel === 'Rendah' ? 'green' : 'orange' },
  ];

  return (
    <div className="page-stack">
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="page-kicker">Ringkasan hari ini</span>
          <h1>Selamat datang, Bu Rani!</h1>
          <p><strong>{snapshot.className}</strong> sedang bertumbuh. Ada {snapshot.supportCount} siswa yang mungkin membutuhkan penguatan belajar.</p>
          <button className="welcome-action" type="button" onClick={() => navigate('progress')}>
            Lihat progres kelas <ArrowRight size={18} />
          </button>
        </div>
        <Image className="welcome-mascot" src="/assets/moniy-mascot-face.png" alt="Maskot MONIY" width={220} height={220} priority />
      </section>

      <section className="metric-grid" aria-label="Metrik kelas">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className={`metric-card metric-${metric.tone}`} key={metric.label}>
              <span className="metric-icon"><Icon size={23} /></span>
              <div><p>{metric.label}</p><strong>{metric.value}</strong><span>{metric.helper}</span></div>
            </article>
          );
        })}
      </section>

      <section className="overview-grid">
        <article className="surface-card topic-overview-card">
          <div className="section-heading-row">
            <div><h2>Progres per topik</h2><p>Lihat tingkat penyelesaian dan penguasaan kelas.</p></div>
            <button className="text-action" type="button" onClick={() => navigate('progress')}>Buka detail <ChevronRight size={17} /></button>
          </div>
          {snapshot.topics.length ? (
            <div className="topic-progress-list">
              {snapshot.topics.map((topic) => (
                <div className="topic-progress-row" key={topic.id}>
                  <div className="topic-progress-meta">
                    <div><strong>{topic.name}</strong><span>{topic.completed} siswa selesai</span></div>
                    <b>{topic.correctRate}% benar</b>
                  </div>
                  <div className="thin-progress" aria-label={`${topic.correctRate}% keputusan benar`}><span style={{ width: `${topic.correctRate}%` }} /></div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="Belum ada progres" description="Data topik akan muncul setelah siswa memulai modul." />}
        </article>

        <article className="surface-card insight-card">
          <div className="insight-topline">
            <span className="insight-icon"><BrainCircuit size={23} /></span>
            <span className="ai-label"><Sparkles size={14} /> Dibantu AI</span>
          </div>
          <h2>Pola pemahaman kelas</h2>
          <p>{snapshot.insight}</p>
          {weakTopic && <div className="insight-focus"><Lightbulb size={18} /><span><strong>Fokus berikutnya:</strong> {weakTopic.commonMistake}.</span></div>}
          <button className="secondary-button" type="button" onClick={() => navigate('progress')}>Lihat saran tindak lanjut</button>
          <small>Rekomendasi ini membantu guru. Keputusan pembelajaran tetap ditentukan oleh guru.</small>
        </article>
      </section>

      <section className="overview-grid lower-overview-grid">
        <article className="surface-card compact-card">
          <div className="section-heading-row">
            <div><h2>Sinyal perlindungan kelas</h2><p>Agregat anonim untuk pembinaan kolektif.</p></div>
            <span className={`risk-level risk-${snapshot.riskLevel.toLowerCase()}`}>{snapshot.riskLevel}</span>
          </div>
          <div className="risk-mini-row">
            <ShieldCheck size={31} />
            <div><strong>{snapshot.riskEventCount} kejadian terdeteksi</strong><span>{snapshot.riskDelta > 0 ? 'Meningkat' : 'Menurun'} {Math.abs(snapshot.riskDelta)}% dari periode lalu</span></div>
          </div>
          <button className="text-action" type="button" onClick={() => navigate('risk')}>Buka peringatan kelas <ArrowRight size={17} /></button>
        </article>

        <article className="surface-card compact-card">
          <div className="section-heading-row">
            <div><h2>Perlu ditinjau</h2><p>Hasil Simulasi Bisnis terbaru.</p></div>
            <button className="text-action" type="button" onClick={() => navigate('community')}>Lihat semua</button>
          </div>
          {pendingPosts.length ? pendingPosts.map((post) => (
            <button className="community-mini-row" type="button" key={post.id} onClick={() => navigate('community')}>
              <span className="student-avatar">{post.initials}</span>
              <span><strong>{post.title}</strong><small>{post.studentName}, {post.submittedAt}</small></span>
              <ChevronRight size={17} />
            </button>
          )) : <EmptyState title="Semua sudah ditinjau" description="Tidak ada postingan yang menunggu." />}
        </article>
      </section>
    </div>
  );
}

export function ProgressPage({ snapshot }: { snapshot: ClassroomSnapshot }) {
  const [selectedTopicId, setSelectedTopicId] = useState(snapshot.topics[0]?.id ?? '');
  const [category, setCategory] = useState('semua');
  const visibleTopics = snapshot.topics.filter((topic) => category === 'semua' || topic.category === category);
  const selected = snapshot.topics.find((topic) => topic.id === selectedTopicId) ?? visibleTopics[0];
  const categories = Array.from(new Set(snapshot.topics.map((topic) => topic.category)));

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div><span className="page-kicker">G3 dan G4</span><h1>Progres belajar</h1><p>Bandingkan penyelesaian, nilai kuis, dan pola keputusan pada setiap topik.</p></div>
        <label className="compact-select"><span>Kelompok topik</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="semua">Semua topik</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      </section>

      <article className="surface-card data-table-card">
        <div className="section-heading-row"><div><h2>Ringkasan per topik</h2><p>Pilih satu baris untuk membuka pola keputusan yang perlu diperhatikan.</p></div><span className="mock-data-label">Data contoh</span></div>
        {visibleTopics.length ? (
          <div className="table-scroll"><table className="data-table"><thead><tr><th>Topik</th><th>Belum</th><th>Berjalan</th><th>Selesai</th><th>Nilai kuis</th><th>Keputusan benar</th></tr></thead><tbody>
            {visibleTopics.map((topic) => (
              <tr key={topic.id} className={selected?.id === topic.id ? 'selected-row' : ''}>
                <td><button className="topic-row-button" type="button" onClick={() => setSelectedTopicId(topic.id)} aria-label={`Pilih ${topic.name}`}><strong>{topic.name}</strong><span>{topic.category}</span></button></td><td>{topic.notStarted}</td><td>{topic.inProgress}</td><td>{topic.completed}</td><td><b>{topic.quizAverage}</b></td><td><div className="table-rate"><span>{topic.correctRate}%</span><progress max={100} value={topic.correctRate} aria-label={`Keputusan benar ${topic.correctRate}%`} /></div></td>
              </tr>
            ))}
          </tbody></table></div>
        ) : <EmptyState title="Belum ada data topik" description="Coba pilih kelas atau periode lain." />}
      </article>

      {selected && <section className="progress-detail-grid">
        <article className="surface-card mistake-card">
          <span className="card-icon orange"><CircleAlert size={22} /></span>
          <h2>Keputusan yang paling sering keliru</h2>
          <p>{selected.commonMistake}</p>
          <div className="mistake-number"><strong>{selected.mistakeRate}%</strong><span>siswa memilih keputusan yang perlu direfleksikan</span></div>
          <div className="answer-split"><span><i className="answer-wrong" /> Perlu refleksi {selected.mistakeRate}%</span><span><i className="answer-right" /> Tepat {100 - selected.mistakeRate}%</span></div>
        </article>
        <article className="surface-card recommendation-card">
          <div className="insight-topline"><span className="card-icon blue"><Sparkles size={21} /></span><span className="ai-label"><Sparkles size={14} /> Dibantu AI</span></div>
          <h2>Saran tindak lanjut</h2>
          <p>{snapshot.recommendation}</p>
          <div className="recommendation-steps">
            <div><span>1</span><p><strong>Bandingkan pilihan</strong>Tampilkan dua skenario dengan tingkat risiko berbeda.</p></div>
            <div><span>2</span><p><strong>Ajak siswa memberi alasan</strong>Fokus pada proses berpikir, bukan hanya jawaban akhir.</p></div>
          </div>
          <button className="primary-button" type="button" onClick={() => window.alert('Contoh bahan refleksi disiapkan. Belum ada layanan AI atau penyimpanan yang terhubung.')}>Siapkan bahan refleksi</button>
        </article>
      </section>}
    </div>
  );
}

export function StudentsPage({ snapshot }: { snapshot: ClassroomSnapshot }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedId, setSelectedId] = useState(snapshot.students[0]?.id ?? '');
  const filtered = snapshot.students.filter((student) => {
    const matchesQuery = `${student.name} ${student.activeModule}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || student.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const selected = snapshot.students.find((student) => student.id === selectedId) ?? filtered[0];

  return (
    <div className="page-stack">
      <section className="page-intro"><div><span className="page-kicker">G1 dan G2</span><h1>Rekam siswa</h1><p>Buka riwayat keputusan belajar individual. Data Perisai Judi tidak pernah tampil di halaman ini.</p></div><span className="privacy-badge"><LockKeyhole size={16} /> Terpisah dari data perlindungan</span></section>
      <section className="student-layout">
        <article className="surface-card student-list-card">
          <div className="student-toolbar">
            <label className="search-input"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau modul" aria-label="Cari siswa" /></label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter status siswa"><option>Semua</option><option>Belum</option><option>Berjalan</option><option>Selesai</option></select>
          </div>
          {filtered.length ? <div className="student-list">
            {filtered.map((student) => <StudentRow student={student} selected={selected?.id === student.id} onSelect={() => setSelectedId(student.id)} key={student.id} />)}
          </div> : <EmptyState title="Siswa tidak ditemukan" description="Ubah kata kunci atau filter status." />}
        </article>
        <aside className="surface-card student-detail-card">
          {selected ? <StudentDetail student={selected} /> : <EmptyState title="Pilih siswa" description="Riwayat keputusan akan muncul di sini." />}
        </aside>
      </section>
    </div>
  );
}

function StudentRow({ student, selected, onSelect }: { student: Student; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`student-list-row ${selected ? 'is-selected' : ''}`} type="button" onClick={onSelect}>
      <span className="student-avatar">{student.initials}</span>
      <span className="student-main"><strong>{student.name}</strong><small>{student.activeModule}</small></span>
      <span className={statusClass(student.status)}>{student.status}</span>
      <span className="student-score">{student.score ?? '-'}</span>
      <ChevronRight size={17} />
    </button>
  );
}

function StudentDetail({ student }: { student: Student }) {
  const progress = Math.round(student.completedTopics / student.totalTopics * 100);
  return (
    <div className="student-detail">
      <div className="student-detail-head"><span className="student-avatar large">{student.initials}</span><div><h2>{student.name}</h2><p>{student.activeModule}</p></div></div>
      <div className="student-detail-stats"><div><span>Progres</span><strong>{student.completedTopics}/{student.totalTopics} topik</strong></div><div><span>Nilai kuis</span><strong>{student.score ?? 'Belum ada'}</strong></div></div>
      <div className="thin-progress student-progress" aria-label={`Progres ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
      <div className="detail-section-title"><h3>Keputusan terbaru</h3><span>Data belajar individual</span></div>
      {student.decisions.length ? <div className="decision-timeline">{student.decisions.map((decision) => (
        <div className="decision-item" key={decision.id}>
          <span className={decision.outcome === 'tepat' ? 'decision-dot good' : 'decision-dot reflect'}>{decision.outcome === 'tepat' ? <Check size={13} /> : <Lightbulb size={13} />}</span>
          <div><strong>{decision.title}</strong><span>{decision.chapter} | {decision.time}</span><p>{decision.note}</p></div>
        </div>
      ))}</div> : <EmptyState title="Belum ada keputusan" description="Siswa belum memulai sesi storytelling." />}
      <div className="student-privacy-note"><LockKeyhole size={16} /><p><strong>Batas privasi</strong>Halaman ini tidak memuat kejadian Perisai Anti Judi Online.</p></div>
    </div>
  );
}

export function RiskPage({ snapshot }: { snapshot: ClassroomSnapshot }) {
  const isImproving = snapshot.riskDelta < 0;
  const max = Math.max(...snapshot.riskTrend.map((item) => item.events), 1);
  return (
    <div className="page-stack">
      <section className="risk-hero">
        <div className="risk-hero-copy">
          <span className="page-kicker">Agregat anonim</span>
          <h1>Peringatan judi online</h1>
          <p>Sinyal preventif pada tingkat kelas untuk membantu pembinaan kolektif bersama guru BK.</p>
          <div className="risk-summary-line"><span className={`risk-level risk-${snapshot.riskLevel.toLowerCase()}`}>{snapshot.riskLevel}</span><span>{isImproving ? <TrendingDown size={18} /> : <TrendingUp size={18} />} {Math.abs(snapshot.riskDelta)}% dari periode lalu</span></div>
        </div>
        <Image className="risk-hero-image" src={isImproving ? '/assets/moniy-risk-safe.png' : '/assets/moniy-risk-alert.png'} alt="Maskot MONIY mendampingi keamanan finansial digital" width={760} height={415} />
      </section>

      <section className="risk-grid">
        <article className="surface-card trend-card">
          <div className="section-heading-row"><div><h2>Tren kejadian anonim</h2><p>Jumlah deteksi agregat, bukan jumlah siswa.</p></div><strong className="event-total">{snapshot.riskEventCount}<span>kejadian</span></strong></div>
          {snapshot.riskTrend.length ? <div className="bar-chart" aria-label="Grafik kejadian anonim tujuh hari">{snapshot.riskTrend.map((item) => <div className="bar-column" key={item.label}><span>{item.events}</span><div><i style={{ height: `${Math.max(12, item.events / max * 100)}%` }} /></div><small>{item.label}</small></div>)}</div> : <EmptyState title="Belum ada tren" description="Data agregat akan tampil saat tersedia." />}
        </article>
        <article className="surface-card coaching-card">
          <span className="card-icon blue"><UsersRound size={23} /></span>
          <h2>Tindak lanjut yang disarankan</h2>
          <p>Fokuskan respons pada edukasi kelas, bukan pemeriksaan individu.</p>
          <div className="coaching-list"><div><MessageCircleMore size={20} /><span><strong>Refleksi kelas 15 menit</strong>Bahas ciri tawaran untung cepat dan dampaknya.</span></div><div><HandHeart size={20} /><span><strong>Koordinasi dengan guru BK</strong>Gunakan pendekatan preventif untuk seluruh kelas.</span></div></div>
          <button className="primary-button" type="button" onClick={() => window.alert('Panduan pembinaan demo dibuka. Tidak ada data siswa individual di fitur ini.')}>Buka panduan pembinaan</button>
        </article>
      </section>

      <section className="privacy-panel"><span><LockKeyhole size={24} /></span><div><h2>Privasi siswa tetap terlindungi</h2><p>Dashboard tidak menyediakan nama, pencarian siswa, isi layar, riwayat perangkat, atau drill-down individual dari data Perisai.</p></div><strong>Hanya tingkat kelas</strong></section>
    </div>
  );
}

export function CommunityPage({ snapshot, onReview }: { snapshot: ClassroomSnapshot; onReview: (postId: string) => Promise<void> }) {
  const [filter, setFilter] = useState<'pending' | 'reviewed' | 'all'>('pending');
  const [selected, setSelected] = useState<CommunityPost | null>(null);
  const [saving, setSaving] = useState(false);
  const posts = snapshot.communityPosts.filter((post) => filter === 'all' || (filter === 'pending' ? !post.reviewed : post.reviewed));

  const markReviewed = async () => {
    if (!selected) return;
    setSaving(true);
    await onReview(selected.id);
    setSaving(false);
    setSelected(null);
  };

  return (
    <div className="page-stack">
      <section className="page-intro"><div><span className="page-kicker">Monitoring komunitas</span><h1>Komunitas kelas</h1><p>Tinjau hasil Simulasi Bisnis untuk bahan umpan balik dan presentasi.</p></div><fieldset className="segmented-control" aria-label="Filter status tinjauan"><button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Belum ditinjau</button><button className={filter === 'reviewed' ? 'active' : ''} onClick={() => setFilter('reviewed')}>Sudah ditinjau</button><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Semua</button></fieldset></section>
      {posts.length ? <section className="community-grid">{posts.map((post) => (
        <article className="community-card" key={post.id}>
          <div className="community-card-head"><span className="student-avatar large">{post.initials}</span><div><strong>{post.studentName}</strong><span>{post.submittedAt}</span></div><span className={post.reviewed ? 'status-chip status-done' : 'status-chip status-not-started'}>{post.reviewed ? 'Sudah ditinjau' : 'Belum ditinjau'}</span></div>
          <div className="business-visual"><span><FileSpreadsheet size={35} /></span><small>{post.businessType}</small></div>
          <h2>{post.title}</h2><p>{post.epilogue}</p>
          <button className={post.reviewed ? 'secondary-button' : 'primary-button'} type="button" onClick={() => setSelected(post)}>{post.reviewed ? 'Buka hasil' : 'Tinjau hasil'} <ArrowRight size={17} /></button>
        </article>
      ))}</section> : <div className="surface-card"><EmptyState title="Tidak ada postingan" description="Tidak ada hasil komunitas untuk filter ini." /></div>}

      {selected && <dialog open className="modal-backdrop"><section className="detail-modal" aria-labelledby="community-detail-title">
        <button className="modal-close" onClick={() => setSelected(null)} aria-label="Tutup detail"><X size={20} /></button>
        <span className="page-kicker">Hasil Simulasi Bisnis</span><h2 id="community-detail-title">{selected.title}</h2><p className="modal-lead">{selected.studentName} | {selected.businessType}</p>
        <div className="modal-result"><CheckCircle2 size={23} /><div><strong>{selected.epilogue}</strong><p>{selected.summary}</p></div></div>
        <div className="modal-section"><h3>Catatan guru</h3><textarea placeholder="Tulis umpan balik contoh untuk hasil ini..." rows={4} /></div>
        <div className="modal-actions"><button className="secondary-button" onClick={() => setSelected(null)}>Tutup</button>{!selected.reviewed && <button className="primary-button" onClick={markReviewed} disabled={saving}>{saving ? 'Menyimpan...' : 'Tandai sudah ditinjau'}</button>}</div>
        <small className="mock-modal-note">Aksi ini hanya mengubah state frontend pada data contoh.</small>
      </section></dialog>}
    </div>
  );
}

export function ReportsPage({ snapshot, className, periodLabel }: { snapshot: ClassroomSnapshot; className: string; periodLabel: string }) {
  const [includeLearning, setIncludeLearning] = useState(true);
  const [includeDecisions, setIncludeDecisions] = useState(true);
  const [includeRisk, setIncludeRisk] = useState(true);
  const [includeCommunity, setIncludeCommunity] = useState(false);
  const [exported, setExported] = useState(false);

  const exportMockReport = () => {
    const sections: string[] = [];
    sections.push(`<h1>Laporan Kelas MONIY</h1><p>Kelas: ${className}</p><p>Periode: ${periodLabel}</p><p>Dokumen contoh frontend</p>`);
    if (includeLearning) sections.push(`<h2>Progres Belajar</h2><table border="1"><tr><th>Topik</th><th>Nilai Kuis</th><th>Keputusan Benar</th></tr>${snapshot.topics.map((topic) => `<tr><td>${topic.name}</td><td>${topic.quizAverage}</td><td>${topic.correctRate}%</td></tr>`).join('')}</table>`);
    if (includeDecisions) sections.push(`<h2>Rekam Belajar Siswa</h2><table border="1"><tr><th>Siswa</th><th>Modul Aktif</th><th>Status</th><th>Nilai</th></tr>${snapshot.students.map((student) => `<tr><td>${student.name}</td><td>${student.activeModule}</td><td>${student.status}</td><td>${student.score ?? '-'}</td></tr>`).join('')}</table>`);
    if (includeRisk) sections.push(`<h2>Kerentanan Judi Online</h2><p>Tingkat kelas: ${snapshot.riskLevel}</p><p>Jumlah kejadian anonim: ${snapshot.riskEventCount}</p><p>Data ini agregat dan tidak memuat identitas siswa.</p>`);
    if (includeCommunity) sections.push(`<h2>Komunitas Kelas</h2><table border="1"><tr><th>Judul</th><th>Siswa</th><th>Status Tinjauan</th></tr>${snapshot.communityPosts.map((post) => `<tr><td>${post.title}</td><td>${post.studentName}</td><td>${post.reviewed ? 'Sudah' : 'Belum'}</td></tr>`).join('')}</table>`);
    const blob = new Blob([`<html><head><meta charset="utf-8"></head><body>${sections.join('')}</body></html>`], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MONIY_${className.replaceAll(' ', '_')}_contoh.xls`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  const reportItems = [
    { checked: includeLearning, setChecked: setIncludeLearning, title: 'Progres belajar', text: 'Status topik, nilai kuis, dan pola benar-salah.' },
    { checked: includeDecisions, setChecked: setIncludeDecisions, title: 'Rekam keputusan siswa', text: 'Riwayat belajar individual untuk tindak lanjut pedagogis.' },
    { checked: includeRisk, setChecked: setIncludeRisk, title: 'Kerentanan judi tingkat kelas', text: 'Hanya angka agregat anonim dan rekomendasi pembinaan.' },
    { checked: includeCommunity, setChecked: setIncludeCommunity, title: 'Komunitas kelas', text: 'Hasil Simulasi Bisnis dan status tinjauan.' },
  ];

  return (
    <div className="page-stack">
      <section className="page-intro"><div><span className="page-kicker">G6</span><h1>Laporan kelas</h1><p>Pilih data yang perlu didokumentasikan, tinjau isinya, lalu ekspor file contoh.</p></div><span className="privacy-badge"><ShieldCheck size={16} /> Kerentanan tetap agregat</span></section>
      <section className="report-layout">
        <article className="surface-card report-builder">
          <div className="section-heading-row"><div><h2>Isi laporan</h2><p>Pilihan mengikuti kelas dan periode pada header.</p></div><span className="mock-data-label">Ekspor mock</span></div>
          <div className="report-context"><div><span>Kelas</span><strong>{className}</strong></div><div><span>Periode</span><strong>{periodLabel}</strong></div></div>
          <div className="report-checkboxes">{reportItems.map((item) => <label key={item.title} aria-label={item.title}><input type="checkbox" checked={item.checked} onChange={(event) => item.setChecked(event.target.checked)} /><span><strong>{item.title}</strong><small>{item.text}</small></span></label>)}</div>
          <div className="report-privacy"><LockKeyhole size={18} /><p>Bagian kerentanan judi tidak pernah menyertakan nama atau identitas siswa.</p></div>
          <button className="primary-button export-button" type="button" onClick={exportMockReport} disabled={!reportItems.some((item) => item.checked)}><Download size={18} /> Unduh Excel contoh</button>
          {exported && <output className="export-success"><CheckCircle2 size={17} /> File contoh berhasil dibuat di perangkat Anda.</output>}
        </article>

        <aside className="report-preview">
          <div className="report-paper">
            <div className="report-paper-head"><Image src="/assets/moniy-logo.png" alt="Moniy" width={128} height={37} /><span>PRATINJAU</span></div>
            <h2>Laporan Kelas</h2><p>{className} | {periodLabel}</p>
            <div className="preview-metrics"><div><strong>{snapshot.averageScore.toFixed(1)}</strong><span>Nilai rata-rata</span></div><div><strong>{snapshot.completionRate}%</strong><span>Modul selesai</span></div></div>
            {includeLearning && <div className="preview-section"><h3>Progres belajar</h3>{snapshot.topics.slice(0, 3).map((topic) => <div key={topic.id}><span>{topic.name}</span><strong>{topic.correctRate}%</strong></div>)}</div>}
            {includeRisk && <div className="preview-risk"><ShieldCheck size={18} /><p><strong>Kerentanan kelas: {snapshot.riskLevel}</strong>{snapshot.riskEventCount} kejadian anonim pada periode ini.</p></div>}
            <small>Pratinjau data contoh. Format final dapat disesuaikan saat backend terhubung.</small>
          </div>
        </aside>
      </section>
    </div>
  );
}
