// Vercel Edge Function — Resume Analyzer (Groq, Llama 3.3 70B)
export const config = { runtime: "edge" };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY = "llama-3.3-70b-versatile";
const FALLBACK = "llama-3.1-8b-instant";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `You are an elite ATS expert and senior tech recruiter for top startups.
Analyze the resume and return ONLY a JSON object matching this exact shape, no prose, no markdown:
{
  "score": number 0-100,
  "summary": string (2-3 sentences),
  "strengths": string[] (4-6 specific items),
  "weaknesses": string[] (4-6 specific items),
  "missingKeywords": string[] (8-12 ATS keywords),
  "formatting": string[] (3-5 structure tips),
  "careerMatches": [{"title": string, "fit": number 0-100, "why": string}] (top 5),
  "interviewReadiness": number 0-100,
  "skillGaps": string[] (4-6 concrete skill gaps),
  "projectIdeas": string[] (3-5 portfolio projects to close gaps),
  "roadmap": string[] (5-7 prioritized action steps for the next 90 days),
  "nextSteps": string[] (4-6 immediate improvements)
}
Be specific to the resume content, never generic. Use Indian + global hiring context.`;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callModel(model: string, text: string, key: string) {
  return fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `RESUME TEXT:\n\n${text}` },
      ],
    }),
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) {
    console.error("[resume] GROQ_API_KEY missing");
    return jsonResponse({ error: "AI service not configured" }, 500);
  }

  let body: { text: string };
  try {
    body = (await request.json()) as { text: string };
  } catch {
    return jsonResponse({ error: "Invalid request" }, 400);
  }
  const text = (body.text || "").slice(0, 24000).trim();
  if (text.length < 80) {
    return jsonResponse({ error: "Resume text is too short to analyze" }, 400);
  }

  let r: Response;
  try {
    r = await callModel(PRIMARY, text, KEY);
    if (!r.ok && r.status >= 500) r = await callModel(FALLBACK, text, KEY);
  } catch (e) {
    console.error("[resume] network", e);
    return jsonResponse({ error: "Resume analysis service is temporarily unavailable." }, 502);
  }

  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    console.error("[resume] groq error", r.status, errText.slice(0, 400));
    const msg =
      r.status === 429
        ? "AI is busy right now. Please retry in a moment."
        : r.status === 401
          ? "AI service not configured"
          : "Resume analysis service is temporarily unavailable.";
    return jsonResponse({ error: msg }, r.status === 429 ? 429 : 502);
  }

  const j = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const out = j.choices?.[0]?.message?.content ?? "";
  try {
    return jsonResponse({ data: extractJson(out) });
  } catch {
    return jsonResponse({ error: "Could not parse AI output. Please try again." }, 502);
  }
}
