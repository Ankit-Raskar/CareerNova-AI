import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Sparkles, TrendingUp, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { aiJson } from "@/lib/ai";

export const Route = createFileRoute("/dashboard/quiz")({ component: QuizPage });

const questions = [
  { q: "What kind of work energizes you most?", opts: ["Building products", "Analyzing data", "Designing experiences", "Leading people"] },
  { q: "Which subject did you love?", opts: ["Math & Logic", "Computers", "Art & Design", "Business"] },
  { q: "How do you solve problems?", opts: ["Code it out", "Visualize it", "Talk it out", "Research deeply"] },
  { q: "What's your dream work setup?", opts: ["Remote startup", "Big tech office", "Freelance/own thing", "Research lab"] },
  { q: "What matters most in a career?", opts: ["High salary", "Creative freedom", "Impact on world", "Learning & growth"] },
];

type Rec = { title: string; match_score: number; why_fit: string; salary_range: string; demand: string; top_skills: string[]; roadmap: string[] };

function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Rec[] | null>(null);

  const select = async (opt: string) => {
    const newAns = [...answers, opt];
    setAnswers(newAns);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const qa = questions.map((q, i) => `Q: ${q.q}\nA: ${newAns[i]}`).join("\n\n");
        const schema = {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  match_score: { type: "number" },
                  why_fit: { type: "string" },
                  salary_range: { type: "string" },
                  demand: { type: "string" },
                  top_skills: { type: "array", items: { type: "string" } },
                  roadmap: { type: "array", items: { type: "string" } },
                },
                required: ["title", "match_score", "why_fit", "salary_range", "demand", "top_skills", "roadmap"],
              },
            },
          },
          required: ["recommendations"],
        };
        const result = await aiJson<{ recommendations: Rec[] }>(
          [
            { role: "system", content: "You are CareerNova, an expert career counselor. Based on the user's quiz answers, recommend exactly 3 ideal careers. Be specific, modern, and practical. Match scores between 70-98." },
            { role: "user", content: `Quiz answers:\n\n${qa}\n\nReturn 3 best-fit career recommendations.` },
          ],
          schema,
          "career_recommendations",
        );
        const recs = result.recommendations;
        setResults(recs);
        const { data: u } = await supabase.auth.getUser();
        if (u.user) {
          await supabase.from("quiz_results" as never).insert({ user_id: u.user.id, answers: newAns, recommendations: recs } as any);
        }
      } catch (e: any) {
        toast.error(e?.message || "Something went wrong, try again");
      }
      setLoading(false);
    }
  };

  const reset = () => { setStep(0); setAnswers([]); setResults(null); };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-32 text-center">
        <div className="inline-flex items-center gap-3 glass-strong rounded-full px-5 py-3">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span>AI is matching your perfect careers...</span>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold">Your AI <span className="gradient-text">career matches</span></h1>
          <p className="text-muted-foreground mt-2">Tailored to your answers</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="glass-strong rounded-3xl p-6 elevated-shadow">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-display font-bold gradient-text">{r.match_score}%</div>
                <div className="glass rounded-full px-2.5 py-1 text-xs flex items-center gap-1"><TrendingUp className="h-3 w-3" />{r.demand}</div>
              </div>
              <h3 className="font-display text-xl font-semibold mt-3">{r.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{r.why_fit}</p>
              <div className="mt-4 text-sm"><span className="text-muted-foreground">Salary:</span> {r.salary_range}</div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-2">Top skills</div>
                <div className="flex flex-wrap gap-1.5">{r.top_skills.map((s) => <span key={s} className="glass rounded-full px-2.5 py-0.5 text-xs">{s}</span>)}</div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-2">Roadmap</div>
                <ol className="space-y-1.5 text-sm">
                  {r.roadmap.map((s, j) => (
                    <li key={j} className="flex gap-2"><span className="text-primary font-mono text-xs mt-0.5">{j + 1}.</span>{s}</li>
                  ))}
                </ol>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button onClick={reset} className="inline-flex items-center gap-2 glass-strong px-5 py-2.5 rounded-xl hover:bg-white/10 transition text-sm">
            <RotateCw className="h-4 w-4" /> Retake quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="flex gap-1.5 mb-8">
        {questions.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition ${i <= step ? "aurora-bg" : "bg-white/10"}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-xs text-muted-foreground">Question {step + 1} of {questions.length}</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{questions[step].q}</h2>
          <div className="mt-8 grid gap-3">
            {questions[step].opts.map((opt) => (
              <button
                key={opt}
                onClick={() => select(opt)}
                className="group glass-strong text-left rounded-2xl px-5 py-4 hover:bg-white/10 transition flex items-center justify-between"
              >
                <span>{opt}</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
