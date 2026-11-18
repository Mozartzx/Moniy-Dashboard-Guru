import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';
import { periodToRange } from './period';
import type {
  ClassroomSnapshot,
  CommunityPost,
  DashboardQuery,
  LearningDecision,
  DecisionRankItem,
  ReflectionArchiveItem,
  RiskTrend,
  StudentConclusion,
  StudentReflection,
  StudentReport,
  StudentStory,
  Student,
  TeacherDashboardRepository,
  TopicChoice,
  TopicProgress,
  TopicReport,
  TopicStudentReport,
} from './types';

// Per-topic quiz numbers come from quizzes.topic_id + quiz_results, and the most
// frequent mistake from quiz_answer_log (migrations 019). Topics whose quizzes have no
// results yet fall back to a proxy from user_module_progress.score; commonMistake stays
// "Belum tersedia" until at least MIN_ATTEMPTS answers to a question are logged.
const NOT_AVAILABLE = 'Belum tersedia';
const MIN_ATTEMPTS = 3;

function riskLevelFor(eventCount: number): ClassroomSnapshot['riskLevel'] {
  // ponytail: simple event-count thresholds, no spec-defined ambient baseline yet
  if (eventCount >= 15) return 'Tinggi';
  if (eventCount >= 5) return 'Sedang';
  return 'Rendah';
}

