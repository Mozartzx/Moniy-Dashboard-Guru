'use client';

import { useDashboardContext } from '@/components/moniy/dashboard/dashboard-context';
import { StudentsPage } from '@/components/moniy/pages/students-page';

export default function StudentsRoute() {
  const { dashboard } = useDashboardContext();
  return dashboard.snapshot ? <StudentsPage snapshot={dashboard.snapshot} /> : null;
}
