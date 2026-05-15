import { Link, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Floating pill navbar. Subtle scroll-driven contraction, glassmorphism,
 * elegant hover animations. Inspired by Linear, Vercel, Raycast.
 */
export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const padTop = useTransform(scrollY, [0, 120], [16, 10]);
  const width = useTransform(scrollY, [0, 120], ["min(1240px, calc(100% - 32px))", "min(1040px, calc(100% - 32px))"]);
  const bg = useTransform(scrollY, [0, 80], ["oklch(1 0 0 / 0.02)", "oklch(0.13 0.008 260 / 0.6)"]);
  const borderC = useTransform(scrollY, [0, 80], ["oklch(1 0 0 / 0.04)", "oklch(1 0 0 / 0.09)"]);
  const shadow = useTransform(scrollY, [0, 120], ["0 0 0 transparent", "0 20px 60px -20px oklch(0 0 0 / 0.55)"]);

  const links = [
    { href: "/#features", label: "Features" },
    { href: "/#careers", label: "Careers" },
    { href: "/#pricing", label: "Pricing" },
  ];

  return (
    <motion.div
      style={{ paddingTop: padTop }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
    >
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width,
          backgroundColor: bg,
          borderColor: borderC,
          boxShadow: shadow,
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
        }}
        className="pointer-events-auto rounded-full border px-3 md:px-5 h-14 flex items-center justify-between"
      >
        <Link to="/" className="flex items-center gap-2.5 group pl-2">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-white/10 bg-gradient-to-br from-white/[0.10] to-transparent overflow-hidden">
            <span className="absolute inset-0 aurora-bg opacity-30" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-foreground shadow-[0_0_12px_var(--glow)]" />
          </span>
          <span className="font-display text-[14px] font-semibold tracking-tight">
            CareerNova
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative px-3.5 py-1.5 rounded-full text-[13px] text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span className="absolute inset-0 rounded-full bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">{l.label}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {user ? (
            <>
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="text-[13px] px-3.5 py-1.5 rounded-full hover:bg-white/[0.06] transition"
              >
                Dashboard
              </button>
              <button
                onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
                className="p-1.5 rounded-full hover:bg-white/[0.06] transition text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[13px] px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="relative text-[13px] pl-4 pr-4 py-1.5 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition shadow-[0_4px_20px_-4px_oklch(1_0_0_/_0.3)] hover:shadow-[0_6px_24px_-4px_oklch(1_0_0_/_0.4)]"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </motion.header>
    </motion.div>
  );
}
