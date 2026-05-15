// Vercel Edge Function — AI Mentor (streaming chat via Groq, Llama 3 70B)
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

  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) {
    console.error("[mentor] GROQ_API_KEY missing");
    return new Response(JSON.stringify({ error: "Mentor unavailable" }), {
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

  let upstream: Response;
  try {
    upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        stream: true,
        temperature: 0.7,
        messages: [{ role: "system", content: sys }, ...body.messages],
      }),
    });
  } catch (e) {
    console.error("[mentor] network", e);
    return new Response(JSON.stringify({ error: "Mentor is temporarily unavailable." }), {
      status: 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    console.error("[mentor] groq error", upstream.status, text.slice(0, 400));
    const msg =
      upstream.status === 429
        ? "Mentor is busy right now. Please try again in a moment."
        : upstream.status === 401
          ? "Mentor unavailable"
          : "Mentor is temporarily unavailable.";
    return new Response(JSON.stringify({ error: msg, status: upstream.status }), {
      status: upstream.status === 429 ? 429 : 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response(upstream.body, {
    headers: { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