function statusFor(completed: number, total: number, started: boolean): Student['status'] {
  if (completed === 0) return started ? 'Berjalan' : 'Belum';
  return total > 0 && completed >= total ? 'Selesai' : 'Berjalan';
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
      // Hanya 8 chapter resmi (chapter bukan null); topik lama seperti Wirausaha/Pajak tidak ditampilkan.
      supabase.from('module_topics').select('id, title, color').not('chapter', 'is', null).order('chapter'),
    ]);

    const studentRows = studentUsers ?? [];
    const studentIds = studentRows.map((row) => row.id);
    const topicRows = topicsMeta ?? [];
    const chapterTopicIds = new Set(topicRows.map((topic) => topic.id));
    const moduleRows = (allModules ?? []).filter((module) => chapterTopicIds.has(module.topic_id));

    const [{ data: progressRows }, { data: quizRows }, { data: decisionRows }, { data: gamblingRows }, { data: postRows }, { data: quizMetaRows }, { data: questionRows }, { data: answerLogRows }] = await Promise.all([
      studentIds.length
        ? supabase.from('user_module_progress').select('user_id, module_id, progress, score, completed_at').in('user_id', studentIds)
        : Promise.resolve({ data: [] as Array<{ user_id: number; module_id: number; progress: number | null; score: number | null; completed_at: string | null }> }),
      studentIds.length
        ? supabase.from('quiz_results').select('user_id, quiz_id, score').in('user_id', studentIds)
        : Promise.resolve({ data: [] as Array<{ user_id: number; quiz_id: number; score: number | null }> }),
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
        .select('id, content, reviewed, teacher_note, created_at, community_groups!inner(class_id), users(name)')
        .eq('community_groups.class_id', classId)
        .order('created_at', { ascending: false }),
      supabase.from('quizzes').select('id, topic_id'),
      supabase.from('quiz_questions').select('id, quiz_id, question_text'),
      studentIds.length
        ? supabase.from('quiz_answer_log').select('user_id, quiz_id, question_id, is_correct').in('user_id', studentIds)
        : Promise.resolve({ data: [] as Array<{ user_id: number; quiz_id: number; question_id: number; is_correct: boolean }> }),
    ]);

    const progress = progressRows ?? [];
    const quizzes = quizRows ?? [];
    const quizTopicById = new Map<number, number | null>((quizMetaRows ?? []).map((quiz) => [quiz.id, quiz.topic_id]));
    const questionTextById = new Map<number, string>((questionRows ?? []).map((question) => [question.id, question.question_text]));
    const answerLog = (answerLogRows ?? []) as Array<{ user_id: number; quiz_id: number; question_id: number; is_correct: boolean }>;
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
    const posts = (postRows ?? []) as unknown as Array<{ id: number; content: string; reviewed: boolean; teacher_note: string | null; created_at: string; users: { name: string } | null }>;

    const totalChapters = topicRows.length;

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
        note: row.free_text ?? row.ai_verdict ?? '',
        outcome: row.is_correct === false ? 'perlu-refleksi' : 'tepat',
        time: format(new Date(row.created_at), "d MMM, HH.mm", { locale: idLocale }),
      });
      decisionsByStudent.set(row.user_id, list);
    }

    const students: Student[] = studentRows.map((row) => {
      const studentProgress = progressByStudent.get(row.id) ?? [];
      // Progres dihitung per chapter (8 topik), bukan per modul varian, supaya x/8 bermakna.
      const topicOfModule = new Map(moduleRows.map((item) => [item.id, item.topic_id]));
      const completedTopics = new Set(studentProgress.filter((item) => (item.progress ?? 0) >= 1).map((item) => topicOfModule.get(item.module_id))).size;
      const quizScores = scoresByStudent.get(row.id) ?? [];
      const scores = quizScores.length ? quizScores : studentProgress.filter((item) => item.score != null).map((item) => item.score as number);
      const score = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;
      const initials = row.name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase();
      const inProgressModule = studentProgress.find((item) => (item.progress ?? 0) < 1 && (item.progress ?? 0) > 0);
      const latestModuleId = inProgressModule?.module_id ?? studentProgress.at(-1)?.module_id;
      const activeModule = moduleRows.find((module) => module.id === latestModuleId)?.title ?? '-';
      const needsSupport = score !== null ? score < 70 : completedTopics === 0 && totalChapters > 0;

      return {
        id: String(row.id),
        name: row.name,
        initials,
        activeModule,
        status: statusFor(completedTopics, totalChapters, studentProgress.some((item) => (item.progress ?? 0) > 0)),
        score,
        completedTopics,
        totalTopics: totalChapters,
        needsSupport,
        decisions: decisionsByStudent.get(row.id) ?? [],
      };
    });

    const topics: TopicProgress[] = topicRows.map((topic) => {
      const modulesInTopic = moduleRows.filter((module) => module.topic_id === topic.id);
      const moduleIds = new Set(modulesInTopic.map((module) => module.id));
      const relevantProgress = progress.filter((row) => moduleIds.has(row.module_id));

      // Dihitung per siswa (bukan per modul varian): selesai bila ada modul di topik ini yang tamat,
      // berjalan bila baru ada yang dimulai, selain itu belum. Totalnya sama dengan jumlah siswa.
      let notStarted = 0;
      let inProgress = 0;
      let completed = 0;
      for (const studentId of studentIds) {
        const mine = relevantProgress.filter((item) => item.user_id === studentId);
        if (mine.some((item) => (item.progress ?? 0) >= 1)) completed += 1;
        else if (mine.some((item) => (item.progress ?? 0) > 0)) inProgress += 1;
        else notStarted += 1;
      }

      const quizScores = quizzes
        .filter((row) => row.score != null && quizTopicById.get(row.quiz_id) === topic.id)
        .map((row) => row.score as number);
      const scored = quizScores.length
        ? quizScores
        : relevantProgress.filter((row) => row.score != null).map((row) => row.score as number);
      const average = scored.length ? Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length) : 0;

      const topicLog = answerLog.filter((entry) => quizTopicById.get(entry.quiz_id) === topic.id);
      const correctRate = topicLog.length ? Math.round((topicLog.filter((entry) => entry.is_correct).length / topicLog.length) * 100) : average;
      const attemptsByQuestion = new Map<number, { total: number; wrong: number }>();
      for (const entry of topicLog) {
        const stat = attemptsByQuestion.get(entry.question_id) ?? { total: 0, wrong: 0 };
        stat.total += 1;
        if (!entry.is_correct) stat.wrong += 1;
        attemptsByQuestion.set(entry.question_id, stat);
      }
      let worst: { questionId: number; total: number; wrong: number } | null = null;
      for (const [questionId, stat] of attemptsByQuestion) {
        if (stat.total < MIN_ATTEMPTS || stat.wrong === 0) continue;
        if (!worst || stat.wrong / stat.total > worst.wrong / worst.total || (stat.wrong / stat.total === worst.wrong / worst.total && stat.total > worst.total)) {
          worst = { questionId, ...stat };
        }
      }

      return {
        id: String(topic.id),
        name: topic.title,
        category: topic.title,
        notStarted,
        inProgress,
        completed,
        quizAverage: average,
        correctRate,
        commonMistake: worst
          ? `Soal “${questionTextById.get(worst.questionId) ?? 'Soal kuis'}” paling sering dijawab salah (${worst.wrong} dari ${worst.total} jawaban)`
          : NOT_AVAILABLE,
        mistakeRate: worst ? Math.round((worst.wrong / worst.total) * 100) : 0,
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
        businessType: 'Simulasi Keuangan',
        epilogue: '',
        summary: post.content,
        submittedAt: format(new Date(post.created_at), "d MMM, HH.mm", { locale: idLocale }),
        reviewed: post.reviewed,
        teacherNote: post.teacher_note ?? '',
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

  // Detail satu topik: nilai dan saldo akhir tiap siswa serta pilihan di setiap langkah simulasi.
  // Selesai = user_module_progress.progress >= 1; saldo, target, dan pilihan dari story_journeys.
  async getTopicReport(classId: string, topicId: string): Promise<TopicReport> {
    const supabase = createClient();
    const [{ data: users }, { data: topic }, { data: modules }] = await Promise.all([
      supabase.from('users').select('id, name').eq('class_id', classId).eq('role', 'student'),
      supabase.from('module_topics').select('title').eq('id', Number(topicId)).maybeSingle(),
      supabase.from('modules').select('id').eq('topic_id', Number(topicId)),
    ]);
    const studentRows = users ?? [];
    const studentIds = studentRows.map((row) => row.id);
    const moduleIds = (modules ?? []).map((row) => row.id);

    type Entry = { question: string; answer: string; verdict: TopicChoice['verdict']; consequence: string; cashAfter: number };
    type Journey = { user_id: number; module_id: number; state: { cash?: number; goal?: number; history?: Entry[] } | null };
    const [{ data: progressRows }, { data: journeyRows }] = studentIds.length && moduleIds.length
      ? await Promise.all([
          supabase.from('user_module_progress').select('user_id, module_id, progress, score').in('user_id', studentIds).in('module_id', moduleIds),
          supabase.from('story_journeys').select('user_id, module_id, state').in('user_id', studentIds).in('module_id', moduleIds),
        ])
      : [{ data: [] }, { data: [] }];

    const progress = (progressRows ?? []) as Array<{ user_id: number; module_id: number; progress: number | null; score: number | null }>;
    const journeys = (journeyRows ?? []) as Journey[];

    const students: TopicStudentReport[] = studentRows.map((row) => {
      const mine = progress.filter((item) => item.user_id === row.id);
      const done = mine.filter((item) => (item.progress ?? 0) >= 1);
      const best = done.reduce<(typeof done)[number] | null>((top, item) => (top === null || (item.score ?? 0) > (top.score ?? 0) ? item : top), null);
      const journey = journeys.find((item) => item.user_id === row.id && item.module_id === (best ?? mine[0])?.module_id);
      const state = journey?.state ?? null;
      const finished = best !== null;
      const finalCash = finished && typeof state?.cash === 'number' ? state.cash : null;
      const goal = typeof state?.goal === 'number' ? state.goal : null;
      return {
        id: String(row.id),
        name: row.name,
        initials: row.name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase(),
        status: finished ? 'Selesai' : mine.length || state?.history?.length ? 'Berjalan' : 'Belum',
        score: best?.score ?? null,
        finalCash,
        goal,
        reachedGoal: finalCash !== null && goal !== null && goal > 0 ? finalCash >= goal : null,
        choices: (state?.history ?? []).map((entry) => ({
          question: entry.question,
          answer: entry.answer,
          verdict: entry.verdict,
          consequence: entry.consequence,
          cashAfter: entry.cashAfter,
        })),
      };
    });

    const scores = students.map((student) => student.score).filter((value): value is number => value !== null);
    return {
      topicId,
      topicName: topic?.title ?? 'Topik',
      studentCount: students.length,
      finishedCount: students.filter((student) => student.status === 'Selesai').length,
      averageScore: scores.length ? Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) / 10 : null,
      reachedGoalCount: students.filter((student) => student.reachedGoal === true).length,
      missedGoalCount: students.filter((student) => student.reachedGoal === false).length,
      students: students.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.name.localeCompare(b.name)),
    };
  }

  // Detail satu siswa: tiap cerita yang dikerjakan (pilihan per langkah dari story_journeys),
  // refleksi (story_reflections) beserta tanggapan Moni, dan kesimpulan (story_conclusions).
  // Hanya 8 chapter resmi; data Perisai Judi tidak pernah dibaca di sini.
  async getStudentReport(classId: string, studentId: string): Promise<StudentReport> {
    const supabase = createClient();
    const uid = Number(studentId);
    const [{ data: user }, { data: topics }, { data: modules }] = await Promise.all([
      supabase.from('users').select('id, name').eq('id', uid).eq('class_id', classId).eq('role', 'student').maybeSingle(),
      supabase.from('module_topics').select('id, title').not('chapter', 'is', null).order('chapter'),
      supabase.from('modules').select('id, title, topic_id'),
    ]);
    const topicTitle = new Map((topics ?? []).map((topic) => [topic.id, topic.title as string]));
    const moduleRows = (modules ?? []).filter((module) => topicTitle.has(module.topic_id));
    const moduleIds = moduleRows.map((module) => module.id);

    type Entry = { question: string; answer: string; verdict: TopicChoice['verdict']; consequence: string; cashAfter: number };
    type Journey = { module_id: number; state: { cash?: number; goal?: number; history?: Entry[] } | null };
    const none = { data: [] as never[] };
    const [{ data: progressRows }, { data: journeyRows }, { data: reflectionRows }, { data: conclusionRows }] = moduleIds.length
      ? await Promise.all([
          supabase.from('user_module_progress').select('module_id, progress, score').eq('user_id', uid).in('module_id', moduleIds),
          supabase.from('story_journeys').select('module_id, state').eq('user_id', uid).in('module_id', moduleIds),
          supabase.from('story_reflections').select('module_id, kind, impact_label, why, do_differently, ai_feedback, ai_insight, created_at').eq('user_id', uid).in('module_id', moduleIds).order('created_at'),
          supabase.from('story_conclusions').select('module_id, attempt, text, level, ai_feedback, ai_reinforcement, created_at').eq('user_id', uid).in('module_id', moduleIds).order('attempt'),
        ])
      : [none, none, none, none];

    const progress = (progressRows ?? []) as Array<{ module_id: number; progress: number | null; score: number | null }>;
    const journeys = (journeyRows ?? []) as Journey[];
    const reflections = (reflectionRows ?? []) as Array<{ module_id: number; kind: 'story' | 'refresh'; impact_label: string | null; why: string | null; do_differently: string | null; ai_feedback: string | null; ai_insight: string | null; created_at: string }>;
    const conclusions = (conclusionRows ?? []) as Array<{ module_id: number; attempt: number; text: string; level: StudentConclusion['level']; ai_feedback: string | null; ai_reinforcement: string | null; created_at: string }>;
    const when = (iso: string) => format(new Date(iso), 'd MMM, HH.mm', { locale: idLocale });

    const stories: StudentStory[] = [];
    for (const mod of moduleRows) {
      const prog = progress.find((item) => item.module_id === mod.id);
      const state = journeys.find((item) => item.module_id === mod.id)?.state ?? null;
      const myReflections = reflections.filter((item) => item.module_id === mod.id);
      const myConclusions = conclusions.filter((item) => item.module_id === mod.id);
      const history = state?.history ?? [];
      if (!prog && !history.length && !myReflections.length && !myConclusions.length) continue;
      const finished = (prog?.progress ?? 0) >= 1;
      stories.push({
        moduleId: String(mod.id),
        title: mod.title,
        chapter: topicTitle.get(mod.topic_id) ?? '',
        status: finished ? 'Selesai' : 'Berjalan',
        score: prog?.score ?? null,
        finalCash: finished && typeof state?.cash === 'number' ? state.cash : null,
        goal: typeof state?.goal === 'number' ? state.goal : null,
        choices: history.map((entry) => ({ question: entry.question, answer: entry.answer, verdict: entry.verdict, consequence: entry.consequence, cashAfter: entry.cashAfter })),
        reflections: myReflections.map((item): StudentReflection => ({ kind: item.kind, mostImpactful: item.impact_label, why: item.why, doDifferently: item.do_differently, aiFeedback: item.ai_feedback, aiInsight: item.ai_insight, time: when(item.created_at) })),
        conclusions: myConclusions.map((item): StudentConclusion => ({ attempt: item.attempt, text: item.text, level: item.level, aiFeedback: item.ai_feedback, aiReinforcement: item.ai_reinforcement, time: when(item.created_at) })),
      });
    }
    const scored = stories.map((story) => story.score).filter((value): value is number => value !== null);
    const name = user?.name ?? 'Siswa';
    return {
      id: studentId,
      name,
      initials: name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase(),
      score: scored.length ? Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length) : null,
      completedTopics: new Set(stories.filter((story) => story.status === 'Selesai').map((story) => story.chapter)).size,
      totalTopics: topicTitle.size,
      stories,
    };
  }

  // Arsip refleksi tingkat kelas: semua refleksi dan kesimpulan siswa, terbaru dulu (disaring dan diurutkan di halaman).
  async getReflectionArchive(classId: string): Promise<ReflectionArchiveItem[]> {
    const supabase = createClient();
    const [{ data: users }, { data: topics }, { data: modules }] = await Promise.all([
      supabase.from('users').select('id, name').eq('class_id', classId).eq('role', 'student'),
      supabase.from('module_topics').select('id, title').not('chapter', 'is', null),
      supabase.from('modules').select('id, title, topic_id'),
    ]);
    const userById = new Map((users ?? []).map((row) => [row.id as number, row.name as string]));
    const ids = [...userById.keys()];
    if (!ids.length) return [];
    const topicTitle = new Map((topics ?? []).map((row) => [row.id as number, row.title as string]));
    const moduleById = new Map((modules ?? []).map((row) => [row.id as number, row as { id: number; title: string; topic_id: number }]));
    const [{ data: reflections }, { data: conclusions }] = await Promise.all([
      supabase.from('story_reflections').select('id, user_id, module_id, kind, impact_label, why, do_differently, ai_feedback, ai_insight, created_at').in('user_id', ids).order('created_at', { ascending: false }).limit(600),
      supabase.from('story_conclusions').select('id, user_id, module_id, attempt, text, level, ai_feedback, ai_reinforcement, created_at').in('user_id', ids).order('created_at', { ascending: false }).limit(600),
    ]);
    const base = (userId: number, moduleId: number, createdAt: string) => {
      const name = userById.get(userId) ?? 'Siswa';
      const mod = moduleById.get(moduleId);
      return {
        studentId: String(userId),
        studentName: name,
        initials: name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase(),
        chapter: (mod && topicTitle.get(mod.topic_id)) ?? 'Chapter',
        moduleTitle: mod?.title ?? 'Cerita',
        createdAt,
        time: format(new Date(createdAt), 'd MMM yyyy, HH.mm', { locale: idLocale }),
      };
    };
    const items: ReflectionArchiveItem[] = [
      ...(reflections ?? []).map((row): ReflectionArchiveItem => ({
        id: `r${row.id}`,
        kind: 'refleksi',
        ...base(row.user_id, row.module_id, row.created_at),
        reflection: { kind: row.kind, mostImpactful: row.impact_label, why: row.why, doDifferently: row.do_differently, aiFeedback: row.ai_feedback, aiInsight: row.ai_insight },
      })),
      ...(conclusions ?? []).map((row): ReflectionArchiveItem => ({
        id: `k${row.id}`,
        kind: 'kesimpulan',
        ...base(row.user_id, row.module_id, row.created_at),
        conclusion: { attempt: row.attempt, text: row.text, level: row.level, aiFeedback: row.ai_feedback, aiReinforcement: row.ai_reinforcement },
      })),
    ];
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // Peringkat keputusan tersulit kelas dari riwayat story_journeys: persentase pilihan cerdas per pertanyaan, terendah dulu (minimal 3 jawaban).
  async getDecisionRank(classId: string): Promise<DecisionRankItem[]> {
    const supabase = createClient();
    const [{ data: users }, { data: topics }, { data: modules }] = await Promise.all([
      supabase.from('users').select('id').eq('class_id', classId).eq('role', 'student'),
      supabase.from('module_topics').select('id, title').not('chapter', 'is', null),
      supabase.from('modules').select('id, topic_id'),
    ]);
    const ids = (users ?? []).map((row) => row.id as number);
    if (!ids.length) return [];
    const topicTitle = new Map((topics ?? []).map((row) => [row.id as number, row.title as string]));
    const chapterOfModule = new Map<number, string>();
    for (const row of modules ?? []) {
      const title = topicTitle.get(row.topic_id as number);
      if (title) chapterOfModule.set(row.id as number, title);
    }
    const { data: journeys } = await supabase.from('story_journeys').select('module_id, state').in('user_id', ids);
    const stats = new Map<string, DecisionRankItem>();
    for (const journey of (journeys ?? []) as Array<{ module_id: number; state: { history?: Array<{ question?: string; verdict?: string }> } | null }>) {
      const chapter = chapterOfModule.get(journey.module_id);
      if (!chapter) continue;
      for (const entry of journey.state?.history ?? []) {
        if (!entry.question) continue;
        const key = `${journey.module_id}::${entry.question}`;
        const stat = stats.get(key) ?? { question: entry.question, chapter, total: 0, correct: 0, correctRate: 0 };
        stat.total += 1;
        if (entry.verdict === 'cerdas') stat.correct += 1;
        stats.set(key, stat);
      }
    }
    return [...stats.values()]
      .filter((stat) => stat.total >= MIN_ATTEMPTS)
      .map((stat) => ({ ...stat, correctRate: Math.round((stat.correct / stat.total) * 100) }))
      .sort((a, b) => a.correctRate - b.correctRate || b.total - a.total)
      .slice(0, 8);
  }

  async markCommunityPostReviewed(postId: string, note?: string, reviewed = true): Promise<void> {
    const supabase = createClient();
    const patch: { reviewed?: boolean; teacher_note?: string | null } = {};
    if (reviewed) patch.reviewed = true;
    if (note !== undefined) patch.teacher_note = note.trim() ? note.trim().slice(0, 1000) : null;
    const { error } = await supabase.from('community_posts').update(patch).eq('id', Number(postId));
    if (error) throw new Error(error.message);
  }
}

export const teacherDashboardRepository: TeacherDashboardRepository = new SupabaseTeacherDashboardRepository();
