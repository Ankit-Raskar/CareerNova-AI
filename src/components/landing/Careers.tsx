import { motion } from "framer-motion";
import { Code2, Brain, ShieldCheck, Palette, Gamepad2, Cloud, BarChart3, Megaphone } from "lucide-react";

const careers = [
  { icon: Code2, title: "Web Development", tag: "Build the web", color: "oklch(0.72 0.21 295)" },
  { icon: Brain, title: "AI / Machine Learning", tag: "Teach machines", color: "oklch(0.78 0.18 200)" },
  { icon: ShieldCheck, title: "Cybersecurity", tag: "Defend systems", color: "oklch(0.7 0.22 330)" },
  { icon: Palette, title: "UI / UX Design", tag: "Craft experiences", color: "oklch(0.75 0.2 60)" },
  { icon: Gamepad2, title: "Game Development", tag: "Create worlds", color: "oklch(0.72 0.2 20)" },
  { icon: Cloud, title: "Cloud Computing", tag: "Scale infinitely", color: "oklch(0.78 0.15 240)" },
  { icon: BarChart3, title: "Data Science", tag: "Decode patterns", color: "oklch(0.75 0.18 160)" },
  { icon: Megaphone, title: "Digital Marketing", tag: "Grow brands", color: "oklch(0.74 0.2 360)" },
];

export function Careers() {
  return (
    <section id="careers" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block glass rounded-full px-3 py-1 text-xs text-muted-foreground mb-4">Career Universe</div>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            Pick your <span className="gradient-text">orbit</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Explore high-demand career tracks with curated roadmaps.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {careers.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group glass rounded-2xl p-6 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition" style={{ background: c.color }} />
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${c.color.slice(0, -1)} / 0.15)`, border: `1px solid ${c.color.slice(0, -1)} / 0.3)` }}>
                  <c.icon className="h-6 w-6" style={{ color: c.color }} />
                </div>
                <h3 className="font-display font-semibold">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{c.tag}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
