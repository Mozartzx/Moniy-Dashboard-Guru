'use client';

import { useDashboardContext } from '@/components/moniy/dashboard/dashboard-context';
import { OverviewPage } from '@/components/moniy/pages/overview-page';

export default function OverviewRoute() {
  const { dashboard, teacher } = useDashboardContext();
  return dashboard.snapshot ? <OverviewPage snapshot={dashboard.snapshot} teacherName={teacher?.name} /> : null;
}
