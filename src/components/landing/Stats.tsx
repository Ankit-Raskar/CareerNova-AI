import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    to >= 1000 ? Math.round(v).toLocaleString() : Math.round(v).toString()
  );

  useEffect(() => {
    if (inView) {
      const c = animate(count, to, { duration: 2.2, ease: [0.22, 1, 0.36, 1] });
      return c.stop;
    }
  }, [inView, to, count]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{rounded}</motion.span>
      <span className="warm-text">{suffix}</span>
    </span>
  );
}

const stats = [
  { value: 10000, suffix: "+", label: "Students guided", note: "Across 38 countries" },
  { value: 500, suffix: "+", label: "Career paths", note: "Mapped by Nova" },
  { value: 95, suffix: "%", label: "Found clarity", note: "Within four sessions" },
  { value: 24, suffix: "/7", label: "Always present", note: "A mentor that never sleeps" },
];

export function Stats() {
  return (
    <section className="relative py-32 md:py-40 px-6 md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-12 gap-y-14 md:gap-x-10 items-end">
          <div className="col-span-12 md:col-span-5">
            <div className="eyebrow mb-6">— By the numbers</div>
            <h2 className="font-serif text-5xl md:text-6xl leading-[0.95] tracking-[-0.02em] text-balance">
              Quiet on the surface. <span className="italic text-muted-foreground">Loud where it counts.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 max-w-md text-muted-foreground text-[15px] leading-relaxed">
            We don't measure ourselves in features shipped. We measure in the
            quiet wins — a roadmap chosen, an offer accepted, a Sunday spent
            without anxiety about Monday.
          </div>
        </div>

        <div className="mt-20 hairline pt-12 grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`px-2 md:px-6 py-6 ${i > 0 ? "md:border-l md:border-white/[0.06]" : ""} ${i === 2 ? "border-t md:border-t-0 border-white/[0.06]" : ""} ${i === 3 ? "border-t md:border-t-0 border-white/[0.06]" : ""}`}
            >
              <div className="font-serif text-5xl md:text-7xl leading-none tracking-[-0.02em]">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-4 text-sm font-medium">{s.label}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{s.note}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
