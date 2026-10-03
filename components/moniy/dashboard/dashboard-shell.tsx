'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BookOpenCheck,
  ArrowLeftRight,
  ChevronDown,
  CircleUserRound,
  GraduationCap,
  LogOut,
  Menu,
  RefreshCw,
  School,
  Settings2,
  UserRoundCog,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { periodOptions } from '@/lib/moniy/period';
import { dashboardRoutes, getDashboardRoute } from '@/lib/moniy/navigation';
import { BrowserNavigationLink } from '@/components/moniy/browser-navigation-link';
import { useDashboardContext } from './dashboard-context';
import { FilterSelect } from './filter-select';
import { AccountSettingsDialog, ManageClassDialog, SignOutDialog } from './shell-dialogs';

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
  const { dashboard, className, classOptions, activeClass, teacher, reloadSession, toast, notify } = useDashboardContext();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [profileOpen]);

  const teacherInitials = teacher?.name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase() ?? '..';

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <BrowserNavigationLink href="/dashboard/ringkasan" className="sidebar-logo-link" aria-label="Moniy, ke ringkasan dashboard" onClick={() => setMobileNavOpen(false)}>
            <Image src="/assets/moniy-logo.png" alt="" width={148} height={43} priority />
          </BrowserNavigationLink>
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
        <BrowserNavigationLink href="/kelas" className="sidebar-class-card" aria-label={`Kelas aktif ${className}. Ganti kelas`}>
          <span><School size={18} /></span>
          <div>
            <small>Kelas aktif</small><strong>{className}</strong><p>{dashboard.snapshot?.studentCount ?? 0} siswa</p>
            <em className="sidebar-class-swap"><ArrowLeftRight size={14} /> Ganti kelas</em>
          </div>
        </BrowserNavigationLink>
      </aside>
      {mobileNavOpen ? <button className="mobile-scrim" aria-label="Tutup navigasi" onClick={() => setMobileNavOpen(false)} /> : null}

      <section className="dashboard-workspace">
        <header className="dashboard-topbar">
          <div className="topbar-title">
            <button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={22} /></button>
            <div>
              <small className="crumbs"><BrowserNavigationLink href="/kelas">Daftar kelas</BrowserNavigationLink> / {className || '...'} / {currentRoute.title}</small>
              <strong>{currentRoute.title}</strong>
            </div>
          </div>
          <div className="topbar-controls">
            <FilterSelect label="Kelas" icon={School} value={dashboard.classId} options={classOptions} onValueChange={dashboard.setClassId} />
            <FilterSelect label="Periode" icon={BookOpenCheck} value={dashboard.period} options={periodOptions} onValueChange={dashboard.setPeriod} compact />
            <button className="manage-class-button" type="button" onClick={() => setManageOpen(true)}><Settings2 size={18} /> Kelola kelas</button>
            <button className="icon-button notification-button" type="button" onClick={() => notify('Tidak ada notifikasi baru.', 2600)} aria-label="Notifikasi"><Bell size={20} /></button>
            <div className="profile-wrap" ref={profileRef}>
              <button className="profile-trigger" type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
                <span className="teacher-avatar">{teacherInitials}</span><span><strong>{teacher?.name ?? 'Memuat...'}</strong><small>Guru</small></span><ChevronDown size={15} />
              </button>
              {profileOpen ? (
                <div className="profile-menu">
                  <div className="profile-menu-head"><CircleUserRound size={20} /><span><strong>{teacher?.name ?? '-'}</strong><small>{teacher?.email ?? '-'}</small></span></div>
                  <button className="profile-menu-item" type="button" onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}><UserRoundCog size={18} /> Pengaturan akun</button>
                  <button className="danger-button" type="button" onClick={() => { setProfileOpen(false); setSignOutOpen(true); }}><LogOut size={17} /> Keluar</button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          {dashboard.status === 'loading' ? <LoadingState /> : null}
          {dashboard.status === 'error' ? (
            <div className="error-state"><span><RefreshCw size={28} /></span><h1>Data gagal dimuat</h1><p>Terjadi kendala saat mengambil data kelas.</p><button className="primary-button" type="button" onClick={dashboard.reload}>Coba lagi</button></div>
          ) : null}
          {dashboard.status === 'success' ? children : null}
        </main>
      </section>

      <ManageClassDialog open={manageOpen} onOpenChange={setManageOpen} activeClass={activeClass} studentCount={dashboard.snapshot?.studentCount ?? 0} onSaved={reloadSession} notify={notify} />
      <AccountSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} teacher={teacher} onSaved={reloadSession} notify={notify} />
      <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
      {toast ? <output className="toast-message">{toast}</output> : null}
    </div>
  );
}
