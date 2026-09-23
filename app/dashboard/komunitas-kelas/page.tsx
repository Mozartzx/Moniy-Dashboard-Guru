'use client';

import { CommunityPage } from '@/components/moniy/pages/community-page';
import { useDashboardContext } from '@/components/moniy/dashboard/dashboard-context';

export default function CommunityRoute() {
  const { dashboard, reviewCommunityPost } = useDashboardContext();
  return dashboard.snapshot ? <CommunityPage snapshot={dashboard.snapshot} onReview={reviewCommunityPost} /> : null;
}
