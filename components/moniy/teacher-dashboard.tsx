'use client';

import Image from 'next/image';
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  ChevronDown,
  CircleUserRound,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  RefreshCw,
  School,
  Settings2,
  ShieldAlert,
  UsersRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { classOptions, periodOptions } from '@/lib/moniy/mock-data';
import type { DataMode } from '@/lib/moniy/types';
import { useMoniyDashboard } from '@/hooks/use-moniy-dashboard';
import { CommunityPage, OverviewPage, ProgressPage, ReportsPage, RiskPage, StudentsPage } from './dashboard-pages';

type PageKey = 'overview' | 'progress' | 'students' | 'risk' | 'community' | 'reports';

const navItems = [
  { key: 'overview' as PageKey, label: 'Ringkasan', icon: LayoutDashboard },
  { key: 'progress' as PageKey, label: 'Progres Belajar', icon: BarChart3 },
  { key: 'students' as PageKey, label: 'Rekam Siswa', icon: UsersRound },
  { key: 'risk' as PageKey, label: 'Peringatan Judi', icon: ShieldAlert },
  { key: 'community' as PageKey, label: 'Komunitas Kelas', icon: MessagesSquare },
  { key: 'reports' as PageKey, label: 'Laporan', icon: FileText },
];

const titles: Record<PageKey, string> = {
  overview: 'Ringkasan kelas',
  progress: 'Progres belajar',
  students: 'Rekam siswa',
  risk: 'Peringatan judi online',
  community: 'Komunitas kelas',
  reports: 'Laporan kelas',
};

function LoadingState() {
  return <div className="dashboard-loading" aria-label="Memuat data"><div className="skeleton hero-skeleton" /><div className="skeleton-row"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div><div className="skeleton-content"><div className="skeleton" /><div className="skeleton" /></div></div>;
}

