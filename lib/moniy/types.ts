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

export type DataMode = 'normal' | 'loading' | 'empty' | 'error';

export interface TeacherDashboardRepository {
  getSnapshot(query: DashboardQuery): Promise<ClassroomSnapshot>;
  markCommunityPostReviewed(postId: string): Promise<void>;
}
