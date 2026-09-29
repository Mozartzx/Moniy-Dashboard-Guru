'use client';

import { ArrowRight, CheckCircle2, FileSpreadsheet, X } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { ClassroomSnapshot, CommunityPost } from '@/lib/moniy/types';
import { EmptyState } from './page-primitives';

const filters = [
  { value: 'pending', label: 'Belum ditinjau' },
  { value: 'reviewed', label: 'Sudah ditinjau' },
  { value: 'all', label: 'Semua' },
] as const;

export function CommunityPage({ snapshot, onReview }: { snapshot: ClassroomSnapshot; onReview: (postId: string) => Promise<void> }) {
  const [filter, setFilter] = useState<'pending' | 'reviewed' | 'all'>('pending');
  const [selected, setSelected] = useState<CommunityPost | null>(null);
  const [saving, setSaving] = useState(false);
  const posts = snapshot.communityPosts.filter((post) => filter === 'all' || (filter === 'pending' ? !post.reviewed : post.reviewed));

  const markReviewed = async () => {
    if (!selected) return;
    setSaving(true);
    await onReview(selected.id);
    setSaving(false);
    setSelected(null);
  };

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div><span className="page-kicker">Monitoring komunitas</span><h1>Komunitas kelas</h1><p>Tinjau hasil Simulasi Bisnis untuk bahan umpan balik dan presentasi.</p></div>
        <fieldset className="segmented-control" aria-label="Filter status tinjauan" style={{ '--segment-index': filters.findIndex((item) => item.value === filter) } as CSSProperties}>
          <span className="segmented-indicator" aria-hidden="true" />
          {filters.map((item) => <button type="button" key={item.value} className={filter === item.value ? 'active' : ''} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>)}
        </fieldset>
      </section>

      {posts.length ? <section className="community-grid filter-swap" key={filter}>{posts.map((post) => (
        <article className="community-card" key={post.id}>
          <div className="community-card-head"><span className="student-avatar large">{post.initials}</span><div><strong>{post.studentName}</strong><span>{post.submittedAt}</span></div><span className={post.reviewed ? 'status-chip status-done' : 'status-chip status-not-started'}>{post.reviewed ? 'Sudah ditinjau' : 'Belum ditinjau'}</span></div>
          <div className="business-visual"><span><FileSpreadsheet size={35} /></span><small>{post.businessType}</small></div>
          <h2>{post.title}</h2><p>{post.epilogue}</p>
          <button className={post.reviewed ? 'secondary-button' : 'primary-button'} type="button" onClick={() => setSelected(post)}>{post.reviewed ? 'Buka hasil' : 'Tinjau hasil'} <ArrowRight size={17} /></button>
        </article>
      ))}</section> : <div className="surface-card filter-swap" key={filter}><EmptyState title="Tidak ada postingan" description="Tidak ada hasil komunitas untuk filter ini." /></div>}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected ? (
          <DialogContent className="detail-modal community-dialog-content" showCloseButton={false}>
            <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="Tutup detail"><X size={20} /></button>
            <span className="page-kicker">Hasil Simulasi Bisnis</span>
            <DialogTitle id="community-detail-title">{selected.title}</DialogTitle>
            <DialogDescription className="modal-lead">{selected.studentName} | {selected.businessType}</DialogDescription>
            <div className="modal-result"><CheckCircle2 size={23} /><div><strong>{selected.epilogue}</strong><p>{selected.summary}</p></div></div>
            <div className="modal-section"><h3>Catatan guru</h3><textarea aria-label="Catatan guru" placeholder="Tulis umpan balik untuk hasil ini..." rows={4} /></div>
            <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setSelected(null)}>Tutup</button>{!selected.reviewed ? <button className="primary-button" type="button" onClick={markReviewed} disabled={saving}>{saving ? 'Menyimpan...' : 'Tandai sudah ditinjau'}</button> : null}</div>
            <small className="mock-modal-note">Catatan guru di atas belum tersimpan ke server.</small>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
