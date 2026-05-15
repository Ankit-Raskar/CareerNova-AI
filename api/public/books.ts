// Vercel Edge Function — OpenLibrary search proxy (resilient)
export const config = { runtime: "edge" };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type BookDoc = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
};

const FALLBACK_BOOKS: Record<string, BookDoc[]> = {
  ai: [
    { key: "/works/OL1782473W", title: "Artificial Intelligence: A Modern Approach", author_name: ["Stuart Russell", "Peter Norvig"], first_publish_year: 1995, cover_i: 10521270 },
    { key: "/works/OL2005145W", title: "The Quest for Artificial Intelligence", author_name: ["Nils J. Nilsson"], first_publish_year: 2009 },
    { key: "/works/OL14911297W", title: "Machine Learning", author_name: ["Tom M. Mitchell"], first_publish_year: 1997, cover_i: 8231856 },
    { key: "/works/OL262311W", title: "Pattern Recognition and Machine Learning", author_name: ["Christopher M. Bishop"], first_publish_year: 2006, cover_i: 1335830 },
  ],
  "machine learning": [
    { key: "/works/OL14911297W", title: "Machine Learning", author_name: ["Tom M. Mitchell"], first_publish_year: 1997, cover_i: 8231856 },
    { key: "/works/OL262311W", title: "Pattern Recognition and Machine Learning", author_name: ["Christopher M. Bishop"], first_publish_year: 2006, cover_i: 1335830 },
    { key: "/works/OL19745994W", title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow", author_name: ["Aurélien Géron"], first_publish_year: 2017, cover_i: 10154267 },
    { key: "/works/OL2005145W", title: "The Quest for Artificial Intelligence", author_name: ["Nils J. Nilsson"], first_publish_year: 2009 },
  ],
  python: [
    { key: "/works/OL15190492W", title: "Automate the Boring Stuff with Python", author_name: ["Al Sweigart"], first_publish_year: 2015, cover_i: 8371067 },
    { key: "/works/OL15662195W", title: "Think Python", author_name: ["Allen B. Downey"], first_publish_year: 2012, cover_i: 7363360 },
    { key: "/works/OL262026W", title: "Learning Python", author_name: ["Mark Lutz"], first_publish_year: 1999, cover_i: 388182 },
    { key: "/works/OL16290436W", title: "Fluent Python", author_name: ["Luciano Ramalho"], first_publish_year: 2015, cover_i: 8231912 },
  ],
  "web development": [
    { key: "/works/OL15131615W", title: "Eloquent JavaScript", author_name: ["Marijn Haverbeke"], first_publish_year: 2011, cover_i: 8288782 },
    { key: "/works/OL15191081W", title: "HTML and CSS", author_name: ["Jon Duckett"], first_publish_year: 2011, cover_i: 6977223 },
    { key: "/works/OL16248515W", title: "JavaScript and JQuery", author_name: ["Jon Duckett"], first_publish_year: 2014, cover_i: 7869790 },
    { key: "/works/OL17809009W", title: "You Don't Know JS", author_name: ["Kyle Simpson"], first_publish_year: 2014 },
  ],
  "ui ux": [
    { key: "/works/OL262283W", title: "The Design of Everyday Things", author_name: ["Donald A. Norman"], first_publish_year: 1988, cover_i: 8231993 },
    { key: "/works/OL15804398W", title: "Don't Make Me Think", author_name: ["Steve Krug"], first_publish_year: 2000, cover_i: 8560386 },
    { key: "/works/OL16955999W", title: "About Face", author_name: ["Alan Cooper"], first_publish_year: 1995, cover_i: 8092267 },
    { key: "/works/OL14927755W", title: "A Project Guide to UX Design", author_name: ["Russ Unger", "Carolyn Chandler"], first_publish_year: 2009 },
  ],
  dsa: [
    { key: "/works/OL162846W", title: "Introduction to Algorithms", author_name: ["Thomas H. Cormen", "Charles E. Leiserson", "Ronald L. Rivest", "Clifford Stein"], first_publish_year: 1990, cover_i: 240726 },
    { key: "/works/OL1815392W", title: "Algorithms", author_name: ["Robert Sedgewick", "Kevin Wayne"], first_publish_year: 1983, cover_i: 7274325 },
    { key: "/works/OL14929142W", title: "Data Structures and Algorithms in Java", author_name: ["Robert Lafore"], first_publish_year: 1998, cover_i: 389166 },
    { key: "/works/OL15587536W", title: "Grokking Algorithms", author_name: ["Aditya Y. Bhargava"], first_publish_year: 2016, cover_i: 8406786 },
  ],
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

function expandQuery(q: string) {
  const key = q.toLowerCase();
  if (key === "ai") return "artificial intelligence";
  if (key === "ui ux") return "user experience design";
  if (key === "dsa") return "data structures algorithms";
  return q;
}

function fallbackFor(q: string): BookDoc[] {
  const key = q.toLowerCase();
  if (FALLBACK_BOOKS[key]) return FALLBACK_BOOKS[key];
  if (key.includes("machine")) return FALLBACK_BOOKS["machine learning"];
  if (key.includes("python")) return FALLBACK_BOOKS.python;
  if (key.includes("web")) return FALLBACK_BOOKS["web development"];
  if (key.includes("design") || key.includes("ux") || key.includes("ui")) return FALLBACK_BOOKS["ui ux"];
  if (key.includes("algorithm") || key.includes("data structure")) return FALLBACK_BOOKS.dsa;
  if (key.includes("artificial") || key.includes("intelligence")) return FALLBACK_BOOKS.ai;
  return FALLBACK_BOOKS.ai;
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
  const rawQ = (url.searchParams.get("q") || "AI").slice(0, 100).trim() || "AI";
  const q = expandQuery(rawQ);
  const fields = "key,title,author_name,first_publish_year,cover_i";
  const endpoints = [
    `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=24&fields=${fields}`,
    `https://openlibrary.org/search.json?title=${encodeURIComponent(rawQ)}&limit=24&fields=${fields}`,
    `https://openlibrary.org/search.json?subject=${encodeURIComponent(q)}&limit=24&fields=${fields}`,
  ];

  let lastErr = "";
  for (const ep of endpoints) {
    try {
      const r = await tryFetch(ep);
      if (!r.ok) {
        lastErr = `Upstream ${r.status}`;
        continue;
      }
      const data = (await r.json()) as { docs?: BookDoc[] };
      const docs = Array.isArray(data.docs) ? data.docs.filter((doc) => doc?.key && doc?.title) : [];
      if (docs.length > 0) return json({ docs });
      lastErr = "No results";
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "fetch failed";
    }
  }

  console.warn(`OpenLibrary fallback used for "${rawQ}": ${lastErr || "No results"}`);
  return json({ docs: fallbackFor(rawQ) });
}
