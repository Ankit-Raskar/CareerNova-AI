// Vercel Edge Function — Unified AI proxy (Lovable AI Gateway)
export const config = { runtime: "edge" };

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const PRIMARY = "google/gemini-3-flash-preview";
const FALLBACK = "google/gemini-2.5-flash";

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

async function callGateway(model: string, payload: Record<string, unknown>, key: string) {
  return fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, model }),
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const KEY = process.env.LOVABLE_API_KEY;
  if (!KEY) return jsonResponse({ error: "AI service not configured" }, 500);

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
  let upstream = await callGateway(primary, payload, KEY);
  if (!upstream.ok && upstream.status >= 500 && primary !== FALLBACK) {
    upstream = await callGateway(FALLBACK, payload, KEY);
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    const status = upstream.status === 429 ? 429 : upstream.status === 402 ? 402 : 502;
    const msg =
      status === 429
        ? "AI service is temporarily busy. Please try again in a moment."
        : status === 402
          ? "AI credits exhausted. Please contact support."
          : "AI service is temporarily unavailable.";
    console.error("[ai-gateway] error", upstream.status, text.slice(0, 400));
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
