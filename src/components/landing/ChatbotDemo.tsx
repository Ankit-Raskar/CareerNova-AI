import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";

const messages = [
  { role: "user", content: "How do I become a frontend developer?" },
  {
    role: "ai",
    content: `Great choice! Here's your fast-track plan:\n\n**Core skills**\n• HTML, CSS, JavaScript fundamentals\n• React + TypeScript\n• Tailwind CSS, Git, REST APIs\n\n**Roadmap (4–6 months)**\n1. Master JavaScript ES6+\n2. Build 3 React projects (todo, dashboard, clone)\n3. Learn TypeScript + state management\n4. Ship a portfolio site\n\n**Salary range**: ₹6L–18L / yr (India), $70K–130K (US)`,
  },
];

export function ChatbotDemo() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block glass rounded-full px-3 py-1 text-xs text-muted-foreground mb-4">AI Mentor</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Your <span className="gradient-text">always-on</span> career mentor
          </h2>
          <p className="text-muted-foreground mt-5 leading-relaxed">
            Ask anything — from "how do I switch from non-tech to tech" to "what's the best startup to join". Get tailored, specific, no-fluff guidance instantly.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>• Personalized to your background</li>
            <li>• Roadmaps with project ideas</li>
            <li>• Real salary benchmarks</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-strong rounded-3xl p-5 elevated-shadow"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-muted-foreground">CareerNova Mentor</span>
          </div>

          <div className="space-y-4 pt-4">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.6 + 0.2 }}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
              >
                {m.role === "ai" && (
                  <div className="h-8 w-8 rounded-xl aurora-bg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-background" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                    m.role === "user" ? "aurora-bg text-background" : "glass"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-xl glass flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.6 }}
              className="flex gap-1.5 px-3 pt-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0.3s" }} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
