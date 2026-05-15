// Frontend wrapper around /api/public/ai
export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export async function aiChat(messages: ChatMsg[], model?: string): Promise<string> {
  const res = await fetch("/api/public/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "chat", messages, model }),
  });
  if (res.status === 429) throw new Error("Rate limit hit, please try again in a minute.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Lovable Cloud settings.");
  if (!res.ok) throw new Error("AI request failed");
  const j = await res.json();
  return j.content as string;
}

export async function aiJson<T>(
  messages: ChatMsg[],
  schema: Record<string, unknown>,
  schema_name = "result",
  model?: string,
): Promise<T> {
  const res = await fetch("/api/public/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "json", messages, schema, schema_name, model }),
  });
  if (res.status === 429) throw new Error("Rate limit hit, please try again in a minute.");
  if (res.status === 402) throw new Error("AI credits exhausted.");
  if (!res.ok) throw new Error("AI request failed");
  const j = await res.json();
  return j.data as T;
}
