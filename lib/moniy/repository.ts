import { mockSnapshots } from './mock-data';
import type { ClassroomSnapshot, DashboardQuery, TeacherDashboardRepository } from './types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class MockTeacherDashboardRepository implements TeacherDashboardRepository {
  async getSnapshot(query: DashboardQuery): Promise<ClassroomSnapshot> {
    await wait(420);
    const snapshot = mockSnapshots[query.classId] ?? mockSnapshots['x-a'];
    return structuredClone(snapshot);
  }

  async markCommunityPostReviewed(postId: string): Promise<void> {
    await wait(280);
    for (const snapshot of Object.values(mockSnapshots)) {
      const post = snapshot.communityPosts.find((item) => item.id === postId);
      if (post) post.reviewed = true;
    }
  }
}

export const teacherDashboardRepository: TeacherDashboardRepository = new MockTeacherDashboardRepository();
