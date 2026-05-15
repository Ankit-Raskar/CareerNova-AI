// Vercel Edge Function — Unified AI proxy (Groq)
export const config = { runtime: "edge" };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY = "llama-3.3-70b-versatile";
const FALLBACK = "llama-3.1-8b-instant";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Msg = { role: "system" | "user" | "assistant"; content: string };
type Body = {
  mode?: "chat" | "json";
  messages: Msg[];
  schema?: Record<string, unknown>;
  schema_name?: string;
  model?: string;
  temperature?: number;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function callGroq(model: string, payload: Record<string, unknown>, key: string) {
  return fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, model }),
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) {
    console.error("[ai] GROQ_API_KEY missing");
    return jsonResponse({ error: "AI service not configured" }, 500);
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return jsonResponse({ error: "Invalid request" }, 400);
  }
  const { mode = "chat", messages, schema, model, temperature = 0.7 } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ error: "messages required" }, 400);
  }

  let finalMessages = messages;
  const payload: Record<string, unknown> = { messages: finalMessages, temperature };

  if (mode === "json") {
    const schemaText = schema
      ? `\n\nReturn ONLY a single valid JSON object that matches this JSON Schema:\n${JSON.stringify(schema)}`
      : "\n\nReturn ONLY a single valid JSON object. No prose, no markdown.";
    const sysIdx = messages.findIndex((m) => m.role === "system");
    if (sysIdx >= 0) {
      finalMessages = messages.map((m, i) =>
        i === sysIdx ? { ...m, content: m.content + schemaText } : m,
      );
    } else {
      finalMessages = [
        { role: "system", content: "You are a precise JSON generator." + schemaText },
        ...messages,
      ];
    }
    payload.messages = finalMessages;
    payload.response_format = { type: "json_object" };
  }

  const primary = model || PRIMARY;
  let upstream: Response;
  try {
    upstream = await callGroq(primary, payload, KEY);
    if (!upstream.ok && upstream.status >= 500 && primary !== FALLBACK) {
      upstream = await callGroq(FALLBACK, payload, KEY);
    }
  } catch (e) {
    console.error("[ai] network error", e);
    return jsonResponse({ error: "AI service is temporarily unavailable." }, 502);
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    console.error("[ai] groq error", upstream.status, text.slice(0, 400));
    const status = upstream.status === 429 ? 429 : upstream.status === 401 ? 500 : 502;
    const msg =
      upstream.status === 429
        ? "AI service is temporarily busy. Please try again in a moment."
        : upstream.status === 401
          ? "AI service not configured"
          : "AI service is temporarily unavailable.";
    return jsonResponse({ error: msg, status: upstream.status }, status);
  }

  const data = (await upstream.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content ?? "";
  if (mode === "json") {
    try {
      const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
      return jsonResponse({ data: JSON.parse(slice) });
    } catch {
      return jsonResponse({ error: "Could not parse AI output" }, 502);
    }
  }
  return jsonResponse({ content });
}
