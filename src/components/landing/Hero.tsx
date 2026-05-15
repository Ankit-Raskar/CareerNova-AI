import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingParticles } from "@/components/Aurora";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <FloatingParticles count={18} />

      {/* Top hairline meta — editorial chrome */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-10 pt-32 md:pt-36">
        <div className="grid grid-cols-12 gap-y-12 md:gap-x-10">

          {/* LEFT — editorial hero */}
          <div className="col-span-12 lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
              className="eyebrow mb-10"
            >
              Issue 001 — A career platform, reimagined
            </motion.div>

            <h1 className="font-serif font-normal text-[clamp(3.25rem,9vw,8.25rem)] leading-[0.92] tracking-[-0.03em] text-balance">
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease }}
                className="block"
              >
                Find the work
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.08, ease }}
                className="block"
              >
                you were
                <span className="italic warm-text"> meant </span>
                to do.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease }}
              className="mt-10 max-w-[44ch] text-lg md:text-xl leading-relaxed text-muted-foreground text-pretty"
            >
              CareerNova is a quiet, AI-native operating system for your career —
              guidance from a personal mentor, roadmaps tailored to who you are,
              and real opportunities the moment you're ready for them.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease }}
              className="mt-12 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 bg-foreground text-background font-medium pl-5 pr-4 py-3 rounded-full text-sm hover:bg-foreground/90 transition"
              >
                Begin your map
                <span className="grid place-items-center h-6 w-6 rounded-full bg-background/15">
                  <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm text-muted-foreground hover:text-foreground transition"
              >
                See what's inside
                <span className="text-muted-foreground/60">→</span>
              </a>
            </motion.div>
          </div>

          {/* RIGHT — floating mentor card, asymmetric */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45, ease }}
            className="col-span-12 lg:col-span-4 lg:pt-20"
          >
            <MentorCard />
          </motion.div>
        </div>

        {/* Bottom meta strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-24 md:mt-32 hairline pt-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-[12px] font-mono uppercase tracking-[0.18em] text-muted-foreground"
        >
          <div>
            <div className="text-foreground/60">— Mentor</div>
            <div className="mt-1.5 text-foreground/90 normal-case font-sans tracking-normal text-sm">Always-on, never tired</div>
          </div>
          <div>
            <div className="text-foreground/60">— Roadmap</div>
            <div className="mt-1.5 text-foreground/90 normal-case font-sans tracking-normal text-sm">Drawn for one, not many</div>
          </div>
          <div>
            <div className="text-foreground/60">— Jobs</div>
            <div className="mt-1.5 text-foreground/90 normal-case font-sans tracking-normal text-sm">Real listings, live feed</div>
          </div>
          <div>
            <div className="text-foreground/60">— Resume</div>
            <div className="mt-1.5 text-foreground/90 normal-case font-sans tracking-normal text-sm">ATS-grade analysis</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MentorCard() {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="relative rounded-3xl glass-strong p-5 elevated-shadow overflow-hidden lift animate-float"
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-60"
        style={{
          background:
            "linear-gradient(180deg, oklch(1 0 0 / 0.10), transparent 30%)",
        }}
      />
      <div className="pointer-events-none absolute -inset-10 -z-10 blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle at 30% 20%, oklch(0.84 0.13 78 / 0.25), transparent 60%)" }}
      />

      <div className="relative flex items-center gap-2.5 pb-4 hairline-b">
        <span className="grid place-items-center h-6 w-6 rounded-full aurora-bg shadow-[0_0_16px_var(--glow)]">
          <Sparkles className="h-3 w-3 text-background" />
        </span>
        <div className="text-[13px] font-medium">Nova</div>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_oklch(0.78_0.16_158)] animate-pulse" />
          online
        </div>
      </div>

      <div className="relative space-y-3 pt-4 min-h-[200px]">
        <Bubble side="ai" delay={0.2}>
          What kind of work do you lose track of time doing?
        </Bubble>
        <Bubble side="user" delay={1.4}>
          Building things people actually use.
        </Bubble>
        <TypingBubble delay={2.6}>
          Then let's draft a route through product engineering — three months, weekly checkpoints. Ready?
        </TypingBubble>
      </div>

      <div className="relative mt-5 flex items-center gap-2 pt-4 hairline">
        <div className="flex-1 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center px-4 text-[13px] text-muted-foreground">
          <span className="opacity-60">Ask Nova anything…</span>
        </div>
        <button className="h-9 w-9 rounded-full bg-foreground text-background grid place-items-center hover:bg-foreground/90 transition shadow-[0_4px_16px_-4px_oklch(1_0_0_/_0.3)]">
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function TypingBubble({ children, delay }: { children: string; delay: number }) {
  const full = children;
  const [shown, setShown] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(full.slice(0, i));
      if (i >= full.length) { clearInterval(id); setDone(true); }
    }, 22);
    return () => clearInterval(id);
  }, [started, full]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: started ? 1 : 0, y: started ? 0 : 8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-start"
    >
      <div className={`max-w-[85%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] leading-snug bg-white/[0.04] text-foreground border border-white/[0.05] ${!done ? "typing-cursor" : ""}`}>
        {started ? shown : "\u00A0"}
      </div>
    </motion.div>
  );
}

function Bubble({
  side,
  delay,
  children,
}: {
  side: "ai" | "user";
  delay: number;
  children: React.ReactNode;
}) {
  const isUser = side === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
          isUser
            ? "bg-foreground text-background rounded-br-md"
            : "bg-white/[0.04] text-foreground rounded-bl-md border border-white/[0.05]"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
