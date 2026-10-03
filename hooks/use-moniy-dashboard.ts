'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getActiveClassId, setActiveClassId } from '@/lib/moniy/active-class';
import { teacherDashboardRepository } from '@/lib/moniy/repository';
import { periodOptions } from '@/lib/moniy/period';
import type { ClassroomSnapshot } from '@/lib/moniy/types';

export function useMoniyDashboard(classIds: string[]) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const classId = classIds.includes(selectedClassId) ? selectedClassId : classIds[0] || '';
  const setClassId = useCallback((id: string) => {
    setActiveClassId(id);
    setSelectedClassId(id);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSelectedClassId(getActiveClassId()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const [period, setPeriod] = useState(periodOptions[0].value);
  const [snapshot, setSnapshot] = useState<ClassroomSnapshot | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const load = useCallback(async () => {
    if (!classId) return;
    setStatus('loading');
    try {
      const data = await teacherDashboardRepository.getSnapshot({ classId, period });
      setSnapshot(data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [classId, period]);

  useEffect(() => {
    if (!classId) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load, classId]);

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
    snapshot,
    status: classId ? status : 'loading' as const,
    reload: load,
    markPostReviewed,
    pendingCommunityCount,
  };
}
