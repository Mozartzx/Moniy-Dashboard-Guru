'use client';

import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingSekolahPage() {
  const [schoolName, setSchoolName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!schoolName.trim()) {
      setError('Nama sekolah wajib diisi.');
      return;
    }
    setError('');
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error: updateError } = await supabase
      .from('users')
      .update({ school_name: schoolName })
      .eq('email', user?.email ?? '');
    setSubmitting(false);
    if (updateError) {
      setError('Gagal menyimpan, coba lagi.');
      return;
    }
    window.location.assign('/kelas');
  };

  return (
    <main className="login-shell">
      <section className="login-visual" aria-label="Ilustrasi MONIY">
        <div className="login-visual-content">
          <p className="login-kicker">Lengkapi profil</p>
          <h1>Satu langkah lagi.</h1>
          <p>Nama sekolah membantu kami menyiapkan dashboard kelasmu.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <Image className="login-logo" src="/assets/moniy-logo.png" alt="Moniy" width={260} height={75} priority />
          <div className="login-copy">
            <span className="mock-badge">Dashboard Guru</span>
            <h2>Nama sekolah Anda?</h2>
            <p>Ditampilkan pada laporan dan profil guru.</p>
          </div>

          <form className="login-form" onSubmit={(event) => void submit(event)}>
            <label className="field-group">
              <span>Nama sekolah</span>
              <span className="input-shell">
                <Building2 size={19} aria-hidden="true" />
                <input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} placeholder="SMA Negeri 1 ..." autoComplete="organization" required />
              </span>
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="primary-button login-submit" type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Lanjutkan'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
