'use client';

import Image from 'next/image';
import { GraduationCap, LogOut, Plus, X } from 'lucide-react';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { getCurrentTeacher } from '@/lib/moniy/session';

function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return `MONIY-${code}`;
}

export default function OnboardingKelasPage() {
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    void getCurrentTeacher().then((teacher) => setTeacherName(teacher?.name ?? ''));
  }, []);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!className.trim()) {
      setError('Nama kelas wajib diisi.');
      return;
    }
    setError('');
    setSubmitting(true);
    const supabase = createClient();
    const teacher = await getCurrentTeacher();
    if (!teacher) {
      setSubmitting(false);
      setError('Sesi guru tidak ditemukan, muat ulang halaman.');
      return;
    }
    const { error: insertError } = await supabase.from('classes').insert({
      id: generateClassCode(),
      name: className,
      school_name: teacher.schoolName,
      teacher_id: teacher.id,
      academic_year: academicYear || null,
    });
    setSubmitting(false);
    if (insertError) {
      setError('Gagal membuat kelas, coba lagi.');
      return;
    }
    window.location.assign('/dashboard/ringkasan');
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign('/login');
  };

  return (
    <main className="dashboard-shell onboarding-shell">
      <section className="dashboard-workspace">
        <header className="dashboard-topbar">
          <div className="topbar-title">
            <Image src="/assets/moniy-logo.png" alt="Moniy" width={128} height={37} />
          </div>
          <button className="secondary-button" type="button" onClick={() => void signOut()}>
            <LogOut size={16} /> Keluar
          </button>
        </header>

        <main className="dashboard-main">
          <div className="page-stack">
            <section className="page-intro">
              <div>
                <span className="page-kicker">Selamat datang{teacherName ? `, ${teacherName}` : ''}</span>
                <h1>Belum ada kelas</h1>
                <p>Buat kelas pertama untuk mulai memantau progres belajar dan kerentanan judi online siswa.</p>
              </div>
            </section>

            <article className="surface-card">
              <div className="empty-state">
                <span className="empty-state-icon"><GraduationCap size={22} /></span>
                <strong>Kelas kamu akan muncul di sini</strong>
                <span>Setiap kelas punya kode unik yang bisa dibagikan ke siswa.</span>
                <button className="primary-button" type="button" onClick={() => setOpen(true)}>
                  <Plus size={18} /> Buat kelas
                </button>
              </div>
            </article>
          </div>
        </main>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="detail-modal manage-class-modal" showCloseButton={false}>
          <button className="modal-close" onClick={() => setOpen(false)} aria-label="Tutup"><X size={20} /></button>
          <DialogTitle>Buat kelas baru</DialogTitle>
          <DialogDescription>Kode kelas dibuat otomatis setelah kelas tersimpan.</DialogDescription>
          <form className="login-form" onSubmit={(event) => void submit(event)}>
            <label className="field-group">
              <span>Nama kelas</span>
              <span className="input-shell">
                <input value={className} onChange={(event) => setClassName(event.target.value)} placeholder="Kelas X-A" required />
              </span>
            </label>
            <label className="field-group">
              <span>Tahun ajaran (opsional)</span>
              <span className="input-shell">
                <input value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} placeholder="2026/2027" />
              </span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button login-submit" type="submit" disabled={submitting}>
              {submitting ? 'Membuat kelas...' : 'Buat kelas'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
