'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    setError('');
    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) {
      setError('Tautan reset sudah kedaluwarsa atau tidak valid, minta tautan baru dari halaman masuk.');
      return;
    }
    setDone(true);
  };

  return (
    <main className="login-shell">
      <section className="login-visual" aria-label="Ilustrasi MONIY">
        <div className="login-visual-content">
          <p className="login-kicker">Dashboard Guru</p>
          <h1>Atur ulang kata sandi.</h1>
          <p>Buat kata sandi baru untuk masuk kembali ke dashboard.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <Image className="login-logo" src="/assets/moniy-logo.png" alt="Moniy" width={260} height={75} priority />
          <div className="login-copy">
            <span className="mock-badge"><ShieldCheck size={16} /> Dashboard guru</span>
            <h2>Kata sandi baru</h2>
            <p>Minimal 6 karakter.</p>
          </div>

          {done ? (
            <p className="field-success"><CheckCircle2 size={17} /> Kata sandi berhasil diubah. <Link href="/login">Masuk sekarang</Link>.</p>
          ) : (
            <form className="login-form" onSubmit={(event) => void submit(event)}>
              <label className="field-group">
                <span>Kata sandi baru</span>
                <span className="input-shell">
                  <LockKeyhole size={19} aria-hidden="true" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                    aria-invalid={Boolean(error)}
                  />
                </span>
              </label>

              {error && <p className="form-error" role="alert">{error}</p>}

              <button className="primary-button login-submit" type="submit" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan kata sandi baru'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
