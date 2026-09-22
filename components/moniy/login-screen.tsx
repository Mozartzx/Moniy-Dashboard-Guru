'use client';

import Image from 'next/image';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';

type LoginScreenProps = {
  onLogin: () => void;
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('guru@moniy.id');
  const [password, setPassword] = useState('moniydemo');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError('Masukkan email yang valid dan kata sandi minimal 6 karakter.');
      return;
    }
    setError('');
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onLogin();
    }, 650);
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
            <span className="mock-badge"><ShieldCheck size={16} /> Demo frontend</span>
            <h2>Selamat datang, Guru!</h2>
            <p>Masuk untuk melihat kondisi belajar kelas dalam satu tempat.</p>
          </div>

          <form className="login-form" onSubmit={submit} noValidate>
            <label className="field-group">
              <span>Email</span>
              <span className="input-shell">
                <Mail size={19} aria-hidden="true" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@sekolah.id"
                  autoComplete="email"
                  aria-invalid={Boolean(error)}
                />
              </span>
            </label>

            <label className="field-group">
              <span>Kata sandi</span>
              <span className="input-shell">
                <LockKeyhole size={19} aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  aria-invalid={Boolean(error)}
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
            </label>

            <div className="login-options">
              <label className="checkbox-label">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                <span>Ingat saya</span>
              </label>
              <button className="link-button" type="button" onClick={() => setError('Pemulihan akun belum terhubung pada demo frontend ini.')}>
                Lupa kata sandi?
              </button>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="primary-button login-submit" type="submit" disabled={submitting}>
              {submitting ? 'Membuka dashboard...' : 'Masuk ke dashboard'}
            </button>
          </form>

          <p className="login-footnote">
            Akun dan autentikasi belum terhubung. Form ini hanya membuka pengalaman demo dengan data contoh.
          </p>
        </div>
      </section>
    </main>
  );
}
