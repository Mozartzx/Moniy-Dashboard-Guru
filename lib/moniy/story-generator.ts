// Server-only: module generation with Gemini, mirroring the student app's story generator
// (Aplikasi_Moniy/backend/src/story/story.generator.ts) so modules behave the same in both.

export type Verdict = 'cerdas' | 'biasa' | 'buruk';

export type StoryChoice = {
  label: string;
  verdict: Verdict;
  consequence: string;
  cash: number;
  income: number;
  cost: number;
  days: number;
};

type GeneratedStep = { story: string; question: string; hint?: string; choices: StoryChoice[] };

type GeneratedModule = {
  allowed: boolean;
  reason?: string;
  title: string;
  role: string;
  background: string;
  cash: number;
  income: number;
  cost: number;
  conditions: GeneratedStep[];
  events: GeneratedStep[];
};

export type ModuleRow = {
  result_title: string;
  story_text: string;
  decision_text: string;
  options: Record<string, unknown>;
  correct_option: number | null;
  warning_text: string | null;
};

export type GeneratedDraft = {
  title: string;
  role: string;
  goal: number;
  cash: number;
  conditions: number;
  events: number;
  rows: ModuleRow[];
};

export class GenerationError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

const MANDATORY_CONDITIONS = 7;
const MANDATORY_EVENTS = 2;

const CHOICE = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    verdict: { type: 'string', enum: ['cerdas', 'biasa', 'buruk'] },
    consequence: { type: 'string' },
    cash: { type: 'integer' },
    income: { type: 'integer' },
    cost: { type: 'integer' },
    days: { type: 'integer' },
  },
  required: ['label', 'verdict', 'consequence', 'cash', 'income', 'cost', 'days'],
};

const STEP = {
  type: 'object',
  properties: {
    story: { type: 'string' },
    question: { type: 'string' },
    hint: { type: 'string' },
    choices: { type: 'array', items: CHOICE },
  },
  required: ['story', 'question', 'choices'],
};

const SCHEMA = {
  type: 'object',
  properties: {
    allowed: { type: 'boolean' },
    reason: { type: 'string' },
    title: { type: 'string' },
    role: { type: 'string' },
    background: { type: 'string' },
    cash: { type: 'integer' },
    income: { type: 'integer' },
    cost: { type: 'integer' },
    conditions: { type: 'array', items: STEP },
    events: { type: 'array', items: STEP },
  },
  required: ['allowed', 'title', 'role', 'background', 'cash', 'income', 'cost', 'conditions', 'events'],
};

const SYSTEM = `Kamu penulis skenario game edukasi literasi keuangan untuk siswa SMA Indonesia.
Tulis dalam Bahasa Indonesia yang santai, konkret, dan realistis untuk remaja.
Aturan:
- Tolak (allowed=false) permintaan yang tidak pantas untuk remaja, tidak berkaitan dengan keuangan,
  atau yang meminta cerita mempromosikan judi, pinjol ilegal, atau penipuan.
- Tepat ${MANDATORY_CONDITIONS} kondisi dan ${MANDATORY_EVENTS} kejadian acak. Tiap langkah punya tepat 3 pilihan: satu "cerdas", satu "biasa", satu "buruk", urutan pilihan diacak.
- Angka dalam Rupiah bulat. cash = perubahan kas sekali jalan, income/cost = perubahan pendapatan/biaya PER HARI, days = 2-21 hari.
- Pilihan cerdas harus benar-benar lebih menguntungkan jangka panjang daripada pilihan buruk.
- Setidaknya satu kejadian acak menyinggung jebakan judi online, pinjol ilegal, atau penipuan investasi.
- Konsekuensi 1-2 kalimat, tanpa menyebut angka yang berbeda dari data.`;

async function callGemini<T>(prompt: string): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GenerationError('Layanan AI belum dikonfigurasi', 503);
  const model = process.env.GEMINI_CHAT_MODEL || 'gemini-flash-latest';

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM }] },
      generationConfig: { temperature: 0.8, responseMimeType: 'application/json', responseSchema: SCHEMA },
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) {
    throw new GenerationError(
      res.status === 429 ? 'Kuota AI sedang penuh. Coba lagi sebentar lagi.' : 'Layanan AI sedang bermasalah. Coba lagi.',
      502,
    );
  }
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}') as T;
}

