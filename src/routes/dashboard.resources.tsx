import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Loader2,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { resources, categories, levels, type Resource } from "@/data/resources";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/resources")({ component: ResourcesPage });

type Tab = "Curated" | "Books" | "Courses" | "Interview Prep" | "Saved";
const tabs: Tab[] = ["Curated", "Books", "Courses", "Interview Prep", "Saved"];

interface OLBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

function ResourcesPage() {
  const [tab, setTab] = useState<Tab>("Curated");

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* Editorial header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="pt-4 md:pt-8"
      >
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-4">
          <Sparkles className="h-3 w-3" style={{ color: "#F6B35B" }} />
          Learning Hub
        </div>
        <h1 className="serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
          Learning Hub<span style={{ color: "#F6B35B" }}>.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          Curated books, free resources, and career learning materials —
          all in one place.
        </p>
      </motion.header>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="flex flex-wrap gap-1.5 p-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur w-fit max-w-full overflow-x-auto"
      >
        {tabs.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-4 md:px-5 py-2 text-[13px] rounded-full transition-colors whitespace-nowrap"
            >
              {active && (
                <motion.span
                  layoutId="resources-tab"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(246,179,91,0.14)", border: "1px solid rgba(246,179,91,0.28)" }}
                />
              )}
              <span className={`relative ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t}
              </span>
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          {tab === "Books" ? (
            <BooksPanel />
          ) : tab === "Saved" ? (
            <SavedPanel />
          ) : (
            <CuratedPanel
              filterCategory={
                tab === "Interview Prep" ? "Interview Prep" : tab === "Courses" ? "__courses__" : null
              }
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------- Curated Panel ----------------------------- */

function CuratedPanel({ filterCategory }: { filterCategory: string | null }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(
    filterCategory && filterCategory !== "__courses__" ? filterCategory : "All",
  );
  const [level, setLevel] = useState<string>("All");
  const { saved, toggle, ready } = useSaved();

  useEffect(() => {
    if (filterCategory && filterCategory !== "__courses__") setCat(filterCategory);
    else setCat("All");
  }, [filterCategory]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (filterCategory === "__courses__" && !["Frontend","Backend","Full Stack","AI/ML","DevOps"].includes(r.category)) return false;
      if (cat !== "All" && r.category !== cat) return false;
      if (level !== "All" && r.level !== level) return false;
      if (q) {
        const s = `${r.title} ${r.provider} ${r.description} ${(r.tags||[]).join(" ")}`.toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [q, cat, level, filterCategory]);

  return (
    <div className="space-y-6">
      {/* search + filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search resources, providers, topics…"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-white/20 transition"
          />
        </div>

        {filterCategory !== "Interview Prep" && (
          <FilterRow label="Category">
            <Pill active={cat === "All"} onClick={() => setCat("All")}>All</Pill>
            {categories.map((c) => (
              <Pill key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Pill>
            ))}
          </FilterRow>
        )}
        <FilterRow label="Level">
          <Pill active={level === "All"} onClick={() => setLevel("All")}>All</Pill>
          {levels.map((l) => (
            <Pill key={l} active={level === l} onClick={() => setLevel(l)}>{l}</Pill>
          ))}
        </FilterRow>
      </div>

      <div className="text-xs text-muted-foreground">
        {filtered.length} resource{filtered.length === 1 ? "" : "s"}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((r, i) => (
          <ResourceCard
            key={r.id}
            r={r}
            saved={saved.has(r.id)}
            onToggle={() => toggle(r.id, { title: r.title, type: "curated" })}
            ready={ready}
            index={i}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground text-sm">
          No matching resources. Try another search.
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground pt-2 shrink-0 w-20">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs rounded-full border transition-all"
      style={
        active
          ? { background: "rgba(246,179,91,0.14)", borderColor: "rgba(246,179,91,0.32)", color: "var(--foreground)" }
          : { background: "transparent", borderColor: "rgba(255,255,255,0.06)", color: "var(--muted-foreground)" }
      }
    >
      {children}
    </button>
  );
}

function LevelBadge({ level }: { level: Resource["level"] }) {
  const styles: Record<Resource["level"], { bg: string; border: string; color: string; dot: string }> = {
    Beginner:      { bg: "rgba(74,222,128,0.10)", border: "rgba(74,222,128,0.30)", color: "#86efac", dot: "#4ade80" },
    Intermediate:  { bg: "rgba(246,179,91,0.10)", border: "rgba(246,179,91,0.30)", color: "#F6B35B", dot: "#F6B35B" },
    Advanced:      { bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.30)", color: "#fca5a5", dot: "#f87171" },
    "All Levels":  { bg: "rgba(147,197,253,0.10)", border: "rgba(147,197,253,0.30)", color: "#93c5fd", dot: "#60a5fa" },
  };
  const s = styles[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {level}
    </span>
  );
}

function ResourceCard({
  r,
  saved,
  onToggle,
  ready,
  index,
}: {
  r: Resource;
  saved: boolean;
  onToggle: () => void;
  ready: boolean;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 flex flex-col gap-4 transition-all hover:border-white/[0.14] hover:bg-white/[0.03]"
      style={{ transition: "border-color .4s, background .4s, transform .4s" }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: "radial-gradient(600px circle at var(--x,50%) 0%, rgba(246,179,91,0.08), transparent 60%)" }}
      />
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground truncate">
            {r.provider}
          </span>
          <LevelBadge level={r.level} />
        </div>
        <button
          onClick={onToggle}
          disabled={!ready}
          aria-label={saved ? "Remove bookmark" : "Save"}
          className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition disabled:opacity-40 shrink-0"
        >
          {saved ? <BookmarkCheck className="h-4 w-4" style={{ color: "#F6B35B" }} /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      <h3 className="serif text-2xl leading-tight tracking-tight relative">{r.title}</h3>
      <p className="relative text-sm text-muted-foreground leading-relaxed line-clamp-3">{r.description}</p>

      <div className="relative flex flex-wrap gap-1.5 mt-auto">
        <span
          className="text-[10px] px-2 py-1 rounded-full border font-medium"
          style={{ background: "rgba(246,179,91,0.08)", borderColor: "rgba(246,179,91,0.22)", color: "#F6B35B" }}
        >
          {r.category}
        </span>
        <span className="text-[10px] px-2 py-1 rounded-full border border-white/[0.08] text-muted-foreground">{r.duration}</span>
        {r.tags?.slice(0, 2).map((t) => (
          <span key={t} className="text-[10px] px-2 py-1 rounded-full border border-white/[0.08] text-muted-foreground">{t}</span>
        ))}
      </div>

      <a
        href={r.link}
        target="_blank"
        rel="noopener noreferrer"
        className="relative inline-flex items-center gap-1.5 text-sm pt-1 group/link"
        style={{ color: "#F6B35B" }}
      >
        Open resource
        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
      </a>
    </motion.article>
  );
}

/* ------------------------------- Books Panel ----------------------------- */

const BOOK_TOPICS = ["AI", "Web Development", "UI UX", "DSA", "Python", "Machine Learning"];

function BooksPanel() {
  const [q, setQ] = useState("AI");
  const [input, setInput] = useState("AI");
  const [books, setBooks] = useState<OLBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saved, toggle, ready } = useSaved();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/public/books?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const j = (await res.json()) as { docs: OLBook[]; error?: string };
        if (cancelled) return;
        setBooks(j.docs || []);
        if (j.error && (!j.docs || j.docs.length === 0)) setError("Books temporarily unavailable. Try another topic.");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load books");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => { e.preventDefault(); setQ(input.trim() || "AI"); }}
        className="relative"
      >
        <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search free books…"
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-white/20 transition"
        />
      </form>

      <div className="flex flex-wrap gap-1.5">
        {BOOK_TOPICS.map((t) => (
          <Pill key={t} active={q === t} onClick={() => { setInput(t); setQ(t); }}>{t}</Pill>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Fetching books from Open Library…
        </div>
      )}

      {error && !loading && (
        <div className="text-sm text-muted-foreground py-10 text-center">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map((b, i) => {
            const sid = `ol:${b.key}`;
            return (
              <motion.article
                key={b.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden flex flex-col transition-all hover:border-white/[0.14] hover:bg-white/[0.03]"
              >
                <div className="aspect-[2/3] bg-white/[0.03] relative overflow-hidden">
                  {b.cover_i ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`}
                      alt={b.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                    </div>
                  )}
                  <button
                    onClick={() => toggle(sid, { title: b.title, type: "book", key: b.key })}
                    disabled={!ready}
                    aria-label="Save book"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/70 transition disabled:opacity-40"
                  >
                    {saved.has(sid)
                      ? <BookmarkCheck className="h-3.5 w-3.5" style={{ color: "#F6B35B" }} />
                      : <Bookmark className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <h3 className="serif text-lg leading-tight tracking-tight line-clamp-2">{b.title}</h3>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {b.author_name?.[0] || "Unknown author"}
                    {b.first_publish_year ? ` · ${b.first_publish_year}` : ""}
                  </div>
                  <a
                    href={`https://openlibrary.org${b.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 text-xs pt-2"
                    style={{ color: "#F6B35B" }}
                  >
                    Open Library <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div className="text-center py-20 text-muted-foreground text-sm">No books found.</div>
      )}
    </div>
  );
}

/* ------------------------------- Saved hook ------------------------------ */

function useSaved() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) { setSaved(new Set()); setReady(true); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("saved_resources")
        .select("resource_id")
        .eq("user_id", user.id);
      if (cancelled) return;
      if (!error && data) setSaved(new Set((data as { resource_id: string }[]).map((d) => d.resource_id)));
      setReady(true);
    }
    setReady(false);
    load();
    return () => { cancelled = true; };
  }, [user]);

  async function toggle(resource_id: string, meta: Record<string, unknown>) {
    if (!user) { toast.error("Sign in to save resources"); return; }
    const isSaved = saved.has(resource_id);
    const next = new Set(saved);
    if (isSaved) {
      next.delete(resource_id);
      setSaved(next);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("saved_resources")
        .delete()
        .eq("user_id", user.id)
        .eq("resource_id", resource_id);
      if (error) {
        setSaved(new Set([...next, resource_id]));
        toast.error(error.message || "Could not remove bookmark");
      }
    } else {
      next.add(resource_id);
      setSaved(next);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("saved_resources").insert({
        user_id: user.id,
        resource_id,
        resource_type: (meta.type as string) || "curated",
        title: (meta.title as string) || null,
        meta,
      });
      if (error) {
        const n2 = new Set(next); n2.delete(resource_id); setSaved(n2);
        toast.error(error.message || "Could not save bookmark");
      } else {
        toast.success("Saved to bookmarks");
      }
    }
  }

  return { saved, toggle, ready };
}

/* ------------------------------- Saved Panel ----------------------------- */

interface SavedResourceRow {
  resource_id: string;
  resource_type: string | null;
  title: string | null;
  meta: Record<string, unknown> | null;
}
interface SavedJobRow {
  job_id: string;
  title: string | null;
  company: string | null;
  apply_url: string | null;
}

function SavedPanel() {
  const { user } = useAuth();
  const [resourcesSaved, setResourcesSaved] = useState<SavedResourceRow[]>([]);
  const [jobsSaved, setJobsSaved] = useState<SavedJobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const [r, j] = await Promise.all([
        sb.from("saved_resources").select("resource_id, resource_type, title, meta").eq("user_id", user.id),
        sb.from("saved_jobs").select("job_id, title, company, apply_url").eq("user_id", user.id),
      ]);
      if (cancelled) return;
      setResourcesSaved((r.data as SavedResourceRow[]) ?? []);
      setJobsSaved((j.data as SavedJobRow[]) ?? []);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  async function removeResource(id: string) {
    if (!user) return;
    setResourcesSaved((prev) => prev.filter((r) => r.resource_id !== id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("saved_resources").delete().eq("user_id", user.id).eq("resource_id", id);
    toast("Bookmark removed");
  }
  async function removeJob(id: string) {
    if (!user) return;
    setJobsSaved((prev) => prev.filter((j) => j.job_id !== id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", id);
    toast("Saved job removed");
  }

  if (!user) {
    return <div className="text-center py-20 text-muted-foreground text-sm">Sign in to view your bookmarks.</div>;
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your bookmarks…
      </div>
    );
  }

  const empty = resourcesSaved.length === 0 && jobsSaved.length === 0;
  if (empty) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm">
        No bookmarks yet. Save resources and jobs to see them here.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {resourcesSaved.length > 0 && (
        <section className="space-y-4">
          <h2 className="serif text-2xl tracking-tight">Saved Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {resourcesSaved.map((r) => {
              const meta = (r.meta || {}) as Record<string, unknown>;
              const link = (meta.link as string) ||
                (r.resource_type === "book" && meta.key
                  ? `https://openlibrary.org${meta.key as string}`
                  : "#");
              return (
                <article key={r.resource_id} className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col gap-3 hover:border-white/[0.14] transition">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {r.resource_type || "resource"}
                  </div>
                  <h3 className="serif text-lg leading-tight tracking-tight line-clamp-2">{r.title || "Untitled"}</h3>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#F6B35B" }}>
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                    <button onClick={() => removeResource(r.resource_id)} className="text-xs text-muted-foreground hover:text-foreground">
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {jobsSaved.length > 0 && (
        <section className="space-y-4">
          <h2 className="serif text-2xl tracking-tight">Saved Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobsSaved.map((j) => (
              <article key={j.job_id} className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col gap-3 hover:border-white/[0.14] transition">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">job</div>
                <h3 className="serif text-lg leading-tight tracking-tight line-clamp-2">{j.title || "Untitled"}</h3>
                <div className="text-xs text-muted-foreground line-clamp-1">{j.company || ""}</div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  {j.apply_url ? (
                    <a href={j.apply_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#F6B35B" }}>
                      Apply <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : <span />}
                  <button onClick={() => removeJob(j.job_id)} className="text-xs text-muted-foreground hover:text-foreground">
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
