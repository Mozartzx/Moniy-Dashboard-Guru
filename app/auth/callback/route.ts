import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveTeacherStage } from '@/lib/moniy/teacher';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect(`${origin}/login?error=oauth`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?error=oauth`);

  const email = data.user.email!;
  const { data: existing } = await supabase
    .from('users')
    .select('role, school_name')
    .eq('email', email)
    .maybeSingle();

  if (existing && existing.role !== 'teacher') {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=role-conflict`);
  }

  let row: { role: string; school_name: string | null } | null = existing;

  if (!row) {
    const metadata = data.user.user_metadata as { full_name?: string; school_name?: string } | null;
    const name = metadata?.full_name ?? email;
    const { data: created } = await supabase
      .from('users')
      .insert({ name, email, role: 'teacher', school_name: metadata?.school_name ?? null })
      .select('role, school_name')
      .single();
    row = created ?? null;
  }

  const { count } = await supabase
    .from('classes')
    .select('id', { count: 'exact', head: true });

  const stage = resolveTeacherStage(row, count ?? 0);
  const destination = stage === 'dashboard' ? '/dashboard/ringkasan' : `/${stage.replace('-', '/')}`;
  return NextResponse.redirect(`${origin}${destination}`);
}