/** Same money model as the app: cash += one-off + days * (income - cost), income/cost never below 0. */
function simulatePath(start: { cash: number; income: number; cost: number }, steps: GeneratedStep[], verdict: Verdict) {
  let { cash, income, cost } = start;
  for (const step of steps) {
    const choice = step.choices.find((c) => c.verdict === verdict) ?? step.choices[0];
    income = Math.max(0, income + choice.income);
    cost = Math.max(0, cost + choice.cost);
    cash += choice.cash + choice.days * income - choice.days * cost;
  }
  return cash;
}

/** Goal where the smart path clears it and the bad path does not; null if the numbers cannot allow that. */
function balancedGoal(best: number, worst: number): number | null {
  if (best <= worst || best <= 0) return null;
  const goal = Math.floor((best - (best - worst) * 0.3) / 50_000) * 50_000;
  return goal > worst && goal <= best ? goal : null;
}

function validate(g: GeneratedModule): string | null {
  if (g.conditions?.length !== MANDATORY_CONDITIONS) return `jumlah kondisi harus ${MANDATORY_CONDITIONS}`;
  if (g.events?.length !== MANDATORY_EVENTS) return `jumlah kejadian acak harus ${MANDATORY_EVENTS}`;
  if (!(g.cash > 0) || g.income < 0 || g.cost < 0) return 'angka awal tidak masuk akal';
  for (const step of [...g.conditions, ...g.events]) {
    const verdicts = (step.choices ?? []).map((c) => c.verdict).sort();
    if (verdicts.join() !== 'biasa,buruk,cerdas') return 'tiap langkah wajib punya satu pilihan cerdas, biasa, dan buruk';
    for (const c of step.choices) {
      c.days = Math.min(30, Math.max(1, Math.round(c.days)));
      c.cash = Math.round(c.cash);
      c.income = Math.round(c.income);
      c.cost = Math.round(c.cost);
    }
  }
  return null;
}

const correctIndex = (choices: StoryChoice[]) => choices.findIndex((c) => c.verdict === 'cerdas');

export async function generateModule(topicTitle: string, prompt: string): Promise<GeneratedDraft> {
  let lastProblem = '';
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const gen = await callGemini<GeneratedModule>(
      `Topik: ${topicTitle}\nKeinginan guru: """${prompt.slice(0, 300)}"""\n` +
        (lastProblem ? `\nPercobaan sebelumnya ditolak karena: ${lastProblem}. Perbaiki.\n` : '') +
        '\nSusun satu modul cerita sesuai aturan.',
    );
    if (!gen.allowed) throw new GenerationError(gen.reason || 'Permintaan cerita tidak bisa dibuat');
    const problem = validate(gen);
    if (problem) {
      lastProblem = problem;
      continue;
    }

    const start = { cash: gen.cash, income: gen.income, cost: gen.cost };
    const goal = balancedGoal(simulatePath(start, gen.conditions, 'cerdas'), simulatePath(start, gen.conditions, 'buruk'));
    if (goal === null) {
      lastProblem = 'jalur cerdas tidak lebih menguntungkan daripada jalur buruk';
      continue;
    }

    const background = `${gen.background} Target kamu: kas mencapai Rp${goal.toLocaleString('id-ID')}.`;
    const rows: ModuleRow[] = [
      {
        result_title: 'Latar Cerita',
        story_text: background,
        decision_text: 'Siap memulai cerita?',
        options: {
          type: 'background',
          step: 0,
          slug: topicTitle.toLowerCase(),
          start: { role: gen.role, background, ...start, goal },
        },
        correct_option: null,
        warning_text: gen.role,
      },
      ...gen.conditions.map((c, i) => ({
        result_title: `Kondisi ${i + 1}`,
        story_text: c.story,
        decision_text: c.question,
        options: { type: 'condition', step: i + 1, hint: c.hint ?? null, choices: c.choices },
        correct_option: correctIndex(c.choices),
        warning_text: c.hint ?? null,
      })),
      ...gen.events.map((e, i) => ({
        result_title: `Random Event ${i + 1}`,
        story_text: e.story,
        decision_text: e.question,
        options: { type: 'random_event', step: i + 1, choices: e.choices },
        correct_option: correctIndex(e.choices),
        warning_text: null,
      })),
    ];
    return {
      title: gen.title,
      role: gen.role,
      goal,
      cash: gen.cash,
      conditions: gen.conditions.length,
      events: gen.events.length,
      rows,
    };
  }
  throw new GenerationError('AI belum berhasil menyusun cerita yang seimbang. Coba ubah prompt-nya.');
}
