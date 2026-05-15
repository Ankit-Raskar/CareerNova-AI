import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { AuroraBackground } from "@/components/Aurora";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name: name },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    // Email confirmation is disabled — session is returned immediately.
    if (!data.session) {
      // Fallback: sign in if no session (shouldn't happen with auto-confirm).
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setLoading(false);
        return toast.error(signInError.message);
      }
    }
    toast.success("Welcome to CareerNova!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <AuroraBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass-strong rounded-3xl p-8 elevated-shadow"
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="aurora-bg rounded-lg p-1.5">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="font-display font-bold">
            CareerNova
          </span>
        </Link>
        <h1 className="font-display text-3xl font-bold">Start your journey</h1>
        <p className="text-sm text-muted-foreground mt-1">Free forever. No card required.</p>

        <form onSubmit={handleEmail} className="space-y-3 mt-6">
          <input
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full glass rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full glass rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full glass rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full aurora-bg text-background font-medium py-2.5 rounded-xl glow-shadow hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Creating account..." : "Create account & continue"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
