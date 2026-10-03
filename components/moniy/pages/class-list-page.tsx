'use client';

import Image from 'next/image';
import { ArrowRight, GraduationCap, LogOut, Plus, School, X } from 'lucide-react';
import { type CSSProperties, type SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { SignOutDialog } from '@/components/moniy/dashboard/shell-dialogs';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { setActiveClassId } from '@/lib/moniy/active-class';
import { createClass, getCurrentTeacher, getMyClassSummaries, type ClassSummary } from '@/lib/moniy/session';
import type { TeacherProfile } from '@/lib/moniy/teacher';

/** Halaman pertama setelah login: semua kelas milik guru. Membuka satu kelas membawa ke dashboard-nya. */
export function ClassListPage() {
  const [classes, setClasses] = useState<ClassSummary[] | null>(null);
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);

  const load = useCallback(async () => {
    const [nextClasses, nextTeacher] = await Promise.all([getMyClassSummaries(), getCurrentTeacher()]);
    setClasses(nextClasses);
    setTeacher(nextTeacher);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => {
      window.clearTimeout(timer);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [load]);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!className.trim()) {
      setError('Nama kelas wajib diisi.');
      return;
    }
    if (!teacher) {
      setError('Sesi guru tidak ditemukan, muat ulang halaman.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await createClass(teacher, { name: className.trim(), academicYear: academicYear.trim() || null });
      await load();
      setCreateOpen(false);
      setClassName('');
      setAcademicYear('');
      setToast('Kelas dibuat.');
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(''), 3000);
    } catch {
      setError('Gagal membuat kelas, coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = teacher?.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() ?? '..';

  return (
    <main className="dashboard-shell onboarding-shell">
      <section className="dashboard-workspace">
        <header className="dashboard-topbar">
          <div className="topbar-title">
            <Image src="/assets/moniy-logo.png" alt="Moniy" width={128} height={37} priority />
          </div>
          <div className="topbar-controls">
            <span className="class-teacher"><span className="teacher-avatar" aria-hidden="true">{initials}</span><span><strong>{teacher?.name ?? 'Memuat...'}</strong><small>Guru</small></span></span>
            <button className="secondary-button" type="button" onClick={() => setSignOutOpen(true)}><LogOut size={16} /> Keluar</button>
          </div>
        </header>

        <div className="dashboard-main">
          <div className="page-stack">
            <section className="page-intro">
              <div>
                <span className="page-kicker">Dashboard Guru</span>
                <h1>Kelas kamu</h1>
                <p>Pilih kelas untuk membuka dashboard-nya.</p>
              </div>
              {classes && classes.length > 0 ? <button className="primary-button" type="button" onClick={() => setCreateOpen(true)}><Plus size={18} /> Buat kelas</button> : null}
            </section>

            {classes === null ? (
              <div className="class-grid" aria-label="Memuat kelas">
                {[0, 1, 2].map((i) => <div key={i} className="skeleton class-skeleton" />)}
              </div>
            ) : classes.length === 0 ? (
              <article className="surface-card">
                <div className="empty-state">
                  <span className="empty-state-icon"><GraduationCap size={22} /></span>
                  <strong>Belum ada kelas</strong>
                  <span>Buat kelas pertama untuk mulai memantau progres belajar dan kerentanan judi online siswa. Setiap kelas punya kode unik yang bisa dibagikan ke siswa.</span>
                  <button className="primary-button" type="button" onClick={() => setCreateOpen(true)}><Plus size={18} /> Buat kelas</button>
                </div>
              </article>
            ) : (
              <ul className="class-grid">
                {classes.map((item, i) => (
                  <li key={item.id} style={{ '--i': i } as CSSProperties}>
                    <BrowserNavigationLink className="class-card" href="/dashboard/ringkasan" onClick={() => setActiveClassId(item.id)}>
                      <span className="class-card-icon" aria-hidden="true"><School size={22} /></span>
                      <h2>{item.name}</h2>
                      <p className="class-card-meta">{[item.academicYear, item.schoolName].filter(Boolean).join(' · ') || 'Belum ada tahun ajaran'}</p>
                      <span className="class-card-stats"><b className="class-chip">{item.studentCount} siswa</b><b className="class-chip">{item.id}</b></span>
                      <span className="class-card-open">Buka dashboard <ArrowRight size={16} aria-hidden="true" /></span>
                    </BrowserNavigationLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="detail-modal manage-class-modal" showCloseButton={false}>
          <button className="modal-close" type="button" onClick={() => setCreateOpen(false)} aria-label="Tutup"><X size={20} /></button>
          <DialogTitle>Buat kelas baru</DialogTitle>
          <DialogDescription>Kode kelas dibuat otomatis setelah kelas tersimpan.</DialogDescription>
          <form className="login-form" onSubmit={(event) => void submit(event)}>
            <label className="field-group">
              <span>Nama kelas</span>
              <span className="input-shell"><input value={className} onChange={(event) => setClassName(event.target.value)} placeholder="Kelas X-A" required /></span>
            </label>
            <label className="field-group">
              <span>Tahun ajaran (opsional)</span>
              <span className="input-shell"><input value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} placeholder="2026/2027" /></span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button login-submit" type="submit" disabled={submitting}>{submitting ? 'Membuat kelas...' : 'Buat kelas'}</button>
          </form>
        </DialogContent>
      </Dialog>
      <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
      {toast ? <output className="toast-message">{toast}</output> : null}
    </main>
  );
}
