import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  Trash2,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/mentor")({ component: MentorPage });

type Msg = { role: "user" | "assistant"; content: string; created_at?: string };

const SUGGESTED = [
  "Best roadmap for AI engineer",
  "How do I become a frontend developer?",
  "Suggest projects for beginners",
  "Top skills for cybersecurity",
  "Interview questions for React",
  "Best free certifications",
  "How to improve my resume?",
  "Career options after BCA",
];

function timeAgo(ts?: string) {
  if (!ts) return "";
  const d = new Date(ts).getTime();
  const m = Math.round((Date.now() - d) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function MentorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [contextStr, setContextStr] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history + personalization context
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const [hist, quiz, saved] = await Promise.all([
        supabase
          .from("chat_messages" as never)
          .select("role, content, created_at")
          .order("created_at", { ascending: true })
          .limit(60),
        supabase
          .from("quiz_results" as never)
          .select("recommendations")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("saved_careers" as never).select("title").limit(8),
      ]);
      if (!alive) return;
      const rows = (hist.data ?? []) as Msg[];
      setMessages(rows.filter((r) => r.role === "user" || r.role === "assistant"));
      const recs = (quiz.data as { recommendations?: { title?: string }[] } | null)?.recommendations;
      const savedTitles = ((saved.data ?? []) as { title: string }[]).map((s) => s.title);
      const ctx: string[] = [];
      if (recs?.length) ctx.push(`Quiz top matches: ${recs.slice(0, 3).map((r) => r.title).join(", ")}`);
      if (savedTitles.length) ctx.push(`Saved careers: ${savedTitles.join(", ")}`);
      setContextStr(ctx.join("\n"));
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function persist(role: "user" | "assistant", content: string) {
    if (!user) return;
    await supabase
      .from("chat_messages" as never)
      .insert({ user_id: user.id, role, content } as any);
  }

  async function send(prompt?: string) {
    const text = (prompt ?? input).trim();
    if (!text || streaming) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setStreaming(true);
    setThinking(true);
    persist("user", text);

    try {
      const res = await fetch("/api/public/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: contextStr,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (res.status === 429) throw new Error("Slow down — rate limited. Try again in a minute.");
      if (!res.ok || !res.body) throw new Error("Mentor unavailable");

      // Insert empty assistant message
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let firstToken = true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length) {
              if (firstToken) {
                setThinking(false);
                firstToken = false;
              }
              acc += delta;
              setMessages((prev) => {
                const copy = prev.slice();
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            // partial line — restore and wait for more
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
      if (acc) persist("assistant", acc);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setMessages((m) => m.filter((x, i) => !(i === m.length - 1 && x.role === "assistant" && !x.content)));
    } finally {
      setStreaming(false);
      setThinking(false);
    }
  }

  async function clearAll() {
    if (!user) return;
    if (!confirm("Clear all chat history?")) return;
    await supabase.from("chat_messages" as never).delete().eq("user_id", user.id);
    setMessages([]);
    toast.success("History cleared");
  }

  const empty = messages.length === 0;
  const personalised = useMemo(() => Boolean(contextStr), [contextStr]);

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-7rem)] md:h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="glass-strong rounded-3xl p-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="aurora-bg rounded-2xl p-2.5 glow-shadow">
            <Sparkles className="h-5 w-5 text-background" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">AI Mentor</h1>
            <p className="text-xs text-muted-foreground">
              {personalised ? "Personalized to your career profile" : "Powered by Llama 3 · 70B"}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearAll}
            className="glass rounded-xl px-3 py-2 text-xs flex items-center gap-1.5 hover:bg-white/10 transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto glass-strong rounded-3xl p-4 md:p-6 space-y-4 scroll-smooth"
      >
        {empty && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="aurora-bg rounded-3xl p-5 mb-5 glow-shadow"
            >
              <Bot className="h-8 w-8 text-background" />
            </motion.div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Your <span className="gradient-text">AI Career Mentor</span>
            </h2>
            <p className="text-muted-foreground max-w-md mb-8 text-sm">
              Ask anything about careers, skills, projects, interviews, salaries, or learning paths.
              I'll build a plan with you — step by step.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Lightbulb className="h-3.5 w-3.5" /> Try a prompt
            </div>
            <div className="grid sm:grid-cols-2 gap-2 w-full max-w-2xl">
              {SUGGESTED.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="glass rounded-xl px-4 py-3 text-sm text-left hover:bg-white/10 transition group"
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition">{p}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center ${
                  m.role === "user" ? "glass" : "aurora-bg glow-shadow"
                }`}
              >
                {m.role === "user" ? (
                  <UserIcon className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4 text-background" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "aurora-bg text-background"
                    : "glass border border-white/10"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0 prose-strong:text-foreground prose-a:text-primary">
                    <ReactMarkdown>{m.content || " "}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                )}
                {m.created_at && (
                  <div
                    className={`text-[10px] mt-2 opacity-60 ${
                      m.role === "user" ? "text-background/80" : "text-muted-foreground"
                    }`}
                  >
                    {timeAgo(m.created_at)}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center aurora-bg glow-shadow">
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <div className="glass border border-white/10 rounded-2xl px-4 py-3 text-sm flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="mt-4 glass-strong rounded-3xl p-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Ask your AI mentor anything…"
          className="flex-1 resize-none bg-transparent outline-none px-3 py-2.5 text-sm placeholder:text-muted-foreground max-h-32"
        />
        <button
          onClick={() => send()}
          disabled={streaming || !input.trim()}
          className="aurora-bg rounded-2xl p-3 text-background glow-shadow disabled:opacity-50 disabled:cursor-not-allowed transition hover:scale-105"
        >
          {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}