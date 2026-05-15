import { Sparkles, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative pt-20 pb-10 px-6 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="glass-strong rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[800px] aurora-bg blur-3xl opacity-20 rounded-full" />
          <div className="relative grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="aurora-bg rounded-lg p-1.5">
                  <Sparkles className="h-4 w-4 text-background" />
                </div>
                <span className="font-display font-bold text-lg">CareerNova</span>
              </div>
              <p className="text-sm text-muted-foreground mt-4 max-w-sm">
                The AI-native career platform for the next generation of builders, makers and dreamers.
              </p>
              <div className="mt-6 flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 max-w-xs glass rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="aurora-bg text-background text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition">
                  Subscribe
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#careers" className="hover:text-foreground transition">Careers</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="relative mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">© 2026 CareerNova. All rights reserved.</div>
            <div className="flex gap-3 text-muted-foreground">
              <a href="#" aria-label="Twitter" className="hover:text-foreground transition"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="GitHub" className="hover:text-foreground transition"><Github className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-foreground transition"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
