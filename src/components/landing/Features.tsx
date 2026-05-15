import { motion } from "framer-motion";
import {
  Compass,
  FileSearch,
  Mic,
  Map as MapIcon,
  Briefcase,
  MessageCircle,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    icon: Compass,
    eyebrow: "001 — Direction",
    title: "A mentor who knows you.",
    desc: "Nova reads your story, not your résumé. Conversations that nudge you toward work that fits — not work that pays best on paper.",
    span: "lg:col-span-7",
  },
  {
    icon: MapIcon,
    eyebrow: "002 — Roadmap",
    title: "One map. Yours.",
    desc: "Every roadmap is drawn from your strengths, gaps, and time. No copy-paste curriculums.",
    span: "lg:col-span-5",
  },
  {
    icon: FileSearch,
    eyebrow: "003 — Résumé",
    title: "ATS, decoded.",
    desc: "Upload once. Get the score, the missing keywords, and a rewrite that still sounds like you.",
    span: "lg:col-span-5",
  },
  {
    icon: Briefcase,
    eyebrow: "004 — Opportunities",
    title: "A real jobs feed.",
    desc: "Live listings — internships, remote, full-time. Filtered by where you are and where you're heading.",
    span: "lg:col-span-7",
  },
  {
    icon: Mic,
    eyebrow: "005 — Interview",
    title: "Rehearse with someone tough.",
    desc: "HR and technical drills with feedback that's honest, not nice.",
    span: "lg:col-span-6",
  },
  {
    icon: MessageCircle,
    eyebrow: "006 — Always on",
    title: "3am questions, welcome.",
    desc: "Nova doesn't keep office hours. Neither does ambition.",
    span: "lg:col-span-6",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 md:py-40 px-6 md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-12 gap-y-10 md:gap-x-10 mb-20">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow mb-6">— What's inside</div>
            <h2 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-[-0.02em] text-balance">
              Six tools.<br />
              <span className="italic text-muted-foreground">One quiet system.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9 self-end max-w-sm text-muted-foreground text-[15px] leading-relaxed">
            Not a dashboard of dashboards. CareerNova is a deliberately small
            set of things, made carefully, that work together.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.06, ease }}
              whileHover={{ y: -3 }}
              className={`group relative ${f.span} surface rounded-2xl p-7 md:p-8 overflow-hidden`}
            >
              <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full opacity-0 group-hover:opacity-100 transition duration-700 blur-3xl"
                style={{ background: "radial-gradient(circle, oklch(0.84 0.13 78 / 0.25), transparent 60%)" }}
              />

              <div className="relative flex items-start gap-4">
                <div className="grid place-items-center h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <f.icon className="h-4 w-4 text-foreground/80" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground/80">
                    {f.eyebrow}
                  </div>
                  <h3 className="mt-3 font-serif text-2xl md:text-[28px] leading-[1.1] tracking-[-0.01em]">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground max-w-prose">
                    {f.desc}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
