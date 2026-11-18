'use client';

import { useDashboardContext } from '@/components/moniy/dashboard/dashboard-context';
import { ReflectionArchivePage } from '@/components/moniy/pages/reflection-archive-page';

export default function ReflectionArchiveRoute() {
  const { dashboard } = useDashboardContext();
  return dashboard.snapshot ? <ReflectionArchivePage classId={dashboard.snapshot.classId} /> : null;
}
