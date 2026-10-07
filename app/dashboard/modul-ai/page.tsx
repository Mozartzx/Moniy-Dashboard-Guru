'use client';

import { ModuleGeneratorPage } from '@/components/moniy/pages/module-generator-page';
import { useDashboardContext } from '@/components/moniy/dashboard/dashboard-context';

export default function ModuleGeneratorRoute() {
  const { notify } = useDashboardContext();
  return <ModuleGeneratorPage notify={notify} />;
}
