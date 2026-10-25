'use client';

import { QuestPage } from '@/components/moniy/pages/quest-page';
import { useDashboardContext } from '@/components/moniy/dashboard/dashboard-context';

export default function QuestRoute() {
  const { notify, classOptions, setFocusMode } = useDashboardContext();
  return <QuestPage notify={notify} classOptions={classOptions} onFocusChange={setFocusMode} />;
}
