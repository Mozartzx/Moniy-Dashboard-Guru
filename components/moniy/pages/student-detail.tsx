'use client';

import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { teacherDashboardRepository } from '@/lib/moniy/repository';
import type { StudentConclusion, StudentReport, StudentStory, TopicChoice } from '@/lib/moniy/types';
import { EmptyState } from './page-primitives';

const rupiah = (value: number) => `Rp${value.toLocaleString('id-ID')}`;

const VERDICT: Record<TopicChoice['verdict'], { label: string; chip: string }> = {
  cerdas: { label: 'Cerdas', chip: 'status-done' },
  biasa: { label: 'Cukup', chip: 'status-progress' },
  buruk: { label: 'Kurang tepat', chip: 'status-not-started' },
};

export const LEVEL: Record<NonNullable<StudentConclusion['level']>, { label: string; chip: string }> = {
  tepat: { label: 'Tepat', chip: 'status-done' },
  hampir: { label: 'Hampir tepat', chip: 'status-progress' },
  perlu_penguatan: { label: 'Perlu penguatan', chip: 'status-not-started' },
};

export function Exchange({ title, student, ai }: { title: string; student: string | null; ai: string | null }) {
  if (!student && !ai) return null;
  return (
    <div className="exchange">
      <h4>{title}</h4>
      {student ? <div className="exchange-bubble exchange-student"><span>Jawaban siswa</span><p>{student}</p></div> : null}
      {ai ? <div className="exchange-bubble exchange-moni"><span>Tanggapan Moni</span><p>{ai}</p></div> : null}
    </div>
  );
}

function StoryCard({ story }: { story: StudentStory }) {
  return (
    <details className="topic-student student-story">
      <summary>
        <span className="topic-student-name"><strong>{story.title}</strong><small>{story.chapter}</small></span>
        <span className="topic-student-meta">
          <b>{story.score ?? '-'}</b>
          <span>{story.finalCash !== null && story.goal !== null ? `${rupiah(story.finalCash)} dari target ${rupiah(story.goal)}` : `${story.choices.length} pilihan`}</span>
          <span className={`status-chip ${story.status === 'Selesai' ? 'status-done' : 'status-progress'}`}>{story.status}</span>
        </span>
        <ChevronDown size={18} className="topic-student-caret" />
      </summary>
      <div className="student-story-body">
        <section>
          <h3>Pilihan di setiap langkah</h3>
          {story.choices.length ? <ol className="decision-timeline">{story.choices.map((choice, index) => {
            const verdict = VERDICT[choice.verdict] ?? VERDICT.biasa;
            return <li className="topic-choice" key={index}>
              <span className="topic-choice-step">{index + 1}</span>
              <div>
                <strong>{choice.question}</strong>
                <p className="topic-choice-answer">{choice.answer}</p>
                {choice.consequence ? <p className="topic-choice-answer student-consequence">{choice.consequence}</p> : null}
                <span className="topic-choice-foot"><span className={`status-chip ${verdict.chip}`}>{verdict.label}</span> Saldo setelahnya {rupiah(choice.cashAfter)}</span>
              </div>
            </li>;
          })}</ol> : <p className="topic-empty">Belum ada pilihan yang tercatat.</p>}
        </section>
        <section>
          <h3>Refleksi</h3>
          {story.reflections.length ? story.reflections.map((item, index) => <div className="student-block" key={index}>
            <p className="student-block-meta">{item.kind === 'refresh' ? 'Refleksi harian' : 'Refleksi cerita'} | {item.time}</p>
            {item.mostImpactful ? <p className="student-block-note">Keputusan paling berpengaruh menurut siswa: <strong>{item.mostImpactful}</strong></p> : null}
            <Exchange title="Alasan siswa" student={item.why} ai={item.aiFeedback} />
            <Exchange title="Yang akan dilakukan berbeda" student={item.doDifferently} ai={null} />
            {item.aiInsight ? <p className="student-block-note">Rangkuman sebab-akibat: {item.aiInsight}</p> : null}
          </div>) : <p className="topic-empty">Siswa belum menulis refleksi.</p>}
        </section>
        <section>
          <h3>Kesimpulan</h3>
          {story.conclusions.length ? story.conclusions.map((item) => {
            const level = item.level ? LEVEL[item.level] : null;
            return <div className="student-block" key={item.attempt}>
              <p className="student-block-meta">Percobaan {item.attempt} | {item.time} {level ? <span className={`status-chip ${level.chip}`}>{level.label}</span> : null}</p>
              <Exchange title="Kesimpulan siswa" student={item.text} ai={item.aiFeedback} />
              {item.aiReinforcement ? <p className="student-block-note">Penguatan dari Moni: {item.aiReinforcement}</p> : null}
            </div>;
          }) : <p className="topic-empty">Siswa belum menulis kesimpulan.</p>}
        </section>
      </div>
    </details>
  );
}

export function StudentDetail({ classId, studentId, onBack }: { classId: string; studentId: string; onBack: () => void }) {
  const [report, setReport] = useState<StudentReport | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    teacherDashboardRepository.getStudentReport(classId, studentId).then(
      (data) => { if (active) setReport(data); },
      () => { if (active) setFailed(true); },
    );
    return () => { active = false; };
  }, [classId, studentId]);

  const progress = report && report.totalTopics ? Math.round((report.completedTopics / report.totalTopics) * 100) : 0;

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="page-kicker">Detail siswa</span>
          <h1>{report?.name ?? 'Memuat siswa...'}</h1>
          <p>Riwayat cerita, pilihan jawaban, refleksi, dan kesimpulan siswa ini.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onBack}><ArrowLeft size={18} /> Kembali</button>
      </section>

      {failed ? <EmptyState title="Detail belum bisa dimuat" description="Coba muat ulang halaman ini." /> : null}

      {report ? <>
        <section className="metric-grid">
          <article className="metric-card metric-blue"><div><p>Nilai siswa</p><strong>{report.score ?? '-'}</strong><span>rata-rata dari cerita yang selesai</span></div></article>
          <article className="metric-card metric-green"><div><p>Cerita selesai</p><strong>{report.completedTopics}/{report.totalTopics}</strong><span>dari seluruh cerita 8 chapter</span></div></article>
          <article className="metric-card metric-cyan"><div><p>Progres</p><strong>{progress}%</strong><span>cerita yang sudah ditamatkan</span></div></article>
        </section>
        <article className="surface-card data-table-card">
          <div className="section-heading-row"><div><h2>Cerita yang dikerjakan</h2><p>Buka satu cerita untuk melihat pilihan, refleksi, dan kesimpulan.</p></div></div>
          {report.stories.length ? <div className="topic-student-list">{report.stories.map((story) => <StoryCard story={story} key={story.moduleId} />)}</div> : <EmptyState title="Belum ada cerita" description="Siswa belum memulai cerita apa pun." />}
        </article>
      </> : !failed ? <p className="topic-empty">Memuat data...</p> : null}
    </div>
  );
}
