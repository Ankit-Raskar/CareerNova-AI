import { motion } from "framer-motion";

const items = [
  { quote: "I went from confused fresher to landing my first frontend role in 4 months. The roadmap was gold.", name: "Aarav Mehta", role: "Frontend Developer @ Razorpay" },
  { quote: "The AI mock interviews destroyed my anxiety. I aced 3 internship rounds back to back.", name: "Sara Kim", role: "ML Intern @ Cohere" },
  { quote: "Finally a career app that doesn't feel like a course catalog. It feels like a friend who knows tech.", name: "Diego Alvarez", role: "CS Senior, NYU" },
];

export function Testimonials() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl md:text-5xl font-bold text-center mb-16"
        >
          Loved by <span className="gradient-text">future builders</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass-strong rounded-3xl p-7"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="text-accent">★</div>
                ))}
              </div>
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
