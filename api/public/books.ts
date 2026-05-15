// Vercel Edge Function — OpenLibrary search proxy
export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "AI").slice(0, 100);
  try {
    const upstream = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=24&fields=key,title,author_name,first_publish_year,cover_i`,
      { headers: { "User-Agent": "CareerNova.AI Learning Hub" } },
    );
    if (!upstream.ok) {
      return new Response(JSON.stringify({ docs: [], error: `Upstream ${upstream.status}` }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const json = (await upstream.json()) as { docs?: unknown[] };
    return new Response(JSON.stringify({ docs: json.docs || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ docs: [], error: e instanceof Error ? e.message : "fetch failed" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
}
