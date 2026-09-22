'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { teacherDashboardRepository } from '@/lib/moniy/repository';
import type { ClassroomSnapshot, DataMode } from '@/lib/moniy/types';

export function useMoniyDashboard() {
  const [classId, setClassId] = useState('x-a');
  const [period, setPeriod] = useState('7-hari');
  const [mode, setMode] = useState<DataMode>('normal');
  const [snapshot, setSnapshot] = useState<ClassroomSnapshot | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    if (mode === 'loading') return;
    if (mode === 'error') {
      window.setTimeout(() => setStatus('error'), 450);
      return;
    }
    try {
      const data = await teacherDashboardRepository.getSnapshot({ classId, period });
      setSnapshot(mode === 'empty' ? { ...data, topics: [], students: [], communityPosts: [], riskTrend: [] } : data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [classId, period, mode]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const markPostReviewed = useCallback(async (postId: string) => {
    await teacherDashboardRepository.markCommunityPostReviewed(postId);
    setSnapshot((current) => current ? {
      ...current,
      communityPosts: current.communityPosts.map((post) => post.id === postId ? { ...post, reviewed: true } : post),
    } : current);
  }, []);

  const pendingCommunityCount = useMemo(
    () => snapshot?.communityPosts.filter((post) => !post.reviewed).length ?? 0,
    [snapshot],
  );

  return {
    classId,
    setClassId,
    period,
    setPeriod,
    mode,
    setMode,
    snapshot,
    status,
    reload: load,
    markPostReviewed,
    pendingCommunityCount,
  };
}
