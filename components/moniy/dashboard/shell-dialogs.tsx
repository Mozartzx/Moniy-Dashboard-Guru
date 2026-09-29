'use client';

import { Copy, LogOut, X } from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { updateClass, updateTeacherProfile } from '@/lib/moniy/session';
import type { TeacherClass, TeacherProfile } from '@/lib/moniy/teacher';
import { createClient } from '@/lib/supabase/client';

type Saved = { onSaved: () => Promise<void>; notify: (message: string) => void };

function TextField({ label, name, defaultValue, placeholder, required, type = 'text', hint }: { label: string; name: string; defaultValue?: string | null; placeholder?: string; required?: boolean; type?: string; hint?: string }) {
  return (
    <label className="field-group">
      <span>{label}</span>
      <span className="input-shell"><input name={name} type={type} defaultValue={defaultValue ?? ''} placeholder={placeholder} required={required} /></span>
      {hint ? <small className="field-hint">{hint}</small> : null}
    </label>
  );
}

const valueOf = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
};
const orNull = (value: string) => value || null;

function useSubmit(save: (form: FormData) => Promise<void>, close: () => void, { onSaved, notify }: Saved, successMessage: string) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await save(new FormData(event.currentTarget));
      await onSaved();
      notify(successMessage);
      close();
    } catch {
      setError('Perubahan gagal disimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  };
  return { saving, error, submit };
}

export function ManageClassDialog({ open, onOpenChange, activeClass, studentCount, ...saved }: Saved & { open: boolean; onOpenChange: (open: boolean) => void; activeClass: TeacherClass | null; studentCount: number }) {
  const close = () => onOpenChange(false);
  const { saving, error, submit } = useSubmit(async (form) => {
    if (!activeClass) return;
    await updateClass(activeClass.id, { name: valueOf(form, 'name'), schoolName: orNull(valueOf(form, 'schoolName')), academicYear: orNull(valueOf(form, 'academicYear')) });
  }, close, saved, 'Data kelas disimpan.');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="detail-modal manage-class-modal" showCloseButton={false}>
        <button className="modal-close" type="button" onClick={close} aria-label="Tutup"><X size={20} /></button>
        <DialogTitle>Kelola kelas</DialogTitle>
        <DialogDescription className="modal-lead">Ubah data kelas dan bagikan kode kelas ke siswa.</DialogDescription>
        {activeClass ? (
          <>
            <div className="class-code-panel">
              <div><span>Kode kelas</span><strong>{activeClass.id}</strong><small>{studentCount} siswa tergabung</small></div>
              <button className="secondary-button" type="button" onClick={() => { void navigator.clipboard?.writeText(activeClass.id); saved.notify('Kode kelas disalin.'); }}><Copy size={16} /> Salin kode</button>
            </div>
            <form className="modal-form" key={activeClass.id} onSubmit={(event) => void submit(event)}>
              <TextField label="Nama kelas" name="name" defaultValue={activeClass.name} placeholder="Kelas X-A" required />
              <div className="modal-form-row">
                <TextField label="Tahun ajaran" name="academicYear" defaultValue={activeClass.academicYear} placeholder="2026/2027" />
                <TextField label="Nama sekolah" name="schoolName" defaultValue={activeClass.schoolName} placeholder="SMA Negeri 1" />
              </div>
              {error ? <p className="form-error" role="alert">{error}</p> : null}
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={close}>Batal</button><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan perubahan'}</button></div>
            </form>
          </>
        ) : <p className="modal-lead">Data kelas belum dimuat.</p>}
      </DialogContent>
    </Dialog>
  );
}

export function AccountSettingsDialog({ open, onOpenChange, teacher, ...saved }: Saved & { open: boolean; onOpenChange: (open: boolean) => void; teacher: TeacherProfile | null }) {
  const close = () => onOpenChange(false);
  const { saving, error, submit } = useSubmit(async (form) => {
    if (!teacher) return;
    await updateTeacherProfile(teacher.id, { name: valueOf(form, 'name'), nickname: orNull(valueOf(form, 'nickname')), phone: orNull(valueOf(form, 'phone')), schoolName: orNull(valueOf(form, 'schoolName')) });
  }, close, saved, 'Profil disimpan.');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="detail-modal" showCloseButton={false}>
        <button className="modal-close" type="button" onClick={close} aria-label="Tutup"><X size={20} /></button>
        <DialogTitle>Pengaturan akun</DialogTitle>
        <DialogDescription className="modal-lead">Data diri ini tampil di dashboard dan laporan kelas.</DialogDescription>
        {teacher ? (
          <form className="modal-form" onSubmit={(event) => void submit(event)}>
            <TextField label="Nama lengkap" name="name" defaultValue={teacher.name} required />
            <div className="modal-form-row">
              <TextField label="Nama panggilan" name="nickname" defaultValue={teacher.nickname} placeholder="Pak Syahran" />
              <TextField label="Nomor telepon" name="phone" type="tel" defaultValue={teacher.phone} placeholder="08xxxxxxxxxx" />
            </div>
            <TextField label="Nama sekolah" name="schoolName" defaultValue={teacher.schoolName} />
            <label className="field-group">
              <span>Email</span>
              <span className="input-shell is-readonly"><input value={teacher.email} readOnly /></span>
              <small className="field-hint">Email dipakai untuk masuk dan tidak dapat diubah di sini.</small>
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="modal-actions"><button className="secondary-button" type="button" onClick={close}>Batal</button><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan perubahan'}</button></div>
          </form>
        ) : <p className="modal-lead">Data akun belum dimuat.</p>}
      </DialogContent>
    </Dialog>
  );
}

export function SignOutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [leaving, setLeaving] = useState(false);
  const signOut = async () => {
    setLeaving(true);
    await createClient().auth.signOut();
    window.location.assign('/login');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="detail-modal confirm-modal">
        <span className="confirm-icon"><LogOut size={22} /></span>
        <AlertDialogTitle>Apakah Anda yakin ingin keluar?</AlertDialogTitle>
        <AlertDialogDescription className="modal-lead">Anda perlu login kembali untuk mengakses akun Anda.</AlertDialogDescription>
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={() => onOpenChange(false)} disabled={leaving}>Batal</button>
          <button className="danger-button" type="button" onClick={() => void signOut()} disabled={leaving}><LogOut size={17} /> {leaving ? 'Keluar...' : 'Keluar'}</button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
