import type { ReactNode } from 'react';
import { DashboardProvider } from '@/components/moniy/dashboard/dashboard-context';
import { DashboardShell } from '@/components/moniy/dashboard/dashboard-shell';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardProvider><DashboardShell>{children}</DashboardShell></DashboardProvider>;
}
