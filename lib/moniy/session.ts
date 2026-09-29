import { createClient } from '@/lib/supabase/client';
import type { TeacherClass, TeacherProfile } from './teacher';

export async function getCurrentTeacher(): Promise<TeacherProfile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data } = await supabase
    .from('users')
    .select('id, name, email, school_name, nickname, phone')
    .eq('email', user.email)
    .maybeSingle();

  if (!data) return null;
  return { id: data.id, name: data.name, email: data.email, schoolName: data.school_name, nickname: data.nickname, phone: data.phone };
}

export async function getMyClasses(): Promise<TeacherClass[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('classes')
    .select('id, name, school_name, academic_year')
    .order('created_at', { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    schoolName: row.school_name,
    academicYear: row.academic_year,
  }));
}

export async function updateTeacherProfile(id: number, fields: { name: string; nickname: string | null; phone: string | null; schoolName: string | null }) {
  const { error } = await createClient()
    .from('users')
    .update({ name: fields.name, nickname: fields.nickname, phone: fields.phone, school_name: fields.schoolName })
    .eq('id', id);
  if (error) throw error;
}

export async function updateClass(id: string, fields: { name: string; schoolName: string | null; academicYear: string | null }) {
  const { error } = await createClient()
    .from('classes')
    .update({ name: fields.name, school_name: fields.schoolName, academic_year: fields.academicYear })
    .eq('id', id);
  if (error) throw error;
}
