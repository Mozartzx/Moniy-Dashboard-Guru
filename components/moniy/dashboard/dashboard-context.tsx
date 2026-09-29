'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMoniyDashboard } from '@/hooks/use-moniy-dashboard';
import { periodOptions } from '@/lib/moniy/period';
import { getCurrentTeacher, getMyClasses } from '@/lib/moniy/session';
import type { TeacherClass, TeacherProfile } from '@/lib/moniy/teacher';

type DashboardContextValue = {
  dashboard: ReturnType<typeof useMoniyDashboard>;
  classOptions: Array<{ value: string; label: string }>;
  activeClass: TeacherClass | null;
  className: string;
  periodLabel: string;
  teacher: TeacherProfile | null;
  reloadSession: () => Promise<void>;
  toast: string;
  notify: (message: string, duration?: number) => void;
  reviewCommunityPost: (postId: string) => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const dashboard = useMoniyDashboard(classes.map((item) => item.id));
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);

  const reloadSession = async () => {
    const [nextClasses, nextTeacher] = await Promise.all([getMyClasses(), getCurrentTeacher()]);
    setClasses(nextClasses);
    setTeacher(nextTeacher);
  };

  useEffect(() => {
    void getMyClasses().then(setClasses);
    void getCurrentTeacher().then(setTeacher);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const notify = (message: string, duration = 3000) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), duration);
  };

  const classOptions = classes.map((item) => ({ value: item.id, label: item.name }));

  const value: DashboardContextValue = {
    dashboard,
    classOptions,
    activeClass: classes.find((item) => item.id === dashboard.classId) ?? null,
    className: classOptions.find((item) => item.value === dashboard.classId)?.label ?? dashboard.classId,
    periodLabel: periodOptions.find((item) => item.value === dashboard.period)?.label ?? dashboard.period,
    teacher,
    reloadSession,
    toast,
    notify,
    reviewCommunityPost: async (postId) => {
      await dashboard.markPostReviewed(postId);
      notify('Postingan ditandai sudah ditinjau.');
    },
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error('useDashboardContext must be used inside DashboardProvider');
  return value;
}
