import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

/**
 * Cinematic ambient lighting. Layered radial gradients, subtle parallax,
 * faint grid scaffolding, and a global film grain overlay for depth.
 */
export function AuroraBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { stiffness: 30, damping: 22 });
  const y = useSpring(mouseY, { stiffness: 30, damping: 22 });
  const tx1 = useTransform(x, (v) => `${v * 28}px`);
  const ty1 = useTransform(y, (v) => `${v * 28}px`);
  const tx2 = useTransform(x, (v) => `${v * -22}px`);
  const ty2 = useTransform(y, (v) => `${v * -22}px`);
  const tx3 = useTransform(x, (v) => `${v * 14}px`);
  const ty3 = useTransform(y, (v) => `${v * 14}px`);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
        {/* Soft scaffolding grid */}
        <div className="absolute inset-0 grid-bg opacity-50" />

        {/* Primary warm wash — top-left */}
        <motion.div
          style={{ x: tx1, y: ty1 }}
          className="absolute -top-72 -left-44 h-[760px] w-[760px] rounded-full blur-[130px] opacity-[0.22] animate-drift-slow"
        >
          <div
            className="h-full w-full rounded-full"
            style={{ background: "radial-gradient(circle, oklch(0.84 0.13 78 / 0.95), transparent 60%)" }}
          />
        </motion.div>

        {/* Cobalt — bottom-right */}
        <motion.div
          style={{ x: tx2, y: ty2 }}
          className="absolute top-[55%] -right-64 h-[680px] w-[680px] rounded-full blur-[150px] opacity-[0.16] animate-drift-reverse"
        >
          <div
            className="h-full w-full rounded-full"
            style={{ background: "radial-gradient(circle, oklch(0.66 0.16 252 / 0.95), transparent 60%)" }}
          />
        </motion.div>

        {/* Mid-canvas violet whisper — adds depth */}
        <motion.div
          style={{ x: tx3, y: ty3 }}
          className="absolute top-[30%] left-[35%] h-[520px] w-[520px] rounded-full blur-[160px] opacity-[0.10] animate-pulse-glow"
        >
          <div
            className="h-full w-full rounded-full"
            style={{ background: "radial-gradient(circle, oklch(0.62 0.13 305 / 0.9), transparent 65%)" }}
          />
        </motion.div>

        {/* Top vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top, transparent 30%, oklch(0.10 0.006 260 / 0.85) 95%)",
          }}
        />
      </div>

      {/* Global film grain — sits above background, below content */}
      <div className="grain-overlay" aria-hidden="true" />
    </>
  );
}

/** Slow, sparse particle drift — restrained. */
export function FloatingParticles({ count = 14 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const size = Math.random() * 2 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 6;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              background: "oklch(0.96 0.006 80)",
              boxShadow: `0 0 ${size * 6}px oklch(0.84 0.13 78 / 0.6)`,
            }}
            animate={{ y: [0, -24, 0], opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}
