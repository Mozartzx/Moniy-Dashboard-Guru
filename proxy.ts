import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { resolveTeacherStage, type TeacherStage } from '@/lib/moniy/teacher';

const STAGE_PATH: Record<Exclude<TeacherStage, 'role-conflict'>, string> = {
  'onboarding-sekolah': '/onboarding/sekolah',
  'onboarding-kelas': '/onboarding/kelas',
  dashboard: '/dashboard/ringkasan',
};

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) response.cookies.set(name, value);
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!user) {
    if (path.startsWith('/dashboard') || path.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  const { data: row } = await supabase
    .from('users')
    .select('role, school_name')
    .eq('email', user.email!)
    .maybeSingle();

  const { count } = await supabase.from('classes').select('id', { count: 'exact', head: true });
  const stage = resolveTeacherStage(row, count ?? 0);

  if (stage === 'role-conflict') {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=role-conflict', request.url));
  }

  const target = STAGE_PATH[stage];

  if (stage === 'dashboard') {
    // Fully onboarded: any /dashboard/* page is allowed, but auth/onboarding pages are not.
    if (path === '/login' || path === '/register' || path.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL(target, request.url));
    }
  } else if (path !== target) {
    // Still onboarding: only this stage's own page is allowed.
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/login', '/register'],
};
