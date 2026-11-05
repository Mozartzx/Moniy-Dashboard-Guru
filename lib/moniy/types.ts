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


export interface TeacherDashboardRepository {
  getSnapshot(query: DashboardQuery): Promise<ClassroomSnapshot>;
  getTopicReport(classId: string, topicId: string): Promise<TopicReport>;
  markCommunityPostReviewed(postId: string): Promise<void>;
}
