import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GenerationError, generateModule } from '@/lib/moniy/story-generator';

// One generation is a large Gemini request and the free quota is small: 3 per minute per teacher.
const recent = new Map<string, number[]>();

function rateLimited(userId: string) {
  const now = Date.now();
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < 60_000);
  if (hits.length >= 3) return true;
  recent.set(userId, [...hits, now]);
  return false;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Belum masuk' }, { status: 401 });

  const { data: teacher } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (teacher?.role !== 'teacher') return NextResponse.json({ error: 'Hanya guru yang bisa membuat modul' }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { topicId?: unknown; prompt?: unknown } | null;
  const topicId = Number(body?.topicId);
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!Number.isInteger(topicId) || prompt.length < 10 || prompt.length > 300) {
    return NextResponse.json({ error: 'Pilih topik dan tulis ide cerita 10 sampai 300 karakter' }, { status: 400 });
  }
  if (rateLimited(user.id)) return NextResponse.json({ error: 'Terlalu sering. Tunggu satu menit.' }, { status: 429 });

  const { data: topic } = await supabase.from('module_topics').select('id, title').eq('id', topicId).maybeSingle();
  if (!topic) return NextResponse.json({ error: 'Topik tidak ditemukan' }, { status: 404 });

  try {
    const draft = await generateModule(topic.title, prompt);
    const { data: moduleId, error } = await supabase.rpc('create_ai_module', {
      p_topic_id: topic.id,
      p_title: draft.title,
      p_rows: draft.rows,
    });
    if (error) throw new GenerationError('Gagal menyimpan modul. Coba lagi.', 500);
    return NextResponse.json(
      { moduleId, title: draft.title, role: draft.role, goal: draft.goal, cash: draft.cash, conditions: draft.conditions, events: draft.events, topic: topic.title },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof GenerationError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: 'Terjadi kesalahan. Coba lagi.' }, { status: 500 });
  }
}
