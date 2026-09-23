import { Search } from 'lucide-react';
import type { LearningStatus } from '@/lib/moniy/types';

export function statusClass(status: LearningStatus) {
  if (status === 'Selesai') return 'status-chip status-done';
  if (status === 'Berjalan') return 'status-chip status-progress';
  return 'status-chip status-not-started';
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon"><Search size={25} /></span>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}
