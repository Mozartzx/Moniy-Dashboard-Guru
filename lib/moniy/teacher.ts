export type TeacherProfile = {
  id: number;
  name: string;
  email: string;
  schoolName: string | null;
  nickname: string | null;
  phone: string | null;
};

export type TeacherClass = {
  id: string;
  name: string;
  schoolName: string | null;
  academicYear: string | null;
};

export type TeacherStage = 'role-conflict' | 'onboarding-sekolah' | 'onboarding-kelas' | 'dashboard';

/**
 * Where an authenticated account should land next. `row` is the raw public.users row for this
 * email, if any — a non-teacher role (e.g. a mobile-app student account signing into the
 * dashboard with the same Google account) is rejected outright, never silently reused or upgraded.
 */
export function resolveTeacherStage(
  row: { role: string; school_name: string | null } | null,
  classCount: number,
): TeacherStage {
  if (row && row.role !== 'teacher') return 'role-conflict';
  if (!row || !row.school_name) return 'onboarding-sekolah';
  if (classCount === 0) return 'onboarding-kelas';
  return 'dashboard';
}
