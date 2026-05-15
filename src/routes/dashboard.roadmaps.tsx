import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Map, ArrowRight, Sparkles, Clock, TrendingUp } from "lucide-react";
import { careers } from "@/lib/careers";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/roadmaps")({ component: RoadmapsPage });

function RoadmapsPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("roadmap_progress" as never)
        .select("career_key, step_key");
      const counts: Record<string, number> = {};
      ((data ?? []) as { career_key: string }[]).forEach((r) => {
        counts[r.career_key] = (counts[r.career_key] ?? 0) + 1;
      });
      setProgress(counts);
    })();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="aurora-bg rounded-2xl p-2.5 glow-shadow">
          <Map className="h-5 w-5 text-background" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Career Roadmaps</h1>
          <p className="text-xs text-muted-foreground">
            Beginner → advanced paths with milestones, projects, and free resources.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {careers.map((c, i) => {
          const done = progress[c.key] ?? 0;
          const total = c.roadmap.length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to="/dashboard/roadmap/$key"
                params={{ key: c.key }}
                className="block glass-strong rounded-3xl p-5 hover:bg-white/5 transition group h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{c.emoji}</div>
                  <span className="text-[10px] uppercase tracking-wider glass rounded-full px-2 py-1 text-muted-foreground">
                    {c.difficulty}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg mb-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{c.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {c.timeToLearn}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {c.demand}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full aurora-bg"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {done}/{total} steps
                  </span>
                  <span className="flex items-center gap-1 gradient-text font-semibold opacity-0 group-hover:opacity-100 transition">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-4 flex items-center gap-3 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Need a custom roadmap? Ask your{" "}
        <Link to="/dashboard/mentor" className="gradient-text font-semibold">
          AI Mentor
        </Link>
        — it'll build one for you.
      </div>
    </div>
  );
}