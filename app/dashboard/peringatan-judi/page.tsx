'use client';

import { useDashboardContext } from '@/components/moniy/dashboard/dashboard-context';
import { RiskPage } from '@/components/moniy/pages/risk-page';

export default function RiskRoute() {
  const { dashboard } = useDashboardContext();
  return dashboard.snapshot ? <RiskPage snapshot={dashboard.snapshot} /> : null;
}
