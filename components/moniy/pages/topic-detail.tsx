'use client';

import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { teacherDashboardRepository } from '@/lib/moniy/repository';
import type { TopicChoice, TopicReport, TopicStudentReport } from '@/lib/moniy/types';
import { EmptyState } from './page-primitives';

const rupiah = (value: number) => `Rp${value.toLocaleString('id-ID')}`;

const VERDICT: Record<TopicChoice['verdict'], { label: string; chip: string }> = {
  cerdas: { label: 'Cerdas', chip: 'status-done' },
  biasa: { label: 'Cukup', chip: 'status-progress' },
  buruk: { label: 'Kurang tepat', chip: 'status-not-started' },
};

function goalChip(student: TopicStudentReport) {
  if (student.reachedGoal === true) return <span className="status-chip status-done">Mencapai target</span>;
  if (student.reachedGoal === false) return <span className="status-chip status-not-started">Belum mencapai target</span>;
  return <span className="status-chip status-progress">{student.status === 'Belum' ? 'Belum mulai' : 'Belum selesai'}</span>;
}

export function TopicDetail({ classId, topicId, onBack }: { classId: string; topicId: string; onBack: () => void }) {
  const [report, setReport] = useState<TopicReport | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    teacherDashboardRepository.getTopicReport(classId, topicId).then(
      (data) => { if (active) setReport(data); },
      () => { if (active) setFailed(true); },
    );
    return () => { active = false; };
  }, [classId, topicId]);

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="page-kicker">Detail topik</span>
          <h1>{report?.topicName ?? 'Memuat topik...'}</h1>
          <p>Nilai, ketercapaian target tabungan, dan pilihan tindakan setiap siswa.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onBack}><ArrowLeft size={18} /> Kembali</button>
      </section>

      {failed ? <EmptyState title="Detail belum bisa dimuat" description="Coba muat ulang halaman ini." /> : null}

      {report ? <>
        <section className="metric-grid">
          <article className="metric-card metric-blue"><div><p>Rata-rata nilai</p><strong>{report.averageScore ?? '-'}</strong><span>dari {report.finishedCount} siswa yang selesai</span></div></article>
          <article className="metric-card metric-green"><div><p>Mencapai target</p><strong>{report.reachedGoalCount}</strong><span>saldo akhir sama atau di atas target</span></div></article>
          <article className="metric-card metric-orange"><div><p>Belum mencapai target</p><strong>{report.missedGoalCount}</strong><span>selesai, tetapi saldo di bawah target</span></div></article>
          <article className="metric-card metric-cyan"><div><p>Selesai</p><strong>{report.finishedCount}/{report.studentCount}</strong><span>siswa menamatkan simulasi</span></div></article>
        </section>

        <article className="surface-card data-table-card">
          <div className="section-heading-row"><div><h2>Siswa dan pilihannya</h2><p>Buka satu siswa untuk melihat tindakan yang dipilih di setiap langkah.</p></div></div>
          {report.students.length ? <div className="topic-student-list">{report.students.map((student) => (
            <details className="topic-student" key={student.id}>
              <summary>
                <span className="topic-student-name"><strong>{student.name}</strong></span>
                <span className="topic-student-meta">
                  <b>{student.score ?? '-'}</b>
                  <span>{student.finalCash !== null && student.goal !== null ? `${rupiah(student.finalCash)} dari target ${rupiah(student.goal)}` : 'Saldo belum tersedia'}</span>
                  {goalChip(student)}
                </span>
                <ChevronDown size={18} className="topic-student-caret" />
              </summary>
              {student.choices.length ? <ol className="decision-timeline">{student.choices.map((choice, index) => {
                const verdict = VERDICT[choice.verdict] ?? VERDICT.biasa;
                return <li className="topic-choice" key={`${student.id}-${index}`}>
                  <span className="topic-choice-step">{index + 1}</span>
                  <div>
                    <strong>{choice.question}</strong>
                    <p className="topic-choice-answer">{choice.answer}</p>
                    <span className="topic-choice-foot"><span className={`status-chip ${verdict.chip}`}>{verdict.label}</span> Saldo setelahnya {rupiah(choice.cashAfter)}</span>
                  </div>
                </li>;
              })}</ol> : <p className="topic-empty">Siswa ini belum memilih tindakan apa pun.</p>}
            </details>
          ))}</div> : <EmptyState title="Belum ada siswa" description="Kelas ini belum memiliki siswa." />}
        </article>
      </> : !failed ? <p className="topic-empty">Memuat data...</p> : null}
    </div>
  );
}
