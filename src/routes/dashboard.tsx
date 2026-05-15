import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Brain,
  Sparkles,
  LogOut,
  Compass,
  Map,
  Menu,
  X,
  Briefcase,
  MessageSquare,
  FileText,
  BookOpen,
} from "lucide-react";
import { AuroraBackground } from "@/components/Aurora";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({ component: DashboardLayout });

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/mentor", label: "AI Mentor", icon: MessageSquare },
  { to: "/dashboard/careers", label: "Career Library", icon: Compass },
  { to: "/dashboard/roadmaps", label: "Roadmaps", icon: Map },
  { to: "/dashboard/jobs", label: "Jobs & Internships", icon: Briefcase },
  { to: "/dashboard/resume", label: "Resume Analyzer", icon: FileText },
  { to: "/dashboard/resources", label: "Resources", icon: BookOpen },
  { to: "/dashboard/quiz", label: "AI Career Quiz", icon: Brain },
];

function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const SidebarBody = () => (
    <div className="glass-strong rounded-3xl p-5 flex-1 flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="aurora-bg rounded-lg p-1.5">
          <Sparkles className="h-4 w-4 text-background" />
        </div>
        <span className="font-display font-bold">
          CareerNova
        </span>
      </Link>

      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-2">
        Workspace
      </div>
      <nav className="space-y-1 flex-1">
        {navItems.map((it) => {
          const active = it.exact ? path === it.to : path.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition group"
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 aurora-bg rounded-xl glow-shadow"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative flex items-center gap-3 ${
                  active ? "text-background font-medium" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </span>
            </Link>
          );
        })}

        {/* Roadmap quick-link if on a roadmap page */}
        {path.startsWith("/dashboard/roadmap") && (
          <div className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm aurora-bg text-background font-medium glow-shadow">
            <Map className="h-4 w-4" />
            Active Roadmap
          </div>
        )}
      </nav>

      <div className="pt-4 border-t border-white/10">
        <div className="text-xs text-muted-foreground mb-1">Signed in as</div>
        <div className="text-sm truncate">{user.email}</div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
          className="mt-3 w-full flex items-center justify-center gap-2 glass rounded-xl py-2 text-xs hover:bg-white/10 transition"
        >
          <LogOut className="h-3 w-3" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen flex">
      <AuroraBackground />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col p-4 sticky top-0 h-screen">
        <SidebarBody />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 px-4 py-3 flex items-center justify-between glass-strong border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="aurora-bg rounded-lg p-1.5">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="font-display font-bold text-sm">
            CareerNova
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="glass rounded-lg p-2"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-72 p-3"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 z-10 glass rounded-lg p-1.5"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
                <SidebarBody />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
