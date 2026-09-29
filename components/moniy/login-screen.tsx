'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { type FocusEvent, type SyntheticEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GoogleGlyph } from './google-glyph';

const URL_ERROR_MESSAGES: Record<string, string> = {
  'role-conflict': 'Akun ini terdaftar sebagai siswa MONIY, gunakan akun lain untuk Dashboard Guru.',
  oauth: 'Masuk dengan Google gagal, coba lagi.',
};

type FieldErrors = { email?: string; password?: string };

function validateEmail(value: string) {
  return value.includes('@') ? undefined : 'Masukkan email yang valid.';
}

function validatePassword(value: string) {
  return value.length >= 6 ? undefined : 'Kata sandi minimal 6 karakter.';
}

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  // Reads the redirect-back error from the URL after hydration, so the server-rendered HTML
  // (which never knows the URL's query string) matches the client's first paint exactly.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const code = new URLSearchParams(window.location.search).get('error');
      if (code && URL_ERROR_MESSAGES[code]) setError(URL_ERROR_MESSAGES[code]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: FieldErrors = { email: validateEmail(email), password: validatePassword(password) };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;
    setError('');
    setSubmitting(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (authError) {
      setError('Email atau kata sandi salah.');
      return;
    }
    window.location.assign('/dashboard/ringkasan');
  };

  const signInWithGoogle = async () => {
    setGoogleSubmitting(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const sendResetEmail = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setFieldErrors((current) => ({ ...current, email: 'Isi email dulu untuk kirim tautan reset kata sandi.' }));
      return;
    }
    setResetMessage('');
    setResetSubmitting(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setResetSubmitting(false);
    setResetMessage(`Tautan reset kata sandi sudah dikirim ke ${email}.`);
  };

  return (
    <main className="login-shell">
      <section className="login-visual" aria-label="Ilustrasi MONIY">
        <div className="login-visual-content">
          <p className="login-kicker">Dashboard Guru</p>
          <h1>Temani setiap keputusan finansial siswa.</h1>
          <p>Pantau progres kelas, temukan topik yang perlu dikuatkan, dan siapkan refleksi berikutnya.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <Image
            className="login-logo"
            src="/assets/moniy-logo.png"
            alt="Moniy"
            width={260}
            height={75}
            priority
          />
          <div className="login-copy">
            <span className="mock-badge"><ShieldCheck size={16} /> Dashboard guru</span>
            <h2>Selamat datang, Guru!</h2>
            <p>Masuk untuk melihat kondisi belajar kelas dalam satu tempat.</p>
          </div>

          <button
            className="secondary-button google-button"
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={googleSubmitting}
          >
            <GoogleGlyph size={18} /> {googleSubmitting ? 'Menghubungkan...' : 'Masuk dengan Google'}
          </button>

          <div className="login-divider"><span>atau</span></div>

          <form className="login-form" onSubmit={(event) => void submit(event)}>
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
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
              </span>
              {fieldErrors.email && <p className="field-error" id="email-error">{fieldErrors.email}</p>}
            </label>

            <label className="field-group">
              <span className="field-label-row">
                <span>Kata sandi</span>
                <button className="link-button" type="button" onClick={() => void sendResetEmail()} disabled={resetSubmitting}>
                  {resetSubmitting ? 'Mengirim...' : 'Lupa kata sandi?'}
                </button>
              </span>
              <span className="input-shell" data-invalid={Boolean(fieldErrors.password)}>
                <LockKeyhole size={19} aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={(event: FocusEvent<HTMLInputElement>) => setFieldErrors((current) => ({ ...current, password: validatePassword(event.target.value) }))}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
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
              {fieldErrors.password && <p className="field-error" id="password-error">{fieldErrors.password}</p>}
              {resetMessage && <p className="field-success">{resetMessage}</p>}
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="primary-button login-submit" type="submit" disabled={submitting}>
              {submitting ? 'Membuka dashboard...' : 'Masuk ke dashboard'}
            </button>
          </form>

          <p className="login-footnote">
            Belum punya akun? <Link href="/register">Daftar sebagai guru</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
