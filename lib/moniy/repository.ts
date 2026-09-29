import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';
import { periodToRange } from './period';
import type {
  ClassroomSnapshot,
  CommunityPost,
  DashboardQuery,
  LearningDecision,
  RiskTrend,
  Student,
  TeacherDashboardRepository,
  TopicProgress,
} from './types';

// ponytail: quiz_results has no per-question log and quizzes has no topic_id yet
// (topic_id is deferred to the mobile side, see tasks/mobile-team-requests.md), so
// per-topic "quizAverage"/"correctRate" below is a proxy from user_module_progress.score,
// and commonMistake/mistakeRate can't be computed honestly until that log exists.
const NOT_AVAILABLE = 'Belum tersedia';

function riskLevelFor(eventCount: number): ClassroomSnapshot['riskLevel'] {
  // ponytail: simple event-count thresholds, no spec-defined ambient baseline yet
  if (eventCount >= 15) return 'Tinggi';
  if (eventCount >= 5) return 'Sedang';
  return 'Rendah';
}

function statusFor(completed: number, total: number): Student['status'] {
  if (total === 0 || completed === 0) return completed === 0 ? 'Belum' : 'Berjalan';
  return completed >= total ? 'Selesai' : 'Berjalan';
}

class SupabaseTeacherDashboardRepository implements TeacherDashboardRepository {
  async getSnapshot(query: DashboardQuery): Promise<ClassroomSnapshot> {
    const supabase = createClient();
    const { classId, period } = query;
    const { from, to, previousFrom } = periodToRange(period);

    const [{ data: classRow }, { data: studentUsers }, { data: allModules }, { data: topicsMeta }] = await Promise.all([
      supabase.from('classes').select('id, name').eq('id', classId).maybeSingle(),
      supabase.from('users').select('id, name').eq('class_id', classId).eq('role', 'student'),
      supabase.from('modules').select('id, title, topic_id'),
      supabase.from('module_topics').select('id, title, color'),
    ]);

    const studentRows = studentUsers ?? [];
    const studentIds = studentRows.map((row) => row.id);
    const moduleRows = allModules ?? [];
    const topicRows = topicsMeta ?? [];

    const [{ data: progressRows }, { data: quizRows }, { data: decisionRows }, { data: gamblingRows }, { data: postRows }] = await Promise.all([
      studentIds.length
        ? supabase.from('user_module_progress').select('user_id, module_id, progress, score, completed_at').in('user_id', studentIds)
        : Promise.resolve({ data: [] as Array<{ user_id: number; module_id: number; progress: number | null; score: number | null; completed_at: string | null }> }),
      studentIds.length
        ? supabase.from('quiz_results').select('user_id, score').in('user_id', studentIds)
        : Promise.resolve({ data: [] as Array<{ user_id: number; score: number | null }> }),
      studentIds.length
        ? supabase
            .from('user_decisions')
            .select('id, user_id, is_correct, ai_verdict, free_text, created_at, modules(title), game_scenarios(decision_text)')
            .in('user_id', studentIds)
            .order('created_at', { ascending: false })
            .limit(120)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
      supabase
        .from('gambling_exposure_events')
        .select('severity, detected_at')
        .eq('class_id', classId)
        .gte('detected_at', previousFrom.toISOString())
        .lte('detected_at', to.toISOString()),
      supabase
        .from('community_posts')
        .select('id, content, reviewed, created_at, community_groups!inner(class_id), users(name)')
        .eq('community_groups.class_id', classId)
        .order('created_at', { ascending: false }),
    ]);

    const progress = progressRows ?? [];
    const quizzes = quizRows ?? [];
    const decisions = (decisionRows ?? []) as Array<{
      id: number;
      user_id: number;
      is_correct: boolean | null;
      ai_verdict: string | null;
      free_text: string | null;
      created_at: string;
      modules: { title: string } | null;
      game_scenarios: { decision_text: string } | null;
    }>;
    const gamblingEvents = gamblingRows ?? [];
    const currentPeriodEvents = gamblingEvents.filter((event) => new Date(event.detected_at) >= from);
    const previousPeriodEvents = gamblingEvents.filter((event) => new Date(event.detected_at) < from);
    const posts = (postRows ?? []) as unknown as Array<{ id: number; content: string; reviewed: boolean; created_at: string; users: { name: string } | null }>;

    const totalModules = moduleRows.length;

    const scoresByStudent = new Map<number, number[]>();
    for (const row of quizzes) {
      if (row.score == null) continue;
      const list = scoresByStudent.get(row.user_id) ?? [];
      list.push(row.score);
      scoresByStudent.set(row.user_id, list);
    }
    const progressByStudent = new Map<number, typeof progress>();
    for (const row of progress) {
      const list = progressByStudent.get(row.user_id) ?? [];
      list.push(row);
      progressByStudent.set(row.user_id, list);
    }
    const decisionsByStudent = new Map<number, LearningDecision[]>();
    for (const row of decisions) {
      const list = decisionsByStudent.get(row.user_id) ?? [];
      list.push({
        id: String(row.id),
        title: row.game_scenarios?.decision_text ?? 'Keputusan simulasi',
        chapter: row.modules?.title ?? 'Modul',
        note: row.free_text ?? row.ai_verdict ?? '-',
        outcome: row.is_correct === false ? 'perlu-refleksi' : 'tepat',
        time: format(new Date(row.created_at), "d MMM, HH.mm", { locale: idLocale }),
      });
      decisionsByStudent.set(row.user_id, list);
    }

    const students: Student[] = studentRows.map((row) => {
      const studentProgress = progressByStudent.get(row.id) ?? [];
      const completedTopics = studentProgress.filter((item) => (item.progress ?? 0) >= 1).length;
      const scores = scoresByStudent.get(row.id) ?? [];
      const score = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;
      const initials = row.name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase();
      const inProgressModule = studentProgress.find((item) => (item.progress ?? 0) < 1 && (item.progress ?? 0) > 0);
      const latestModuleId = inProgressModule?.module_id ?? studentProgress.at(-1)?.module_id;
      const activeModule = moduleRows.find((module) => module.id === latestModuleId)?.title ?? '-';
      const needsSupport = score !== null ? score < 70 : completedTopics === 0 && totalModules > 0;

      return {
        id: String(row.id),
        name: row.name,
        initials,
        activeModule,
        status: statusFor(completedTopics, totalModules),
        score,
        completedTopics,
        totalTopics: totalModules,
        needsSupport,
        decisions: decisionsByStudent.get(row.id) ?? [],
      };
    });

    const topics: TopicProgress[] = topicRows.map((topic) => {
      const modulesInTopic = moduleRows.filter((module) => module.topic_id === topic.id);
      const moduleIds = new Set(modulesInTopic.map((module) => module.id));
      const relevantProgress = progress.filter((row) => moduleIds.has(row.module_id));

      let notStarted = 0;
      let inProgress = 0;
      let completed = 0;
      for (const studentId of studentIds) {
        for (const moduleId of moduleIds) {
          const row = relevantProgress.find((item) => item.user_id === studentId && item.module_id === moduleId);
          const value = row?.progress ?? 0;
          if (value >= 1) completed += 1;
          else if (value > 0) inProgress += 1;
          else notStarted += 1;
        }
      }

      const scored = relevantProgress.filter((row) => row.score != null).map((row) => row.score as number);
      const average = scored.length ? Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length) : 0;

      return {
        id: String(topic.id),
        name: topic.title,
        category: topic.title,
        notStarted,
        inProgress,
        completed,
        quizAverage: average,
        correctRate: average,
        commonMistake: NOT_AVAILABLE,
        mistakeRate: 0,
      };
    });

