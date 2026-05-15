// Vercel Edge Function — Adzuna live jobs feed
export const config = { runtime: "edge" };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const COUNTRY_MAP: Record<string, string> = {
  india: "in", in: "in", bangalore: "in", mumbai: "in", pune: "in",
  hyderabad: "in", delhi: "in", chennai: "in", kolkata: "in",
  uk: "gb", london: "gb", gb: "gb",
  us: "us", usa: "us", "usa remote": "us", "new york": "us", "san francisco": "us",
  singapore: "sg", sg: "sg",
  remote: "in",
  all: "in",
};

function pickCountry(loc: string) {
  const k = loc.trim().toLowerCase();
  if (COUNTRY_MAP[k]) return COUNTRY_MAP[k];
  for (const key in COUNTRY_MAP) if (k.includes(key)) return COUNTRY_MAP[key];
  return "in";
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;
  if (!APP_ID || !APP_KEY) {
    return new Response(
      JSON.stringify({ error: "Live jobs service not configured", results: [] }),
      { status: 503, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
  const url = new URL(request.url);
  const what = (url.searchParams.get("what") || "").slice(0, 120).trim();
  const where = (url.searchParams.get("where") || "").slice(0, 80).trim();
  const country = pickCountry(where || "in");
  const page = Math.max(1, Math.min(20, Number(url.searchParams.get("page") || 1)));
  const remoteOnly = url.searchParams.get("remote") === "1";
  const contractType = url.searchParams.get("contract_type") || "";
  const contractTime = url.searchParams.get("contract_time") || "";
  const category = url.searchParams.get("category") || "";
  const salaryMin = url.searchParams.get("salary_min") || "";
  const resultsPerPage = Math.min(50, Math.max(1, Number(url.searchParams.get("results_per_page") || 25)));

  const adz = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`);
  adz.searchParams.set("app_id", APP_ID);
  adz.searchParams.set("app_key", APP_KEY);
  adz.searchParams.set("results_per_page", String(resultsPerPage));
  if (what) adz.searchParams.set("what", what);
  if (where && !remoteOnly && where.toLowerCase() !== "all" && where.toLowerCase() !== "remote") {
    adz.searchParams.set("where", where);
  }
  if (contractType) adz.searchParams.set("contract_type", contractType);
  if (contractTime) adz.searchParams.set("contract_time", contractTime);
  if (category) adz.searchParams.set("category", category);
  if (salaryMin) adz.searchParams.set("salary_min", salaryMin);
  adz.searchParams.set("content-type", "application/json");

  let r: Response;
  try {
    r = await fetch(adz.toString());
  } catch (e) {
    console.error("[adzuna] network", e);
    return new Response(
      JSON.stringify({ error: "Jobs service is temporarily unavailable", results: [] }),
      { status: 503, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    console.error("[adzuna] error", r.status, text.slice(0, 300));
    return new Response(
      JSON.stringify({
        error:
          r.status === 429
            ? "Jobs service is busy, please retry."
            : "Jobs service is temporarily unavailable.",
        results: [],
      }),
      { status: r.status === 429 ? 429 : 502, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
  const j = (await r.json()) as { results?: Array<Record<string, unknown>>; count?: number };
  const results = (j.results ?? []).map((it) => ({
    id: String((it as { id?: unknown }).id ?? ""),
    title: String((it as { title?: unknown }).title ?? "Job"),
    company: String(((it as { company?: { display_name?: unknown } }).company?.display_name) ?? "Company"),
    location: String(((it as { location?: { display_name?: unknown } }).location?.display_name) ?? where ?? ""),
    description: String((it as { description?: unknown }).description ?? "").slice(0, 800),
    salaryMin: (it as { salary_min?: number }).salary_min ?? null,
    salaryMax: (it as { salary_max?: number }).salary_max ?? null,
    contractTime: String((it as { contract_time?: unknown }).contract_time ?? ""),
    contractType: String((it as { contract_type?: unknown }).contract_type ?? ""),
    category: String(((it as { category?: { label?: unknown } }).category?.label) ?? ""),
    created: String((it as { created?: unknown }).created ?? ""),
    applyUrl: String((it as { redirect_url?: unknown }).redirect_url ?? ""),
  }));
  return new Response(
    JSON.stringify({ results, count: j.count ?? results.length, country }),
    { headers: { ...cors, "Content-Type": "application/json" } },
  );
}
