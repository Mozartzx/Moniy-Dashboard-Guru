// Proxy khusus pengembangan lokal: API Moniy hanya mengizinkan asal moniy.site (CORS), jadi di localhost
// panggilan lewat rute ini. Di produksi rute ini mati (404).
const TARGET = (process.env.MONIY_API_PROXY_TARGET ?? 'https://app.moniy.site/api').replace(/\/$/, '');

async function proxy(req: Request, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  if (process.env.NODE_ENV === 'production') return new Response('Not found', { status: 404 });
  const { path } = await ctx.params;
  const upstream = `${TARGET}/${path.join('/')}${new URL(req.url).search}`;
  const headers = new Headers();
  for (const name of ['authorization', 'content-type']) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const res = await fetch(upstream, { method: req.method, headers, body: hasBody ? await req.text() : undefined });
  return new Response(res.body, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') ?? 'application/json',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  });
}

export { proxy as DELETE, proxy as GET, proxy as PATCH, proxy as POST };
