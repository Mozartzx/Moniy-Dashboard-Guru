'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BookOpenCheck,
  ChevronDown,
  CircleUserRound,
  GraduationCap,
  Menu,
  RefreshCw,
  School,
  Settings2,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { classOptions, periodOptions } from '@/lib/moniy/mock-data';
import { dashboardRoutes, getDashboardRoute } from '@/lib/moniy/navigation';
import type { DataMode } from '@/lib/moniy/types';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { useDashboardContext } from './dashboard-context';
import { FilterSelect } from './filter-select';

function LoadingState() {
  return (
    <div className="dashboard-loading" aria-label="Memuat data">
      <div className="skeleton hero-skeleton" />
      <div className="skeleton-row"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div>
      <div className="skeleton-content"><div className="skeleton" /><div className="skeleton" /></div>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentRoute = getDashboardRoute(pathname);
  const { dashboard, className, toast, notify } = useDashboardContext();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <Image src="/assets/moniy-logo.png" alt="Moniy" width={148} height={43} priority />
          <button className="sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu"><X size={21} /></button>
        </div>
        <div className="teacher-product-label"><GraduationCap size={17} /> Dashboard Guru</div>
        <nav className="main-nav" aria-label="Navigasi utama">
          {dashboardRoutes.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const badge = item.showsCommunityBadge && dashboard.pendingCommunityCount > 0 ? dashboard.pendingCommunityCount : null;
            return (
              <BrowserNavigationLink key={item.href} href={item.href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} onClick={() => setMobileNavOpen(false)}>
                <Icon size={20} /><span>{item.label}</span>{badge ? <b>{badge}</b> : null}
              </BrowserNavigationLink>
            );
          })}
        </nav>
        <div className="sidebar-class-card">
          <span><School size={18} /></span>
          <div><small>Kelas aktif</small><strong>{className}</strong><p>{dashboard.snapshot?.studentCount ?? 0} siswa</p></div>
        </div>
      </aside>
      {mobileNavOpen ? <button className="mobile-scrim" aria-label="Tutup navigasi" onClick={() => setMobileNavOpen(false)} /> : null}

      <section className="dashboard-workspace">
        <header className="dashboard-topbar">
          <div className="topbar-title">
            <button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={22} /></button>
            <div><small>Dashboard Guru / {currentRoute.title}</small><strong>{currentRoute.title}</strong></div>
          </div>
          <div className="topbar-controls">
            <FilterSelect label="Kelas" icon={School} value={dashboard.classId} options={classOptions} onValueChange={dashboard.setClassId} />
            <FilterSelect label="Periode" icon={BookOpenCheck} value={dashboard.period} options={periodOptions} onValueChange={dashboard.setPeriod} compact />
            <button className="manage-class-button" type="button" onClick={() => setManageOpen(true)}><Settings2 size={18} /> Kelola kelas</button>
            <button className="icon-button notification-button" type="button" onClick={() => notify('Tidak ada notifikasi baru pada demo ini.', 2600)} aria-label="Notifikasi"><Bell size={20} /></button>
            <div className="profile-wrap">
              <button className="profile-trigger" type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
                <span className="teacher-avatar">RS</span><span><strong>Bu Rani</strong><small>Guru IPS</small></span><ChevronDown size={15} />
              </button>
              {profileOpen ? (
                <div className="profile-menu">
                  <div className="profile-menu-head"><CircleUserRound size={20} /><span><strong>Rani Suryani</strong><small>guru@moniy.id</small></span></div>
                  <label>Mode data contoh<select value={dashboard.mode} onChange={(event) => dashboard.setMode(event.target.value as DataMode)}><option value="normal">Normal</option><option value="loading">Memuat</option><option value="empty">Kosong</option><option value="error">Error</option></select></label>
                  <button type="button" onClick={() => window.location.assign('/')}>Keluar dari demo</button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="mock-banner"><span><span className="mock-dot" /> Data contoh frontend</span><p>Tidak ada data siswa nyata, backend, atau analisis AI produksi yang terhubung.</p></div>
          {dashboard.status === 'loading' ? <LoadingState /> : null}
          {dashboard.status === 'error' ? (
            <div className="error-state"><span><RefreshCw size={28} /></span><h1>Data contoh gagal dimuat</h1><p>Ini adalah state error untuk kesiapan integrasi backend.</p><button className="primary-button" type="button" onClick={dashboard.reload}>Coba lagi</button></div>
          ) : null}
          {dashboard.status === 'success' ? children : null}
        </main>
      </section>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="detail-modal manage-class-modal" showCloseButton={false}>
          <button className="modal-close" onClick={() => setManageOpen(false)} aria-label="Tutup"><X size={20} /></button>
          <DialogTitle id="manage-title">Atur kelas contoh</DialogTitle>
          <DialogDescription>Perubahan di sini hanya berlaku pada antarmuka demo.</DialogDescription>
          <div className="class-code-panel"><span>Kode kelas</span><strong>MONIY-XA26</strong><button type="button" onClick={() => { void navigator.clipboard?.writeText('MONIY-XA26'); notify('Kode kelas contoh disalin.'); setManageOpen(false); }}>Salin kode</button></div>
          <div className="manage-actions"><button className="secondary-button" onClick={() => window.alert('Penambahan siswa memerlukan backend dan belum tersedia pada demo frontend.')}>Tambah siswa</button><button className="secondary-button" onClick={() => window.alert('Pengaturan modul tersimpan hanya sebagai simulasi antarmuka.')}>Atur modul</button></div>
        </DialogContent>
      </Dialog>
      {toast ? <output className="toast-message">{toast}</output> : null}
    </div>
  );
}