export function TeacherDashboard({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState<PageKey>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [toast, setToast] = useState('');
  const dashboard = useMoniyDashboard();
  const periodLabel = periodOptions.find((item) => item.value === dashboard.period)?.label ?? dashboard.period;
  const className = classOptions.find((item) => item.value === dashboard.classId)?.label ?? dashboard.classId;

  const navigate = (page: string) => {
    setActivePage(page as PageKey);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveContent = () => {
    if (!dashboard.snapshot) return null;
    const common = { snapshot: dashboard.snapshot };
    if (activePage === 'overview') return <OverviewPage {...common} navigate={navigate} />;
    if (activePage === 'progress') return <ProgressPage {...common} />;
    if (activePage === 'students') return <StudentsPage {...common} />;
    if (activePage === 'risk') return <RiskPage {...common} />;
    if (activePage === 'community') return <CommunityPage {...common} onReview={async (postId) => { await dashboard.markPostReviewed(postId); setToast('Postingan ditandai sudah ditinjau pada data contoh.'); window.setTimeout(() => setToast(''), 3200); }} />;
    return <ReportsPage {...common} className={className} periodLabel={periodLabel} />;
  };

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <Image src="/assets/moniy-logo.png" alt="Moniy" width={148} height={43} priority />
          <button className="sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu"><X size={21} /></button>
        </div>
        <div className="teacher-product-label"><GraduationCap size={16} /> Dashboard Guru</div>
        <nav className="main-nav" aria-label="Navigasi utama">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === activePage;
            const badge = item.key === 'community' && dashboard.pendingCommunityCount > 0 ? dashboard.pendingCommunityCount : null;
            return <button key={item.key} className={active ? 'active' : ''} type="button" onClick={() => navigate(item.key)} aria-current={active ? 'page' : undefined}><Icon size={20} /><span>{item.label}</span>{badge && <b>{badge}</b>}</button>;
          })}
        </nav>
        <div className="sidebar-class-card">
          <span><School size={18} /></span><div><small>Kelas aktif</small><strong>{className}</strong><p>{dashboard.snapshot?.studentCount ?? 0} siswa</p></div>
        </div>
        <div className="sidebar-footer"><span className="teacher-avatar">RS</span><div><strong>Rani Suryani</strong><small>Guru IPS</small></div><button type="button" onClick={() => setProfileOpen((value) => !value)} aria-label="Buka menu profil"><Settings2 size={18} /></button></div>
      </aside>
      {mobileNavOpen && <button className="mobile-scrim" aria-label="Tutup navigasi" onClick={() => setMobileNavOpen(false)} />}

      <section className="dashboard-workspace">
        <header className="dashboard-topbar">
          <div className="topbar-title"><button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={22} /></button><div><small>Dashboard Guru / {titles[activePage]}</small><strong>{titles[activePage]}</strong></div></div>
          <div className="topbar-controls">
            <label className="header-select"><School size={17} /><span>Kelas</span><select value={dashboard.classId} onChange={(event) => dashboard.setClassId(event.target.value)}>{classOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select><ChevronDown size={15} /></label>
            <label className="header-select compact"><BookOpenCheck size={17} /><span>Periode</span><select value={dashboard.period} onChange={(event) => dashboard.setPeriod(event.target.value)}>{periodOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select><ChevronDown size={15} /></label>
            <button className="manage-class-button" type="button" onClick={() => setManageOpen(true)}><Settings2 size={18} /> Kelola kelas</button>
            <button className="icon-button notification-button" type="button" onClick={() => { setToast('Tidak ada notifikasi baru pada demo ini.'); window.setTimeout(() => setToast(''), 2600); }} aria-label="Notifikasi"><Bell size={20} /></button>
            <div className="profile-wrap"><button className="profile-trigger" type="button" onClick={() => setProfileOpen((value) => !value)}><span className="teacher-avatar">RS</span><span><strong>Bu Rani</strong><small>Guru IPS</small></span><ChevronDown size={15} /></button>
              {profileOpen && <div className="profile-menu"><div className="profile-menu-head"><CircleUserRound size={20} /><span><strong>Rani Suryani</strong><small>guru@moniy.id</small></span></div><label>Mode data contoh<select value={dashboard.mode} onChange={(event) => dashboard.setMode(event.target.value as DataMode)}><option value="normal">Normal</option><option value="loading">Memuat</option><option value="empty">Kosong</option><option value="error">Error</option></select></label><button type="button" onClick={onLogout}>Keluar dari demo</button></div>}
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="mock-banner"><span><span className="mock-dot" /> Data contoh frontend</span><p>Tidak ada data siswa nyata, backend, atau analisis AI produksi yang terhubung.</p></div>
          {dashboard.status === 'loading' && <LoadingState />}
          {dashboard.status === 'error' && <div className="error-state"><span><RefreshCw size={28} /></span><h1>Data contoh gagal dimuat</h1><p>Ini adalah state error untuk kesiapan integrasi backend.</p><button className="primary-button" type="button" onClick={dashboard.reload}>Coba lagi</button></div>}
          {dashboard.status === 'success' && renderActiveContent()}
        </main>
      </section>

      {manageOpen && <dialog open className="modal-backdrop"><section className="detail-modal manage-class-modal" aria-labelledby="manage-title"><button className="modal-close" onClick={() => setManageOpen(false)} aria-label="Tutup"><X size={20} /></button><span className="page-kicker">Pengelolaan kelas</span><h2 id="manage-title">Atur kelas contoh</h2><p className="modal-lead">Perubahan di sini hanya berlaku pada antarmuka demo.</p><div className="class-code-panel"><span>Kode kelas</span><strong>MONIY-XA26</strong><button type="button" onClick={() => { void navigator.clipboard?.writeText('MONIY-XA26'); setToast('Kode kelas contoh disalin.'); setManageOpen(false); }}>Salin kode</button></div><div className="manage-actions"><button className="secondary-button" onClick={() => window.alert('Penambahan siswa memerlukan backend dan belum tersedia pada demo frontend.')}>Tambah siswa</button><button className="secondary-button" onClick={() => window.alert('Pengaturan modul tersimpan hanya sebagai simulasi antarmuka.')}>Atur modul</button></div></section></dialog>}
      {toast && <output className="toast-message">{toast}</output>}
    </div>
  );
}