    const allScores = [...quizzes.map((row) => row.score), ...progress.map((row) => row.score)].filter((value): value is number => value != null);
    const averageScore = allScores.length ? Math.round((allScores.reduce((sum, value) => sum + value, 0) / allScores.length) * 10) / 10 : 0;
    const completionRate = progress.length ? Math.round((progress.filter((row) => (row.progress ?? 0) >= 1).length / progress.length) * 100) : 0;
    const supportCount = students.filter((student) => student.needsSupport).length;

    const riskEventCount = currentPeriodEvents.length;
    const previousCount = previousPeriodEvents.length;
    const riskDelta = previousCount === 0 ? (riskEventCount > 0 ? 100 : 0) : Math.round(((riskEventCount - previousCount) / previousCount) * 100);

    const trendByDay = new Map<string, number>();
    for (const event of currentPeriodEvents) {
      const label = format(new Date(event.detected_at), 'dd/MM');
      trendByDay.set(label, (trendByDay.get(label) ?? 0) + 1);
    }
    const riskTrend: RiskTrend[] = [...trendByDay.entries()].map(([label, events]) => ({ label, events }));

    const communityPosts: CommunityPost[] = posts.map((post) => {
      const studentName = post.users?.name ?? 'Siswa';
      return {
        id: String(post.id),
        studentName,
        initials: studentName.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase(),
        title: post.content.length > 48 ? `${post.content.slice(0, 48)}...` : post.content,
        businessType: 'Simulasi Bisnis',
        epilogue: '',
        summary: post.content,
        submittedAt: format(new Date(post.created_at), "d MMM, HH.mm", { locale: idLocale }),
        reviewed: post.reviewed,
      };
    });

    const weakestTopic = [...topics].sort((a, b) => a.correctRate - b.correctRate)[0];
    const insight = weakestTopic
      ? `Topik "${weakestTopic.name}" punya nilai rata-rata terendah di kelas ini (${weakestTopic.correctRate}).`
      : 'Belum ada data progres belajar untuk kelas ini.';
    const recommendation = weakestTopic
      ? `Pertimbangkan membahas ulang "${weakestTopic.name}" pada pertemuan berikutnya.`
      : 'Ajak siswa mulai modul pertama untuk melihat rekomendasi di sini.';

    return {
      classId,
      className: classRow?.name ?? classId,
      studentCount: studentRows.length,
      averageScore,
      completionRate,
      supportCount,
      riskLevel: riskLevelFor(riskEventCount),
      riskDelta,
      riskEventCount,
      topics,
      students,
      riskTrend,
      communityPosts,
      insight,
      recommendation,
    };
  }

  async markCommunityPostReviewed(postId: string): Promise<void> {
    const supabase = createClient();
    await supabase.from('community_posts').update({ reviewed: true }).eq('id', Number(postId));
  }
}

export const teacherDashboardRepository: TeacherDashboardRepository = new SupabaseTeacherDashboardRepository();
