import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Target,
  Award,
  Flame,
  BookOpen,
  Brain,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  Compass,
  Activity,
  Map,
  Bookmark,
  Send,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { careers } from "@/lib/careers";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

/* ───────────────────────── helpers ───────────────────────── */

function useCounter(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* Card with parallax tilt + gradient border + sheen */
function PremiumCard({
  children,
  className = "",
  glow = "78",
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 25 });
  const sy = useSpring(my, { stiffness: 200, damping: 25 });
  const rx = useTransform(sy, [-0.5, 0.5], [4, -4]);
  const ry = useTransform(sx, [-0.5, 0.5], [-4, 4]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className={`premium-card gradient-border sheen rounded-3xl relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-700"
        style={{
          background: `radial-gradient(400px at var(--x,50%) var(--y,50%), oklch(0.84 0.13 ${glow} / 0.10), transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

/* Radial progress ring */
function RadialRing({ pct, size = 56, glow = "78" }: { pct: number; size?: number; glow?: string }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, pct) / 100) * c;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth={3} fill="none" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={`oklch(0.84 0.13 ${glow})`}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 6px oklch(0.84 0.13 ${glow} / 0.5))` }}
      />
    </svg>
  );
}

/* Live AI mentor typing preview */
function MentorTyping({ topRec, match }: { topRec: string | null; match: number }) {
  const lines = useMemo(
    () =>
      topRec
        ? [
            `You're a strong fit for ${topRec} (${match}% match).`,
            `Next: build a tiny portfolio project this week.`,
            `Want me to draft your 30-day roadmap?`,
          ]
        : [
            `Hi — I'm your AI career mentor.`,
            `Take the 5-question quiz and I'll tailor 3 paths to you.`,
            `It only takes about 90 seconds.`,
          ],
    [topRec, match],
  );
  const [i, setI] = useState(0);
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    const target = lines[i];
    let n = 0;
    const id = setInterval(() => {
      n++;
      setShown(target.slice(0, n));
      if (n >= target.length) {
        clearInterval(id);
        setTimeout(() => setI((v) => (v + 1) % lines.length), 2200);
      }
    }, 22);
    return () => clearInterval(id);
  }, [i, lines]);
  return (
    <div className="text-sm leading-relaxed min-h-[3.5rem]">
      <span>{shown}</span>
      <span className="typing-cursor" />
    </div>
  );
}

