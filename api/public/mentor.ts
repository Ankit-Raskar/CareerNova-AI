// Vercel Edge Function — AI Mentor (streaming chat via Lovable AI Gateway)
export const config = { runtime: "edge" };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Msg = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM = `You are CareerNova, an elite AI career mentor for students and early-career professionals.
You give crisp, structured, motivating advice with real specifics: tools, skills, roadmaps, projects, certifications, free YouTube channels, salary ranges, and interview prep.
Always format answers with markdown — short intro, then headings/bullets, then a one-line "Next step" call to action.
Be warm and concise. Avoid filler. Use Indian + global context where helpful.`;

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const KEY = process.env.LOVABLE_API_KEY;
  if (!KEY) {
    return new Response(JSON.stringify({ error: "AI service not configured" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  let body: { messages: Msg[]; context?: string };
  try {
    body = (await request.json()) as { messages: Msg[]; context?: string };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages required" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const sys = body.context
    ? `${SYSTEM}\n\nUser context (personalize answers using this):\n${body.context}`
    : SYSTEM;

  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      stream: true,
      temperature: 0.7,
      messages: [{ role: "system", content: sys }, ...body.messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return new Response(JSON.stringify({ error: text || "AI error", status: upstream.status }), {
      status: upstream.status === 429 ? 429 : 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response(upstream.body, {
    headers: { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
