'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building2, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, MailCheck, ShieldCheck, User } from 'lucide-react';
import { type FocusEvent, type SyntheticEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GoogleGlyph } from './google-glyph';

type FieldErrors = { name?: string; schoolName?: string; email?: string; password?: string };

function validateName(value: string) {
  return value.trim() ? undefined : 'Nama wajib diisi.';
}

function validateSchoolName(value: string) {
  return value.trim() ? undefined : 'Nama sekolah wajib diisi.';
}

function validateEmail(value: string) {
  return value.includes('@') ? undefined : 'Masukkan email yang valid.';
}

function validatePassword(value: string) {
  return value.length >= 6 ? undefined : 'Kata sandi minimal 6 karakter.';
}

export function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: FieldErrors = {
      name: validateName(name),
      schoolName: validateSchoolName(schoolName),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    if (errors.name || errors.schoolName || errors.email || errors.password) return;
    setError('');
    setSubmitting(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: name, school_name: schoolName },
      },
    });
    setSubmitting(false);
    if (authError) {
      setError(authError.message === 'User already registered' ? 'Email ini sudah terdaftar.' : 'Pendaftaran gagal, coba lagi.');
      return;
    }
    if (!data.session) {
      setAwaitingConfirmation(true);
      return;
    }
    await supabase.from('users').insert({ name, email, role: 'teacher', school_name: schoolName });
    window.location.assign('/dashboard/ringkasan');
  };

  const signUpWithGoogle = async () => {
    setGoogleSubmitting(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const resendConfirmation = async () => {
    setResending(true);
    setResendMessage('');
    const supabase = createClient();
    await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    setResendMessage('Tautan konfirmasi dikirim ulang.');
  };

  return (
    <main className="login-shell">
      <section className="login-visual" aria-label="Ilustrasi MONIY">
        <div className="login-visual-content">
          <p className="login-kicker">Dashboard Guru</p>
          <h1>Daftar dan mulai pantau kelasmu.</h1>
          <p>Satu akun guru untuk melihat progres belajar, kerentanan judi online, dan komunitas kelas.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <Image className="login-logo" src="/assets/moniy-logo.png" alt="Moniy" width={260} height={75} priority />

          {awaitingConfirmation ? (
            <div className="confirmation-panel">
              <span className="confirmation-icon"><MailCheck size={26} /></span>
              <h2>Cek email kamu</h2>
              <p>
                Tautan konfirmasi sudah dikirim ke <strong>{email}</strong>. Buka email itu untuk mengaktifkan akun,
                lalu kembali ke <Link href="/login">halaman masuk</Link>.
              </p>
              <button className="secondary-button" type="button" onClick={() => void resendConfirmation()} disabled={resending}>
                {resending ? 'Mengirim ulang...' : 'Kirim ulang tautan'}
              </button>
              {resendMessage && <p className="field-success"><CheckCircle2 size={16} /> {resendMessage}</p>}
            </div>
          ) : (
            <>
              <div className="login-copy">
                <span className="mock-badge"><ShieldCheck size={16} /> Dashboard guru</span>
                <h2>Buat akun guru</h2>
                <p>Isi data singkat berikut, kelas bisa dibuat setelah akun aktif.</p>
              </div>

              <button
                className="secondary-button google-button"
                type="button"
                onClick={() => void signUpWithGoogle()}
                disabled={googleSubmitting}
              >
                <GoogleGlyph size={18} /> {googleSubmitting ? 'Menghubungkan...' : 'Daftar dengan Google'}
              </button>

              <div className="login-divider"><span>atau</span></div>

              <form className="login-form" onSubmit={(event) => void submit(event)}>
                <label className="field-group">
                  <span>Nama lengkap</span>
                  <span className="input-shell" data-invalid={Boolean(fieldErrors.name)}>
                    <User size={19} aria-hidden="true" />
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      onBlur={(event: FocusEvent<HTMLInputElement>) => setFieldErrors((current) => ({ ...current, name: validateName(event.target.value) }))}
                      placeholder="Nama guru"
                      autoComplete="name"
                      aria-invalid={Boolean(fieldErrors.name)}
                    />
                  </span>
                  {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
                </label>

                <label className="field-group">
                  <span>Nama sekolah</span>
                  <span className="input-shell" data-invalid={Boolean(fieldErrors.schoolName)}>
                    <Building2 size={19} aria-hidden="true" />
                    <input
                      value={schoolName}
                      onChange={(event) => setSchoolName(event.target.value)}
                      onBlur={(event: FocusEvent<HTMLInputElement>) => setFieldErrors((current) => ({ ...current, schoolName: validateSchoolName(event.target.value) }))}
                      placeholder="SMA Negeri 1 ..."
                      autoComplete="organization"
                      aria-invalid={Boolean(fieldErrors.schoolName)}
                    />
                  </span>
                  {fieldErrors.schoolName && <p className="field-error">{fieldErrors.schoolName}</p>}
                </label>

                <label className="field-group">
                  <span>Email</span>
                  <span className="input-shell" data-invalid={Boolean(fieldErrors.email)}>
                    <Mail size={19} aria-hidden="true" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={(event: FocusEvent<HTMLInputElement>) => setFieldErrors((current) => ({ ...current, email: validateEmail(event.target.value) }))}
                      placeholder="nama@sekolah.id"
                      autoComplete="email"
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                  </span>
                  {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                </label>

                <label className="field-group">
                  <span>Kata sandi</span>
                  <span className="input-shell" data-invalid={Boolean(fieldErrors.password)}>
                    <LockKeyhole size={19} aria-hidden="true" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onBlur={(event: FocusEvent<HTMLInputElement>) => setFieldErrors((current) => ({ ...current, password: validatePassword(event.target.value) }))}
                      placeholder="Minimal 6 karakter"
                      autoComplete="new-password"
                      aria-invalid={Boolean(fieldErrors.password)}
                    />
                    <button
                      className="input-icon-button"
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </span>
                  {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
                </label>

                {error && <p className="form-error" role="alert">{error}</p>}

                <button className="primary-button login-submit" type="submit" disabled={submitting}>
                  {submitting ? 'Mendaftarkan...' : 'Daftar sebagai guru'}
                </button>
              </form>

              <p className="login-footnote">
                Sudah punya akun? <Link href="/login">Masuk</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