/* Magnetic button */
function MagneticLink({
  to,
  children,
  className = "",
  ...rest
}: { to: string; children: React.ReactNode; className?: string } & Record<string, unknown>) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 250, damping: 18 });
  const sy = useSpring(my, { stiffness: 250, damping: 18 });
  return (
    <motion.span style={{ x: sx, y: sy }} className="inline-block">
      <Link
        to={to as never}
        ref={ref}
        onMouseMove={(e) => {
          const r = ref.current?.getBoundingClientRect();
          if (!r) return;
          mx.set((e.clientX - (r.left + r.width / 2)) * 0.18);
          my.set((e.clientY - (r.top + r.height / 2)) * 0.18);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        className={className}
        {...rest}
      >
        {children}
      </Link>
    </motion.span>
  );
}

/* ───────────────────────── page ───────────────────────── */

function DashboardHome() {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Explorer";

  const [savedCount, setSavedCount] = useState(0);
  const [progressCount, setProgressCount] = useState(0);
  const [activity, setActivity] = useState<
    { id: string; kind: string; label: string; created_at: string }[]
  >([]);
  const [quizMatch, setQuizMatch] = useState<number>(0);
  const [topRec, setTopRec] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const [saved, progress, act, quiz] = await Promise.all([
        supabase.from("saved_careers" as never).select("career_key", { count: "exact", head: true }),
        supabase.from("roadmap_progress" as never).select("career_key, step_key", { count: "exact" }),
        supabase
          .from("learning_activity" as never)
          .select("id, kind, label, created_at")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("quiz_results" as never)
          .select("recommendations, created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (!alive) return;
      setSavedCount(saved.count ?? 0);
      setProgressCount(progress.count ?? 0);
      setActivity((act.data as any) ?? []);
      const recs = (quiz.data as any)?.recommendations as
        | { title: string; match_score: number }[]
        | undefined;
      if (recs && recs.length) {
        setQuizMatch(recs[0].match_score ?? 0);
        setTopRec(recs[0].title);
      }
      setLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const trending = useMemo(() => careers.slice(0, 4), []);
  const recommended = useMemo(() => {
    if (topRec) {
      const matched = careers.find((c) =>
        c.title.toLowerCase().includes(topRec.toLowerCase().split(" ")[0]),
      );
      if (matched)
        return [matched, ...careers.filter((c) => c.key !== matched.key).slice(0, 2)];
    }
    return careers.slice(0, 3);
  }, [topRec]);

  const matchVal = useCounter(quizMatch || 78);
  const skillsVal = useCounter(progressCount);
  const savedVal = useCounter(savedCount);

  const stats = [
    { icon: Target, label: "Top Career Match", value: `${matchVal}%`, raw: matchVal, glow: "78", suffix: "" },
    { icon: Award, label: "Saved Roadmaps", value: `${savedVal}`, raw: Math.min(100, savedVal * 20), glow: "252" },
    { icon: Flame, label: "Day Streak", value: "1", raw: 12, glow: "30" },
    { icon: BookOpen, label: "Skills Tracked", value: `${skillsVal}`, raw: Math.min(100, skillsVal * 10), glow: "158" },
  ];

  const tasks = [
    { label: "Take the AI Career Quiz", to: "/dashboard/quiz", icon: Brain, done: !!topRec },
    { label: "Explore the Career Library", to: "/dashboard/careers", icon: Compass, done: savedCount > 0 },
    { label: "Start your first roadmap", to: "/dashboard/careers", icon: Map, done: progressCount > 0 },
  ];

  const completedTasks = tasks.filter((t) => t.done).length;
  const taskPct = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 relative">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full blur-3xl orb"
           style={{ background: "oklch(0.84 0.13 78 / 0.18)" }} />
      <div className="pointer-events-none absolute top-40 right-0 h-80 w-80 rounded-full blur-3xl orb"
           style={{ background: "oklch(0.66 0.16 252 / 0.12)", animationDelay: "-7s" }} />

      {/* ── Hero header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-2"
      >
        <div>
          <div className="eyebrow mb-3">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Welcome back, <span className="serif italic font-normal gradient-text">{name}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl">
            Your career operating system — curated paths, live mentor, and progress at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MagneticLink
            to="/dashboard/quiz"
            className="magnetic inline-flex items-center gap-2 aurora-bg text-background font-medium px-4 py-2.5 rounded-xl glow-shadow text-sm"
          >
            {topRec ? "Retake quiz" : "Start AI quiz"} <Brain className="h-4 w-4" />
          </MagneticLink>
          <MagneticLink
            to="/dashboard/careers"
            className="magnetic inline-flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-sm hover:bg-white/10 transition"
          >
            Browse <ArrowRight className="h-4 w-4" />
          </MagneticLink>
        </div>
      </motion.div>

      {/* ── Stats row with radial rings ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group"
          >
            <PremiumCard glow={s.glow} className="p-5">
              <div className="flex items-start justify-between">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{ background: `oklch(0.72 0.21 ${s.glow} / 0.14)` }}
                >
                  <s.icon className="h-4 w-4" style={{ color: `oklch(0.84 0.13 ${s.glow})` }} />
                </div>
                <RadialRing pct={s.raw} glow={s.glow} />
              </div>
              <div className="text-3xl font-display font-bold mt-4 tracking-tight">{s.value}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
              <div
                className="absolute -bottom-12 -right-12 h-28 w-28 rounded-full blur-3xl opacity-40 pointer-events-none"
                style={{ background: `oklch(0.72 0.21 ${s.glow})` }}
              />
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* ── Asymmetric main grid ── */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Recommended (wide) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 group"
        >
          <PremiumCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="eyebrow mb-2">Curated</div>
                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Recommended for you
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {topRec ? `Based on your AI quiz` : "Take the quiz to personalize these"}
                </p>
              </div>
              <Link
                to="/dashboard/careers"
                className="text-xs glass rounded-full px-3 py-1.5 hover:bg-white/10 transition flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {recommended.map((c, i) => {
                const matchPct = topRec && i === 0 ? quizMatch : 70 + ((i * 7) % 25);
                return (
                  <motion.div
                    key={c.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    whileHover={{ y: -6 }}
                    className="group/card"
                  >
                    <Link
                      to="/dashboard/roadmap/$key"
                      params={{ key: c.key }}
                      className="block premium-card gradient-border sheen rounded-2xl p-4 h-full relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-3xl">{c.emoji}</div>
                        <div className="text-[10px] font-mono px-2 py-0.5 rounded-full glass">
                          <span className="text-primary">{matchPct}%</span>
                        </div>
                      </div>
                      <div className="font-semibold mt-3 leading-tight">{c.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{c.salary}</div>
                      <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${matchPct}%` }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 1, ease: "easeOut" }}
                          className="h-full aurora-bg"
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">{c.demand} demand</span>
                        <span className="flex items-center gap-1 text-primary opacity-0 group-hover/card:opacity-100 transition">
                          Open <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </PremiumCard>
        </motion.div>

        {/* AI Mentor live preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-5 group"
        >
          <PremiumCard glow="252" className="p-6 h-full spotlight">
            <div className="absolute -top-24 -right-24 h-56 w-56 aurora-bg blur-3xl opacity-25 rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1.5 glass rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary dot-pulse" />
                  AI Mentor · Live
                </div>
                <Zap className="h-4 w-4 text-primary" />
              </div>

              <div className="flex items-start gap-3 mt-4">
                <div className="h-9 w-9 rounded-2xl aurora-bg flex items-center justify-center shrink-0 glow-shadow">
                  <Sparkles className="h-4 w-4 text-background" />
                </div>
                <div className="flex-1 glass rounded-2xl rounded-tl-sm p-3">
                  <MentorTyping topRec={topRec} match={quizMatch} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <div className="flex-1 glass rounded-xl px-3 py-2.5 text-xs text-muted-foreground flex items-center justify-between">
                  Ask anything about your career…
                  <Send className="h-3 w-3 text-primary" />
                </div>
                <MagneticLink
                  to="/dashboard/quiz"
                  className="magnetic shrink-0 aurora-bg text-background rounded-xl px-3 py-2.5 text-xs font-medium glow-shadow"
                >
                  {topRec ? "Continue" : "Start"}
                </MagneticLink>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* ── Analytics + Tasks + Activity ── */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Match analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 group"
        >
          <PremiumCard className="p-6 h-full">
            <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-5">
              <Activity className="h-4 w-4 text-primary" /> Match Analytics
            </h2>
            <div className="space-y-4">
              {(topRec
                ? [
                    { name: topRec, pct: quizMatch },
                    { name: "Adjacent path", pct: Math.max(40, quizMatch - 12) },
                    { name: "Stretch path", pct: Math.max(30, quizMatch - 24) },
                  ]
                : [
                    { name: "Frontend Developer", pct: 82 },
                    { name: "AI Engineer", pct: 71 },
                    { name: "UI/UX Designer", pct: 64 },
                  ]
              ).map((m, i) => (
                <div key={m.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-foreground">{m.name}</span>
                    <span className="text-primary font-mono font-medium">{m.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full aurora-bg relative"
                      style={{ boxShadow: "0 0 12px oklch(0.84 0.13 78 / 0.6)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Tasks with completion ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-4 group"
        >
          <PremiumCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Up next
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <RadialRing pct={taskPct} size={32} />
                <span>{completedTasks}/{tasks.length}</span>
              </div>
            </div>
            <ul className="space-y-2">
              {tasks.map((t, i) => (
                <motion.li
                  key={t.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                  <Link
                    to={t.to}
                    className="flex items-center gap-3 glass rounded-xl px-3 py-2.5 text-sm hover:bg-white/10 transition group/t"
                  >
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition ${
                        t.done ? "aurora-bg" : "border border-white/15 group-hover/t:border-primary/60"
                      }`}
                    >
                      {t.done && <CheckCircle2 className="h-3 w-3 text-background" />}
                    </div>
                    <t.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={`flex-1 ${t.done ? "line-through text-muted-foreground" : ""}`}>
                      {t.label}
                    </span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover/t:opacity-100 transition" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </PremiumCard>
        </motion.div>

        {/* Activity timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 group"
        >
          <PremiumCard className="p-6 h-full">
            <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-5">
              <Clock className="h-4 w-4 text-primary" /> Activity
            </h2>
            {!loaded ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                No activity yet — explore careers and start your first roadmap.
              </p>
            ) : (
              <ul className="space-y-3.5 timeline-rail pl-5">
                {activity.map((a, i) => (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="relative text-xs"
                  >
                    <span className="absolute -left-[14px] top-1 h-2 w-2 rounded-full bg-primary dot-pulse" />
                    <div className="text-foreground leading-snug">{a.label}</div>
                    <div className="text-muted-foreground mt-0.5">
                      {new Date(a.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </PremiumCard>
        </motion.div>
      </div>

      {/* ── Trending row ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="group"
      >
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="eyebrow mb-2">In demand</div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Trending careers
              </h2>
            </div>
            <Link
              to="/dashboard/careers"
              className="text-xs glass rounded-full px-3 py-1.5 hover:bg-white/10 transition flex items-center gap-1"
            >
              Browse library <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trending.map((c, i) => (
              <motion.div
                key={c.key}
                whileHover={{ y: -6 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="group/t"
              >
                <Link
                  to="/dashboard/roadmap/$key"
                  params={{ key: c.key }}
                  className="block premium-card gradient-border sheen rounded-2xl p-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-3xl">{c.emoji}</div>
                    <Bookmark className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/t:opacity-100 transition" />
                  </div>
                  <div className="text-sm font-medium mt-3 leading-tight">{c.title}</div>
                  <div className="text-[10px] text-primary mt-1 uppercase tracking-wider font-mono">
                    {c.demand} demand
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
}
