import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  X,
  TrendingUp,
  Building2,
  Zap,
  GraduationCap,
  Filter as FilterIcon,
  Loader2,
} from "lucide-react";
import { popularLocations } from "@/lib/jobs";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/jobs")({ component: JobsPage });

const remoteOpts = ["All", "Remote", "Hybrid", "On-site"] as const;
const typeOpts = ["All", "Full-time", "Internship", "Contract", "Part-time"] as const;
const expOpts = ["All", "Internship", "Entry", "Mid", "Senior"] as const;
const salaryBands = [
  { label: "Any", min: 0 },
  { label: "$70k+", min: 70000 },
  { label: "$120k+", min: 120000 },
  { label: "$180k+", min: 180000 },
];

const TECH_CHIPS = [
  "React", "TypeScript", "Node", "Python", "Java", "AWS",
  "Kubernetes", "Docker", "SQL", "Go", "Rust", "Next.js",
  "TailwindCSS", "GraphQL", "Django", "Flask",
];

const TRENDING_QUERIES = [
  "software engineer", "frontend developer", "backend developer",
  "full stack developer", "data scientist", "ai engineer",
];

type LiveJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  contractTime: string;
  contractType: string;
  category: string;
  created: string;
  applyUrl: string;
};

function inferRemote(j: LiveJob): "Remote" | "Hybrid" | "On-site" {
  const s = `${j.title} ${j.location} ${j.description}`.toLowerCase();
  if (s.includes("remote") || s.includes("work from home")) return "Remote";
  if (s.includes("hybrid")) return "Hybrid";
  return "On-site";
}
function inferType(j: LiveJob): "Full-time" | "Internship" | "Contract" | "Part-time" {
  const s = `${j.title} ${j.contractTime} ${j.contractType}`.toLowerCase();
  if (s.includes("intern")) return "Internship";
  if (j.contractType === "contract" || s.includes("contract")) return "Contract";
  if (j.contractTime === "part_time" || s.includes("part-time") || s.includes("part time")) return "Part-time";
  return "Full-time";
}
function inferExp(j: LiveJob): "Internship" | "Entry" | "Mid" | "Senior" {
  const s = j.title.toLowerCase();
  if (s.includes("intern")) return "Internship";
  if (s.includes("senior") || s.includes("sr.") || s.includes("lead") || s.includes("principal") || s.includes("staff")) return "Senior";
  if (s.includes("junior") || s.includes("jr.") || s.includes("entry") || s.includes("graduate") || s.includes("associate")) return "Entry";
  return "Mid";
}
function relTime(iso: string) {
  if (!iso) return "Recently";
  const d = new Date(iso).getTime();
  if (!d) return "Recently";
  const diff = Date.now() - d;
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
function fmtSalary(j: LiveJob) {
  const a = j.salaryMin, b = j.salaryMax;
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
  if (a && b) return `$${fmt(a)} – $${fmt(b)}`;
  if (a) return `From $${fmt(a)}`;
  if (b) return `Up to $${fmt(b)}`;
  return "Not disclosed";
}
function logoFor(company: string) {
  return (company?.[0] || "•").toUpperCase();
}

function contractTimeFor(typeFilter: (typeof typeOpts)[number]) {
  if (typeFilter === "Full-time") return "full_time";
  if (typeFilter === "Part-time") return "part_time";
  return "";
}
function contractTypeFor(typeFilter: (typeof typeOpts)[number]) {
  if (typeFilter === "Contract") return "contract";
  return "";
}

function JobsPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState<string>("All");
  const [remote, setRemote] = useState<(typeof remoteOpts)[number]>("All");
  const [type, setType] = useState<(typeof typeOpts)[number]>("All");
  const [exp, setExp] = useState<(typeof expOpts)[number]>("All");
  const [salary, setSalary] = useState(salaryBands[0]);
  const [techChips, setTechChips] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"all" | "internships" | "saved">("all");

  const [results, setResults] = useState<LiveJob[]>([]);
  const [savedJobs, setSavedJobs] = useState<LiveJob[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [appliedFallback, setAppliedFallback] = useState<string | null>(null);
  const [openJob, setOpenJob] = useState<LiveJob | null>(null);

  const reqIdRef = useRef(0);

  // Load saved jobs
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const { data } = await supabase.from("saved_jobs" as never).select("job_id, payload");
      if (!alive) return;
      const rows = (data as Array<{ job_id: string; payload: LiveJob }>) ?? [];
      setSavedIds(new Set(rows.map((r) => r.job_id)));
      setSavedJobs(rows.map((r) => r.payload).filter(Boolean));
    })();
    return () => { alive = false; };
  }, [user]);

  // Build API query — only the keyword goes to Adzuna; tech chips filter locally.
  const fetchJobs = useCallback(
    async (overrides?: { what?: string; where?: string; type?: (typeof typeOpts)[number]; salary?: number }) => {
      const reqId = ++reqIdRef.current;
      setLoading(true);
      setErrMsg(null);
      setAppliedFallback(null);

      const userQuery = (overrides?.what ?? q).trim();
      let baseQuery = userQuery ||
        TRENDING_QUERIES[Math.floor(Math.random() * TRENDING_QUERIES.length)];
      // If the Internships tab is active, bias the API search toward internships.
      if (tab === "internships") {
        baseQuery = userQuery
          ? (/intern/i.test(userQuery) ? userQuery : `${userQuery} intern`)
          : "intern";
      }
      const baseWhere = overrides?.where ?? loc;
      const baseType = overrides?.type ?? (tab === "internships" ? "Internship" : type);
      const baseSalary = overrides?.salary ?? salary.min;

      async function run(params: URLSearchParams, label: string): Promise<LiveJob[]> {
        console.log(`[jobs] API query (${label}):`, params.toString());
        const res = await fetch(`/api/public/jobs-feed?${params.toString()}`);
        const j = (await res.json().catch(() => ({}))) as { results?: LiveJob[]; error?: string };
        if (j.error && (!j.results || j.results.length === 0)) {
          console.warn("[jobs] API error:", j.error);
        }
        const out = j.results ?? [];
        console.log(`[jobs] Jobs returned (${label}):`, out.length);
        return out;
      }

      const filters = {
        keyword: baseQuery, location: baseWhere, type: baseType,
        remote, experience: exp, salary: baseSalary, techChips: [...techChips],
      };
      console.log("[jobs] Filters:", filters);

      const buildParams = (opts: { keyword: string; where: string; type: (typeof typeOpts)[number]; salary: number; remote: boolean }) => {
        const p = new URLSearchParams();
        p.set("what", opts.keyword);
        if (opts.where && opts.where !== "All") p.set("where", opts.where);
        if (opts.remote) p.set("remote", "1");
        const ct = contractTimeFor(opts.type);
        const cty = contractTypeFor(opts.type);
        if (ct) p.set("contract_time", ct);
        if (cty) p.set("contract_type", cty);
        if (opts.salary > 0) p.set("salary_min", String(opts.salary));
        p.set("results_per_page", "30");
        return p;
      };

      try {
        // Attempt 1 — full filters
        let jobs = await run(
          buildParams({ keyword: baseQuery, where: baseWhere, type: baseType, salary: baseSalary, remote: remote === "Remote" }),
          "primary",
        );

        // Fallback 2 — drop type/salary/remote
        if (jobs.length === 0) {
          setAppliedFallback("Removed type, salary, and remote filters");
          jobs = await run(
            buildParams({ keyword: baseQuery, where: baseWhere, type: "All", salary: 0, remote: false }),
            "fallback-no-extras",
          );
        }

        // Fallback 3 — drop location
        if (jobs.length === 0) {
          setAppliedFallback("Removed location filter");
          jobs = await run(
            buildParams({ keyword: baseQuery, where: "All", type: "All", salary: 0, remote: false }),
            "fallback-no-location",
          );
        }

        // Fallback 4 — broaden keyword
        if (jobs.length === 0) {
          const broad = baseQuery.split(/\s+/)[0] || "developer";
          setAppliedFallback(`Broadened keyword to "${broad}"`);
          jobs = await run(
            buildParams({ keyword: broad, where: "All", type: "All", salary: 0, remote: false }),
            "fallback-broad-keyword",
          );
        }

        // Fallback 5 — trending fetch
        if (jobs.length === 0) {
          const trending = TRENDING_QUERIES[0];
          setAppliedFallback(`Showing trending tech jobs ("${trending}")`);
          jobs = await run(
            buildParams({ keyword: trending, where: "All", type: "All", salary: 0, remote: false }),
            "fallback-trending",
          );
        }

        if (reqId !== reqIdRef.current) return;
        setResults(jobs);
        if (jobs.length === 0) setErrMsg("No jobs found right now. Try again later.");
      } catch (e) {
        console.error("[jobs] fetch failed", e);
        if (reqId === reqIdRef.current) setErrMsg("Couldn't reach the jobs service.");
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    },
    [q, loc, type, salary, remote, exp, techChips, tab],
  );

  // Initial load — trending tech jobs
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce on filter changes
  useEffect(() => {
    if (tab === "saved") return;
    const h = setTimeout(() => { fetchJobs(); }, 350);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, loc, remote, type, salary, tab]);

  // Local filtering — tech chips, experience, work mode (post-fetch)
  const sourceList = tab === "saved" ? savedJobs : results;
  const filtered = useMemo(() => {
    return sourceList.filter((j) => {
      if (tab === "internships" && inferType(j) !== "Internship") return false;
      if (remote !== "All" && inferRemote(j) !== remote) return false;
      if (exp !== "All" && inferExp(j) !== exp) return false;
      if (techChips.size > 0) {
        const hay = `${j.title} ${j.description}`.toLowerCase();
        const hasAny = [...techChips].some((c) => hay.includes(c.toLowerCase()));
        if (!hasAny) return false;
      }
      return true;
    });
  }, [sourceList, tab, remote, exp, techChips]);

  const toggleSave = async (j: LiveJob) => {
    if (!user) { toast.error("Sign in to save jobs"); return; }
    const isSaved = savedIds.has(j.id);
    const next = new Set(savedIds);
    if (isSaved) {
      next.delete(j.id);
      setSavedIds(next);
      setSavedJobs((prev) => prev.filter((s) => s.id !== j.id));
      await supabase.from("saved_jobs" as never).delete().eq("job_id", j.id).eq("user_id", user.id);
      toast("Removed from saved jobs");
    } else {
      next.add(j.id);
      setSavedIds(next);
      setSavedJobs((prev) => [j, ...prev]);
      await supabase.from("saved_jobs" as never).insert({
        user_id: user.id,
        job_id: j.id,
        title: j.title,
        company: j.company,
        apply_url: j.applyUrl,
        payload: j as never,
      } as never);
      toast.success("Job saved");
    }
  };

  const toggleTechChip = (s: string) => {
    setTechChips((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  const clearAll = () => {
    setQ(""); setLoc("All"); setRemote("All"); setType("All");
    setExp("All"); setSalary(salaryBands[0]); setTechChips(new Set());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1 text-[10px] uppercase tracking-wider mb-3">
          <Sparkles className="h-3 w-3 text-primary" /> Live Job Search
        </div>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
          Find your next <span className="gradient-text">opportunity</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Live jobs from Adzuna — search, filter, and save roles you love.
        </p>
      </motion.div>

      {/* Popular Locations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base md:text-lg font-bold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Popular Locations
          </h2>
          {loc !== "All" && (
            <button onClick={() => setLoc("All")} className="text-xs glass rounded-full px-3 py-1 hover:bg-white/10 transition">
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
          {popularLocations.map((l, i) => {
            const active = loc === l.name;
            return (
              <motion.button
                key={l.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                whileHover={{ y: -4 }}
                onClick={() => setLoc(active ? "All" : l.name)}
                className={`relative shrink-0 snap-start glass-strong rounded-2xl p-4 w-32 sm:w-40 text-left overflow-hidden group ${active ? "ring-2 ring-primary" : ""}`}
              >
                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition" style={{ background: `oklch(0.72 0.21 ${l.hue})` }} />
                <div className="relative">
                  <div className="text-2xl">{l.emoji}</div>
                  <div className="font-semibold mt-2 text-sm">{l.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{l.count.toLocaleString()} jobs</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 glass rounded-full p-1 w-fit max-w-full overflow-x-auto">
        {([
          { k: "all", label: "All Jobs", icon: Briefcase },
          { k: "internships", label: "Internships", icon: GraduationCap },
          { k: "saved", label: `Saved (${savedIds.size})`, icon: Bookmark },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`relative text-xs px-3 sm:px-4 py-2 rounded-full flex items-center gap-1.5 transition whitespace-nowrap ${
              tab === t.k ? "text-background font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === t.k && (
              <motion.div layoutId="jobs-tab" className="absolute inset-0 aurora-bg rounded-full glow-shadow" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <span className="relative flex items-center gap-1.5">
              <t.icon className="h-3 w-3" /> {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-4 md:p-5 space-y-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Try "React Developer", "Python Internship", "UI UX Designer"…'
            className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FilterGroup label="Work Mode" icon={Zap}>
            {remoteOpts.map((o) => <Chip key={o} active={remote === o} onClick={() => setRemote(o)}>{o}</Chip>)}
          </FilterGroup>
          <FilterGroup label="Type" icon={Briefcase}>
            {typeOpts.map((o) => <Chip key={o} active={type === o} onClick={() => setType(o)}>{o}</Chip>)}
          </FilterGroup>
          <FilterGroup label="Experience" icon={TrendingUp}>
            {expOpts.map((o) => <Chip key={o} active={exp === o} onClick={() => setExp(o)}>{o}</Chip>)}
          </FilterGroup>
          <FilterGroup label="Salary (optional)" icon={DollarSign}>
            {salaryBands.map((b) => <Chip key={b.label} active={salary.label === b.label} onClick={() => setSalary(b)}>{b.label}</Chip>)}
          </FilterGroup>
          <div className="lg:col-span-2">
            <FilterGroup label="Tech Stack (local filter)" icon={FilterIcon}>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {TECH_CHIPS.map((s) => (
                  <Chip key={s} active={techChips.has(s)} onClick={() => toggleTechChip(s)}>{s}</Chip>
                ))}
              </div>
            </FilterGroup>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <button onClick={clearAll} className="glass rounded-full px-3 py-1.5 hover:bg-white/10 transition">
            Clear all filters
          </button>
          {appliedFallback && (
            <span className="text-muted-foreground italic">Auto-relaxed: {appliedFallback}</span>
          )}
        </div>
      </motion.div>

      {/* Results meta */}
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        {loading ? (
          <><Loader2 className="h-3 w-3 animate-spin" /> Searching live jobs…</>
        ) : (
          <>Showing <span className="text-foreground font-medium">{filtered.length}</span> {tab === "internships" ? "internships" : tab === "saved" ? "saved jobs" : "jobs"}</>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {filtered.map((j, i) => (
            <JobCard
              key={j.id || `${j.title}-${i}`}
              job={j}
              saved={savedIds.has(j.id)}
              onToggleSave={() => toggleSave(j)}
              onOpen={() => setOpenJob(j)}
              delay={i * 0.03}
            />
          ))}
        </div>
      </AnimatePresence>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 md:py-20 text-muted-foreground glass-strong rounded-3xl px-4">
          <div className="text-sm mb-2">{errMsg ?? "No jobs match your filters."}</div>
          <div className="text-xs">Try removing some filters or using a broader search term.</div>
          <button onClick={clearAll} className="mt-4 inline-flex items-center gap-2 text-xs glass rounded-full px-4 py-2 hover:bg-white/10 transition">
            Reset filters
          </button>
        </div>
      )}

      <JobModal
        job={openJob}
        onClose={() => setOpenJob(null)}
        saved={openJob ? savedIds.has(openJob.id) : false}
        onToggleSave={() => openJob && toggleSave(openJob)}
      />
    </div>
  );
}

function JobCard({ job, saved, onToggleSave, onOpen, delay }: {
  job: LiveJob; saved: boolean; onToggleSave: () => void; onOpen: () => void; delay: number;
}) {
  const remote = inferRemote(job);
  const type = inferType(job);
  const exp = inferExp(job);
  const remoteHue = remote === "Remote" ? "160" : remote === "Hybrid" ? "30" : "200";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div className="relative glass-strong rounded-3xl p-4 md:p-5 overflow-hidden h-full flex flex-col">
        <div className="absolute -top-20 -right-20 h-40 w-40 aurora-bg blur-3xl opacity-0 group-hover:opacity-30 transition rounded-full" />
        <div className="relative flex-1 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl glass flex items-center justify-center text-xl font-bold shrink-0">
              {logoFor(job.company)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-base md:text-lg line-clamp-2">{job.title}</h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3 w-3" /> <span className="truncate">{job.company}</span>
                  </div>
                </div>
                <button onClick={onToggleSave} className="glass rounded-lg p-1.5 hover:bg-white/10 transition shrink-0" aria-label={saved ? "Unsave" : "Save"}>
                  {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[10px] glass rounded-full px-2 py-0.5 flex items-center gap-1" style={{ color: `oklch(0.78 0.2 ${remoteHue})` }}>
              <Zap className="h-2.5 w-2.5" /> {remote}
            </span>
            <span className="text-[10px] glass rounded-full px-2 py-0.5 flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" /> <span className="truncate max-w-[140px]">{job.location || "—"}</span>
            </span>
            <span className="text-[10px] glass rounded-full px-2 py-0.5">{type}</span>
            <span className="text-[10px] glass rounded-full px-2 py-0.5">{exp}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground"><DollarSign className="h-3 w-3" /> {fmtSalary(job)}</div>
            <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3 w-3" /> {relTime(job.created)}</div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground line-clamp-3">{job.description}</p>

          <div className="mt-auto pt-4 flex gap-2">
            <button onClick={onOpen} className="flex-1 glass rounded-xl py-2 text-xs hover:bg-white/10 transition">
              View Details
            </button>
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 aurora-bg text-background font-medium rounded-xl py-2 text-xs glow-shadow hover:scale-[1.02] transition flex items-center justify-center gap-1">
              Apply <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function JobModal({ job, onClose, saved, onToggleSave }: {
  job: LiveJob | null; onClose: () => void; saved: boolean; onToggleSave: () => void;
}) {
  return (
    <AnimatePresence>
      {job && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-3 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-4 bottom-4 md:top-6 md:bottom-6 md:w-[640px] z-50 glass-strong rounded-3xl overflow-hidden flex flex-col"
          >
            <div className="absolute -top-20 -right-20 h-48 w-48 aurora-bg blur-3xl opacity-30 rounded-full pointer-events-none" />
            <div className="relative p-4 md:p-6 border-b border-white/10 flex items-start gap-3">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl glass flex items-center justify-center text-2xl md:text-3xl font-bold shrink-0">
                {logoFor(job.company)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-lg md:text-2xl font-bold">{job.title}</h2>
                <div className="text-xs md:text-sm text-muted-foreground flex flex-wrap items-center gap-1 mt-0.5">
                  <Building2 className="h-3 w-3" /> {job.company}
                  <span className="mx-1">·</span>
                  <MapPin className="h-3 w-3" /> {job.location || "—"}
                </div>
              </div>
              <button onClick={onClose} className="glass rounded-lg p-1.5 hover:bg-white/10 transition shrink-0" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] glass rounded-full px-2 py-0.5">{inferRemote(job)}</span>
                <span className="text-[10px] glass rounded-full px-2 py-0.5">{inferType(job)}</span>
                <span className="text-[10px] glass rounded-full px-2 py-0.5">{inferExp(job)}</span>
                {job.category && <span className="text-[10px] glass rounded-full px-2 py-0.5 text-primary">{job.category}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <Stat icon={DollarSign} label="Compensation" value={fmtSalary(job)} />
                <Stat icon={Clock} label="Posted" value={relTime(job.created)} />
              </div>

              <div>
                <h3 className="font-display font-bold text-sm mb-2">About the role</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            <div className="relative p-4 border-t border-white/10 flex gap-2">
              <button onClick={onToggleSave} className="glass rounded-xl px-4 py-2.5 text-xs hover:bg-white/10 transition flex items-center gap-1.5">
                {saved ? <><BookmarkCheck className="h-4 w-4 text-primary" /> Saved</> : <><Bookmark className="h-4 w-4" /> Save</>}
              </button>
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 aurora-bg text-background font-medium rounded-xl py-2.5 text-sm glow-shadow hover:scale-[1.01] transition flex items-center justify-center gap-2">
                Apply Now <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterGroup({ label, icon: Icon, children }: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full transition ${active ? "aurora-bg text-background font-medium glow-shadow" : "glass hover:bg-white/10"}`}
    >
      {children}
    </button>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="font-semibold text-sm mt-1">{value}</div>
    </div>
  );
}
