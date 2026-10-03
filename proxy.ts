import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { CLASS_LIST_PATH, resolveTeacherStage } from '@/lib/moniy/teacher';

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
    if (path.startsWith('/dashboard') || path.startsWith('/onboarding') || path === CLASS_LIST_PATH) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  const { data: row } = await supabase
    .from('users')
    .select('role, school_name')
    .eq('email', user.email!)
    .maybeSingle();

  const stage = resolveTeacherStage(row);

  if (stage === 'role-conflict') {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=role-conflict', request.url));
  }

  if (stage === 'onboarding-sekolah') {
    // Profile incomplete: only the school step is reachable.
    return path === '/onboarding/sekolah' ? response : NextResponse.redirect(new URL('/onboarding/sekolah', request.url));
  }

  // Ready: the class list is home. Auth and onboarding pages send the teacher back to it.
  if (path === '/login' || path === '/register' || path.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL(CLASS_LIST_PATH, request.url));
  }

  // A dashboard always belongs to a class; with none yet, go create one from the list.
  if (path.startsWith('/dashboard')) {
    const { count } = await supabase.from('classes').select('id', { count: 'exact', head: true });
    if (!count) return NextResponse.redirect(new URL(CLASS_LIST_PATH, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/kelas', '/login', '/register'],
};
