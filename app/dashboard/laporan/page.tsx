'use client';

import { ReportsPage } from '@/components/moniy/pages/reports-page';
import { useDashboardContext } from '@/components/moniy/dashboard/dashboard-context';

export default function ReportsRoute() {
  const { dashboard, className, periodLabel } = useDashboardContext();
  return dashboard.snapshot ? <ReportsPage snapshot={dashboard.snapshot} className={className} periodLabel={periodLabel} /> : null;
}
