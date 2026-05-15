import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  ExternalLink,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Code2,
  Github,
  Sparkles,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { careersByKey, type Career, type Difficulty } from "@/lib/careers";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/roadmap/$key")({
  component: RoadmapPage,
  loader: ({ params }): { career: Career } => {
    const career = careersByKey[params.key];
    if (!career) throw notFound();
    return { career };
  },
});

const levelColors: Record<Difficulty, string> = {
  Beginner: "oklch(0.78 0.18 160)",
  Intermediate: "oklch(0.78 0.18 200)",
  Advanced: "oklch(0.7 0.22 330)",
};

function RoadmapPage() {
  const { career } = Route.useLoaderData() as { career: Career };
  const { user } = useAuth();

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [openStep, setOpenStep] = useState<string | null>(career.roadmap[0]?.key ?? null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const [progress, savedRow] = await Promise.all([
        supabase
          .from("roadmap_progress" as never)
          .select("step_key")
          .eq("career_key", career.key),
        supabase
          .from("saved_careers" as never)
          .select("id")
          .eq("career_key", career.key)
          .maybeSingle(),
      ]);
      if (!alive) return;
      const done = new Set<string>(((progress.data as any) ?? []).map((r: any) => r.step_key as string));
      setCompleted(done);
      setSaved(!!savedRow.data);
    })();
    return () => {
      alive = false;
    };
  }, [user, career.key]);

  const toggleStep = async (stepKey: string) => {
    if (!user) return toast.error("Sign in to track progress");
    const next = new Set(completed);
    if (next.has(stepKey)) {
      next.delete(stepKey);
      await supabase
        .from("roadmap_progress" as never)
        .delete()
        .eq("career_key", career.key)
        .eq("step_key", stepKey);
    } else {
      next.add(stepKey);
      await supabase
        .from("roadmap_progress" as never)
        .upsert({ user_id: user.id, career_key: career.key, step_key: stepKey, completed: true } as any);
      await supabase.from("learning_activity" as never).insert({
        user_id: user.id,
        kind: "roadmap_step",
        label: `Completed "${career.roadmap.find((s) => s.key === stepKey)?.title}" in ${career.title}`,
      } as any);
    }
    setCompleted(next);
  };

  const toggleSave = async () => {
    if (!user) return toast.error("Sign in to save");
    if (saved) {
      await supabase.from("saved_careers" as never).delete().eq("career_key", career.key);
      setSaved(false);
      toast.success("Removed from saved");
    } else {
      await supabase.from("saved_careers" as never).insert({
        user_id: user.id,
        career_key: career.key,
        title: career.title,
      } as any);
      setSaved(true);
      toast.success("Added to saved roadmaps");
    }
  };

  const totalHours = useMemo(() => career.roadmap.reduce((a, s) => a + s.hours, 0), [career]);
  const doneHours = useMemo(
    () => career.roadmap.filter((s) => completed.has(s.key)).reduce((a, s) => a + s.hours, 0),
    [career, completed],
  );
  const pct = Math.round((doneHours / Math.max(1, totalHours)) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/dashboard/careers"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition mb-4"
        >
          <ArrowLeft className="h-3 w-3" /> Back to library
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute -top-32 -right-32 h-80 w-80 aurora-bg blur-3xl opacity-25 rounded-full" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{career.emoji}</div>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold">{career.title}</h1>
                  <p className="text-muted-foreground mt-1 max-w-2xl">{career.description}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Pill icon={TrendingUp}>{career.demand} demand</Pill>
                <Pill icon={DollarSign}>{career.salary}</Pill>
                <Pill icon={Clock}>{career.timeToLearn}</Pill>
                <Pill icon={Sparkles}>{career.difficulty}</Pill>
              </div>
            </div>
            <button
              onClick={toggleSave}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                saved ? "aurora-bg text-background glow-shadow" : "glass hover:bg-white/10"
              }`}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Saved" : "Save roadmap"}
            </button>
          </div>

          {/* Progress */}
          <div className="relative mt-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">
                Progress · {completed.size} / {career.roadmap.length} steps
              </span>
              <span className="text-primary font-medium">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full aurora-bg"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-3xl p-5"
      >
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Skill set
        </div>
        <div className="flex flex-wrap gap-1.5">
          {career.skills.map((s) => (
            <span key={s} className="glass rounded-full px-3 py-1 text-xs">
              {s}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <div>
        <h2 className="font-display text-2xl font-bold mb-5">Learning Roadmap</h2>
        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute left-[19px] md:left-[23px] top-2 bottom-2 w-px"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.72 0.21 295 / 0.5), oklch(0.78 0.18 200 / 0.5), transparent)",
            }}
          />

          <div className="space-y-3">
            {career.roadmap.map((step, idx) => {
              const isDone = completed.has(step.key);
              const isOpen = openStep === step.key;
              const color = levelColors[step.level];
              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative pl-12 md:pl-14"
                >
                  {/* Node */}
                  <button
                    onClick={() => toggleStep(step.key)}
                    className="absolute left-0 top-3 flex items-center justify-center"
                    aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                  >
                    <div
                      className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition"
                      style={{
                        background: isDone ? color : "oklch(0.18 0.04 270)",
                        boxShadow: isDone ? `0 0 24px ${color}` : `0 0 0 1px oklch(1 0 0 / 0.1)`,
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-background" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  <div
                    className={`glass-strong rounded-2xl overflow-hidden transition ${
                      isDone ? "opacity-80" : ""
                    }`}
                  >
                    <button
                      onClick={() => setOpenStep(isOpen ? null : step.key)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: `${color.replace(")", " / 0.15)")}`, color }}
                          >
                            {step.level}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {step.hours}h
                          </span>
                        </div>
                        <h3
                          className={`font-display text-lg font-semibold ${
                            isDone ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {step.description}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                      <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                            <p className="text-sm text-muted-foreground">{step.description}</p>

                            {/* YouTube resources */}
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                                YouTube Learning Resources
                              </div>
                              <div className="grid sm:grid-cols-2 gap-2">
                                {step.resources.map((r) => (
                                  <a
                                    key={r.title}
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="glass rounded-xl p-3 hover:bg-white/10 transition flex gap-3 group"
                                  >
                                    <div
                                      className="h-12 w-16 shrink-0 rounded-lg flex items-center justify-center relative overflow-hidden"
                                      style={{
                                        background: `linear-gradient(135deg, ${color}, oklch(0.13 0.03 270))`,
                                      }}
                                    >
                                      <Play className="h-4 w-4 text-background fill-background relative z-10" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium truncate">{r.title}</div>
                                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                        {r.creator} · {r.duration}
                                      </div>
                                      <div className="mt-1">
                                        <span
                                          className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                                          style={{
                                            background: `${levelColors[r.level].replace(")", " / 0.15)")}`,
                                            color: levelColors[r.level],
                                          }}
                                        >
                                          {r.level}
                                        </span>
                                      </div>
                                    </div>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition self-start" />
                                  </a>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => toggleStep(step.key)}
                              className={`text-xs px-4 py-2 rounded-xl transition ${
                                isDone
                                  ? "glass hover:bg-white/10"
                                  : "aurora-bg text-background font-medium glow-shadow"
                              }`}
                            >
                              {isDone ? "Mark as incomplete" : "Mark step complete"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-display text-2xl font-bold mb-5 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" /> Recommended Projects
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {career.projects.map((p, i) => {
            const color = levelColors[p.level];
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                whileHover={{ y: -4 }}
                className="glass-strong rounded-2xl p-5 relative overflow-hidden group"
              >
                <div
                  className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition"
                  style={{ background: color }}
                />
                <div className="relative">
                  <span
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: `${color.replace(")", " / 0.15)")}`, color }}
                  >
                    {p.level}
                  </span>
                  <h3 className="font-display text-lg font-semibold mt-3">{p.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" /> ~{p.hours}h
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.tech.map((t) => (
                      <span key={t} className="glass rounded-full px-2 py-0.5 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                  <a
                    href={p.inspiration}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs glass rounded-xl px-3 py-1.5 hover:bg-white/10 transition"
                  >
                    <Github className="h-3 w-3" /> Inspiration
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function Pill({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="glass rounded-full px-3 py-1 text-xs flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-primary" />
      {children}
    </span>
  );
}
