import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, Filter, ArrowRight, TrendingUp, Clock, DollarSign } from "lucide-react";
import { careers, type Difficulty } from "@/lib/careers";

export const Route = createFileRoute("/dashboard/careers")({ component: CareersLibrary });

const demands = ["All", "Very High", "High", "Medium"] as const;
const difficulties: ("All" | Difficulty)[] = ["All", "Beginner", "Intermediate", "Advanced"];
const salaryBands = [
  { label: "All", min: 0 },
  { label: "$70k+", min: 70 },
  { label: "$100k+", min: 100 },
  { label: "$150k+", min: 150 },
];

function parseMinSalary(s: string) {
  const m = s.match(/\$(\d+)k/);
  return m ? parseInt(m[1], 10) : 0;
}

function CareersLibrary() {
  const [q, setQ] = useState("");
  const [demand, setDemand] = useState<(typeof demands)[number]>("All");
  const [diff, setDiff] = useState<(typeof difficulties)[number]>("All");
  const [salary, setSalary] = useState(salaryBands[0]);

  const filtered = useMemo(() => {
    return careers.filter((c) => {
      if (q && !`${c.title} ${c.skills.join(" ")} ${c.description}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (demand !== "All" && c.demand !== demand) return false;
      if (diff !== "All" && c.difficulty !== diff) return false;
      if (parseMinSalary(c.salary) < salary.min) return false;
      return true;
    });
  }, [q, demand, diff, salary]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Career <span className="gradient-text">Library</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore {careers.length} curated career paths with AI-tailored roadmaps.
        </p>
      </motion.div>

      {/* Search + filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-3xl p-4 md:p-5 space-y-4"
      >
        <div className="relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search careers, skills, technologies..."
            className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <FilterGroup label="Demand" icon={TrendingUp}>
            {demands.map((d) => (
              <Chip key={d} active={demand === d} onClick={() => setDemand(d)}>
                {d}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Difficulty" icon={Filter}>
            {difficulties.map((d) => (
              <Chip key={d} active={diff === d} onClick={() => setDiff(d)}>
                {d}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Salary" icon={DollarSign}>
            {salaryBands.map((b) => (
              <Chip key={b.label} active={salary.label === b.label} onClick={() => setSalary(b)}>
                {b.label}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -6 }}
            className="group relative"
          >
            <Link
              to="/dashboard/roadmap/$key"
              params={{ key: c.key }}
              className="relative block glass-strong rounded-3xl p-6 h-full overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 h-40 w-40 aurora-bg blur-3xl opacity-0 group-hover:opacity-30 transition rounded-full" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{c.emoji}</div>
                  <span className="glass rounded-full px-2.5 py-1 text-[10px] flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {c.demand}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold mt-4">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Meta icon={DollarSign} label={c.salary} />
                  <Meta icon={Clock} label={c.timeToLearn} />
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.skills.slice(0, 4).map((s) => (
                    <span key={s} className="glass rounded-full px-2 py-0.5 text-[10px]">
                      {s}
                    </span>
                  ))}
                  {c.skills.length > 4 && (
                    <span className="text-[10px] text-muted-foreground self-center">
                      +{c.skills.length - 4}
                    </span>
                  )}
                </div>

                <div className="mt-5 inline-flex items-center gap-2 aurora-bg text-background font-medium px-4 py-2 rounded-xl text-xs glow-shadow group-hover:scale-[1.02] transition">
                  View roadmap <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No careers match your filters. Try widening your search.
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full transition ${
        active ? "aurora-bg text-background font-medium glow-shadow" : "glass hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function Meta({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-3 w-3" /> {label}
    </div>
  );
}
