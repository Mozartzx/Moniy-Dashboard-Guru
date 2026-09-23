'use client';

import { useDashboardContext } from '@/components/moniy/dashboard/dashboard-context';
import { ProgressPage } from '@/components/moniy/pages/progress-page';

export default function ProgressRoute() {
  const { dashboard } = useDashboardContext();
  return dashboard.snapshot ? <ProgressPage snapshot={dashboard.snapshot} /> : null;
}
