import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

const tiers = [
  {
    name: "Free",
    price: "$0",
    desc: "Get started, explore careers",
    features: ["AI career quiz", "5 mentor messages / day", "Basic roadmaps", "1 resume scan / month"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$9",
    desc: "For serious career hunters",
    features: ["Unlimited AI mentor", "Resume + ATS analyzer", "Mock interviews (HR + tech)", "Personal roadmaps", "Skill tracking"],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Premium",
    price: "$19",
    desc: "Land the dream role",
    features: ["Everything in Pro", "1:1 human mentor calls", "Internship priority feed", "Portfolio reviews", "LinkedIn rewrite"],
    cta: "Go Premium",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block glass rounded-full px-3 py-1 text-xs text-muted-foreground mb-4">Pricing</div>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            Simple, <span className="gradient-text">honest</span> pricing
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 ${t.featured ? "glass-strong elevated-shadow" : "glass"}`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 aurora-bg text-background text-xs font-medium px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div className="font-display font-semibold text-lg">{t.name}</div>
              <div className="mt-2 text-sm text-muted-foreground">{t.desc}</div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{t.price}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <Link
                to="/signup"
                className={`mt-6 block text-center w-full px-5 py-3 rounded-xl font-medium transition ${
                  t.featured ? "aurora-bg text-background glow-shadow hover:opacity-90" : "glass-strong hover:bg-white/10"
                }`}
              >
                {t.cta}
              </Link>
              <ul className="mt-8 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
