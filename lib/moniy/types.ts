export type LearningStatus = 'Belum' | 'Berjalan' | 'Selesai';

export type TopicProgress = {
  id: string;
  name: string;
  category: string;
  notStarted: number;
  inProgress: number;
  completed: number;
  quizAverage: number;
  correctRate: number;
  commonMistake: string;
  mistakeRate: number;
};

export type LearningDecision = {
  id: string;
  title: string;
  chapter: string;
  note: string;
  outcome: 'tepat' | 'perlu-refleksi';
  time: string;
};

export type Student = {
  id: string;
  name: string;
  initials: string;
  activeModule: string;
  status: LearningStatus;
  score: number | null;
  completedTopics: number;
  totalTopics: number;
  needsSupport: boolean;
  decisions: LearningDecision[];
};

export type TopicChoice = {
  question: string;
  answer: string;
  verdict: 'cerdas' | 'biasa' | 'buruk';
  consequence: string;
  cashAfter: number;
};

export type TopicStudentReport = {
  id: string;
  name: string;
  initials: string;
  status: LearningStatus;
  score: number | null;
  finalCash: number | null;
  goal: number | null;
  /** null selama siswa belum menamatkan simulasi */
  reachedGoal: boolean | null;
  choices: TopicChoice[];
};

export type TopicReport = {
  topicId: string;
  topicName: string;
  studentCount: number;
  finishedCount: number;
  averageScore: number | null;
  reachedGoalCount: number;
  missedGoalCount: number;
  students: TopicStudentReport[];
};

export type StudentReflection = {
  kind: 'story' | 'refresh';
  mostImpactful: string | null;
  why: string | null;
  doDifferently: string | null;
  aiFeedback: string | null;
  aiInsight: string | null;
  time: string;
};

export type StudentConclusion = {
  attempt: number;
  text: string;
  level: 'tepat' | 'hampir' | 'perlu_penguatan' | null;
  aiFeedback: string | null;
  aiReinforcement: string | null;
  time: string;
};

export type StudentStory = {
  moduleId: string;
  title: string;
  chapter: string;
  status: LearningStatus;
  score: number | null;
  finalCash: number | null;
  goal: number | null;
  choices: TopicChoice[];
  reflections: StudentReflection[];
  conclusions: StudentConclusion[];
};

export type StudentReport = {
  id: string;
  name: string;
  initials: string;
  score: number | null;
  completedTopics: number;
  totalTopics: number;
  stories: StudentStory[];
};

export type ReflectionArchiveItem = {
  id: string;
  kind: 'refleksi' | 'kesimpulan';
  studentId: string;
  studentName: string;
  initials: string;
  chapter: string;
  moduleTitle: string;
  createdAt: string;
  time: string;
  reflection?: Pick<StudentReflection, 'kind' | 'mostImpactful' | 'why' | 'doDifferently' | 'aiFeedback' | 'aiInsight'>;
  conclusion?: Pick<StudentConclusion, 'attempt' | 'text' | 'level' | 'aiFeedback' | 'aiReinforcement'>;
};

export type DecisionRankItem = {
  question: string;
  chapter: string;
  total: number;
  correct: number;
  correctRate: number;
};

export type LearningInsight = {
  available: boolean;
  message?: string;
  generatedAt?: string;
  cached?: boolean;
  basis?: { students: number; reflections: number; conclusions: number; decisions: number };
  summary?: string;
  findings?: { title: string; detail: string }[];
  actions?: { title: string; detail: string }[];
};

export type RiskTrend = {
  label: string;
  events: number;
};

export type CommunityPost = {
  id: string;
  studentName: string;
  initials: string;
  title: string;
  businessType: string;
  epilogue: string;
  summary: string;
  submittedAt: string;
  reviewed: boolean;
  teacherNote: string;
};

export type ClassroomSnapshot = {
  classId: string;
  className: string;
  studentCount: number;
  averageScore: number;
  completionRate: number;
  supportCount: number;
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi';
  riskDelta: number;
  riskEventCount: number;
  topics: TopicProgress[];
  students: Student[];
  riskTrend: RiskTrend[];
  communityPosts: CommunityPost[];
  insight: string;
  recommendation: string;
};

export type DashboardQuery = {
  classId: string;
  period: string;
};


export interface TeacherDashboardRepository {
  getSnapshot(query: DashboardQuery): Promise<ClassroomSnapshot>;
  getTopicReport(classId: string, topicId: string): Promise<TopicReport>;
  getStudentReport(classId: string, studentId: string): Promise<StudentReport>;
  getReflectionArchive(classId: string): Promise<ReflectionArchiveItem[]>;
  getDecisionRank(classId: string): Promise<DecisionRankItem[]>;
  markCommunityPostReviewed(postId: string, note?: string, reviewed?: boolean): Promise<void>;
}
