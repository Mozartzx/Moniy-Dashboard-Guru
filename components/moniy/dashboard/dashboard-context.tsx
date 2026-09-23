'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMoniyDashboard } from '@/hooks/use-moniy-dashboard';
import { classOptions, periodOptions } from '@/lib/moniy/mock-data';

type DashboardContextValue = {
  dashboard: ReturnType<typeof useMoniyDashboard>;
  className: string;
  periodLabel: string;
  toast: string;
  notify: (message: string, duration?: number) => void;
  reviewCommunityPost: (postId: string) => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const dashboard = useMoniyDashboard();
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const notify = (message: string, duration = 3000) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), duration);
  };

  const value: DashboardContextValue = {
    dashboard,
    className: classOptions.find((item) => item.value === dashboard.classId)?.label ?? dashboard.classId,
    periodLabel: periodOptions.find((item) => item.value === dashboard.period)?.label ?? dashboard.period,
    toast,
    notify,
    reviewCommunityPost: async (postId) => {
      await dashboard.markPostReviewed(postId);
      notify('Postingan ditandai sudah ditinjau pada data contoh.');
    },
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error('useDashboardContext must be used inside DashboardProvider');
  return value;
}
