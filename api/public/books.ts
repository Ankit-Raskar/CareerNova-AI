// Vercel Edge Function — OpenLibrary search proxy (resilient)
export const config = { runtime: "edge" };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      ...CORS,
      ...(init.headers || {}),
    },
  });
}

async function tryFetch(url: string, timeoutMs = 8000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // Note: do NOT set User-Agent on Edge runtime (forbidden header → fetch throws).
    return await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
  } finally {
    clearTimeout(t);
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "AI").slice(0, 100).trim() || "AI";
  const fields = "key,title,author_name,first_publish_year,cover_i";
  const endpoints = [
    `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=24&fields=${fields}`,
    `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=24&fields=${fields}`,
  ];

  let lastErr = "";
  for (const ep of endpoints) {
    try {
      const r = await tryFetch(ep);
      if (!r.ok) {
        lastErr = `Upstream ${r.status}`;
        continue;
      }
      const data = (await r.json()) as { docs?: unknown[] };
      const docs = Array.isArray(data.docs) ? data.docs : [];
      if (docs.length > 0) return json({ docs });
      lastErr = "No results";
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "fetch failed";
    }
  }

  return json({ docs: [], error: lastErr || "No results" });
}
