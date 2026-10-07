import { createClient } from '@/lib/supabase/client';

// Quest dibuat lewat backend Moniy (NestJS), bukan langsung ke Supabase: backend yang
// memegang kunci AI, aturan keseimbangan, dan pengecekan guru terverifikasi.
const API_BASE = (process.env.NEXT_PUBLIC_MONIY_API_URL ?? 'https://moniy-api.vercel.app').replace(/\/$/, '');

export type Verdict = 'cerdas' | 'biasa' | 'buruk';

export type Choice = { label: string; verdict: Verdict; consequence: string; cash: number; income: number; cost: number; days: number };
export type Step = { rowId: number; type: 'condition' | 'random_event'; step: number; story: string; question: string; hint: string | null; choices: Choice[] };
export type Balance = { ok: boolean; best: number; worst: number; goal: number | null; startCash: number; warnings: string[] };
export type Background = { rowId: number; role: string; story: string; cash: number; income: number; cost: number; goal: number };

export type Quest = {
  id: number; title: string; topic: string | null; status: 'draft' | 'published'; refreshEnabled: boolean; createdAt: string;
  background: Background; conditions: Step[]; events: Step[]; balance: Balance;
};
export type QuestSummary = { id: number; title: string; topic: string | null; status: 'draft' | 'published'; refreshEnabled: boolean; createdAt: string; classIds: string[] };
export type PolishFields = { story: string; question: string; hint: string | null; choices: { label: string; consequence: string }[] };
export type Proposal = { rowId: number; type: Step['type']; step: number; changed: boolean; before: PolishFields; after: PolishFields; kept: string[] };
export type RefreshOverview = {
  enabled: boolean;
  students: { userId: number; name: string; classId: string; started: boolean; refreshDays: number; lastRefreshDate: string | null; cash: number | null; day: number | null; phase: string | null }[];
};

export class QuestApiError extends Error {
  constructor(message: string, readonly status: number, readonly warnings: string[] = []) {
    super(message);
  }
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { data: { session } } = await createClient().auth.getSession();
  if (!session) throw new QuestApiError('Sesi berakhir. Masuk lagi.', 401);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { Authorization: `Bearer ${session.access_token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new QuestApiError('Koneksi terputus. Coba lagi.', 0);
  }
  const json = (await res.json().catch(() => ({}))) as { message?: string | string[]; warnings?: string[] };
  if (!res.ok) {
    const message = Array.isArray(json.message) ? json.message.join(' ') : json.message;
    throw new QuestApiError(message ?? 'Terjadi kesalahan. Coba lagi.', res.status, json.warnings ?? []);
  }
  return json as T;
}

export const questApi = {
  topics: async () => {
    const { data } = await createClient().from('module_topics').select('id, title').order('id');
    return (data ?? []) as { id: number; title: string }[];
  },
  mine: () => call<QuestSummary[]>('GET', '/quest/mine'),
  get: (id: number) => call<Quest>('GET', `/quest/${id}`),
  createDraft: (topicId: number, prompt: string) => call<Quest>('POST', '/quest/drafts', { topicId, prompt }),
  saveBackground: (id: number, patch: Partial<Pick<Background, 'role' | 'story' | 'cash' | 'income' | 'cost'>>) =>
    call<unknown>('PATCH', `/quest/${id}/background`, patch),
  saveScenario: (id: number, rowId: number, patch: { story?: string; question?: string; hint?: string | null; choices?: Partial<Choice>[] }) =>
    call<{ scenario: Step; goal: number; balance: Balance }>('PATCH', `/quest/${id}/scenarios/${rowId}`, patch),
  polish: (id: number, rowIds?: number[]) => call<{ proposals: Proposal[] }>('POST', `/quest/${id}/polish`, { rowIds }),
  publish: (id: number, classIds: string[], refreshEnabled: boolean) =>
    call<{ published: boolean }>('POST', `/quest/${id}/publish`, { classIds, refreshEnabled }),
  assign: (id: number, classIds: string[]) => call<unknown>('POST', `/quest/${id}/assign`, { classIds }),
  setRefresh: (id: number, enabled: boolean) => call<{ refreshEnabled: boolean }>('PATCH', `/quest/${id}/refresh`, { enabled }),
  refreshOverview: (id: number) => call<RefreshOverview>('GET', `/quest/${id}/refresh`),
  remove: (id: number) => call<unknown>('DELETE', `/quest/${id}`),
};
