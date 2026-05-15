import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Target,
  Loader2,
  Wand2,
  TrendingUp,
  Hash,
  Layout,
  Compass,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseResumeFile } from "@/lib/resume-parser";

export const Route = createFileRoute("/dashboard/resume")({ component: ResumePage });

type Analysis = {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  formatting: string[];
  careerMatches: { title: string; fit: number; why: string }[];
  interviewReadiness: number;
  skillGaps?: string[];
  projectIdeas?: string[];
  roadmap?: string[];
  nextSteps: string[];
};

function ScoreRing({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} stroke="currentColor" strokeOpacity="0.1" strokeWidth="8" fill="none" />
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            stroke={accent ? "url(#g2)" : "url(#g1)"}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: off }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-3xl font-bold">{Math.round(value)}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function FeedbackList({ icon: Icon, title, items, tone }: { icon: typeof CheckCircle2; title: string; items: string[]; tone: "good" | "warn" | "info" }) {
  const colors =
    tone === "good"
      ? "text-emerald-400"
      : tone === "warn"
        ? "text-amber-400"
        : "text-cyan-400";
  return (
    <div className="glass rounded-2xl p-5">
      <div className={`flex items-center gap-2 mb-3 ${colors}`}>
        <Icon className="h-4 w-4" />
        <h3 className="font-display font-semibold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm">
        {items?.map((it, i) => (
          <li key={i} className="flex gap-2 text-muted-foreground">
            <span className={`mt-1 h-1.5 w-1.5 rounded-full ${colors}`} />
            <span className="text-foreground/90">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResumePage() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [filename, setFilename] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ id: string; filename: string | null; score: number | null; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("resume_analyses" as never)
        .select("id, filename, score, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setHistory((data ?? []) as any);
    })();
  }, [user, analysis]);

  const [parsing, setParsing] = useState(false);

  async function handleFile(file: File) {
    setFilename(file.name);
    setParsing(true);
    const t = toast.loading(`Reading ${file.name}…`);
    try {
      const { text: extracted, pages } = await parseResumeFile(file);
      if (!extracted || extracted.length < 80) {
        toast.error("Couldn't read enough text from this file. Try a different format.", { id: t });
        return;
      }
      setText(extracted);
      toast.success(`Extracted ${extracted.length.toLocaleString()} chars${pages ? ` from ${pages} page${pages > 1 ? "s" : ""}` : ""}`, { id: t });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to read file", { id: t });
    } finally {
      setParsing(false);
    }
  }

  async function analyze() {
    if (text.trim().length < 80) {
      toast.error("Add at least a few paragraphs of resume text");
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const r = await fetch("/api/public/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Analysis failed");
      const a = j.data as Analysis;
      setAnalysis(a);
      if (user) {
        await supabase.from("resume_analyses" as never).insert({
          user_id: user.id,
          filename,
          score: a.score,
          summary: a.summary,
          feedback: a as any,
        } as any);
        await supabase.from("learning_activity" as never).insert({
          user_id: user.id,
          kind: "resume_analysis",
          label: `Resume scored ${Math.round(a.score)}/100`,
        } as any);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not analyze";
      toast.error(msg.length > 120 ? "AI service is temporarily busy. Please try again." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="glass-strong rounded-3xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="aurora-bg rounded-2xl p-2.5 glow-shadow">
            <FileText className="h-5 w-5 text-background" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Resume Analyzer</h1>
            <p className="text-xs text-muted-foreground">ATS scoring · keyword gaps · career fit · powered by Groq Llama 3.3</p>
          </div>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Last score:{" "}
            <span className="text-foreground font-semibold">{history[0]?.score ?? "—"}/100</span>
          </div>
        )}
      </div>

      {/* Input card */}
      <div className="glass-strong rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <label className="glass rounded-xl px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 hover:bg-white/10 transition">
            {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {filename ? <span className="truncate max-w-[200px]">{filename}</span> : "Upload PDF, DOCX or TXT"}
            <input
              type="file"
              accept=".txt,.md,text/plain,.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
          <button
            onClick={analyze}
            disabled={loading || text.trim().length < 80}
            className="aurora-bg rounded-xl px-5 py-2.5 text-sm font-medium text-background glow-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-[1.02] transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? "Analyzing…" : "Analyze with AI"}
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your resume text here…"
          rows={10}
          className="w-full glass rounded-2xl p-4 text-sm bg-transparent outline-none border border-white/10 focus:border-primary/50 transition resize-y"
        />
      </div>

      {/* Results */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-strong rounded-3xl p-6 grid md:grid-cols-3 gap-6 items-center">
            <ScoreRing value={analysis.score} label="ATS Score" />
            <ScoreRing value={analysis.interviewReadiness} label="Interview Readiness" accent />
            <p className="text-sm text-muted-foreground leading-relaxed md:col-span-1">
              <span className="text-foreground font-semibold">Summary.</span> {analysis.summary}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FeedbackList icon={CheckCircle2} title="Strengths" items={analysis.strengths} tone="good" />
            <FeedbackList icon={AlertTriangle} title="Gaps" items={analysis.weaknesses} tone="warn" />
            <FeedbackList icon={Hash} title="Missing keywords" items={analysis.missingKeywords} tone="info" />
            <FeedbackList icon={Layout} title="Formatting" items={analysis.formatting} tone="info" />
          </div>

          <div className="glass-strong rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Compass className="h-4 w-4" />
              <h3 className="font-display font-semibold text-sm uppercase tracking-wide">Career fit</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.careerMatches?.map((m, i) => (
                <div key={i} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{m.title}</h4>
                    <span className="text-xs gradient-text font-bold">{Math.round(m.fit)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.fit}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * i }}
                      className="h-full aurora-bg"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{m.why}</p>
                </div>
              ))}
            </div>
          </div>

          {(analysis.skillGaps?.length || analysis.projectIdeas?.length || analysis.roadmap?.length) ? (
            <div className="grid md:grid-cols-3 gap-4">
              {analysis.skillGaps?.length ? (
                <FeedbackList icon={AlertTriangle} title="Skill gaps" items={analysis.skillGaps} tone="warn" />
              ) : null}
              {analysis.projectIdeas?.length ? (
                <FeedbackList icon={Sparkles} title="Project ideas" items={analysis.projectIdeas} tone="info" />
              ) : null}
              {analysis.roadmap?.length ? (
                <FeedbackList icon={Compass} title="90-day roadmap" items={analysis.roadmap} tone="good" />
              ) : null}
            </div>
          ) : null}

          <FeedbackList icon={Target} title="Next steps" items={analysis.nextSteps} tone="good" />
        </motion.div>
      )}

      {!analysis && history.length > 0 && (
        <div className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wide">Recent analyses</h3>
          </div>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="glass rounded-xl p-3 flex items-center justify-between text-sm">
                <span className="truncate">{h.filename ?? "Resume"}</span>
                <span className="gradient-text font-semibold">{h.score ?? "—"}/100</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
