import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

let cachedSession: Session | null = null;
let authReady = false;
const listeners = new Set<() => void>();

function notify() { listeners.forEach((l) => l()); }

function setAuthState(session: Session | null) {
  cachedSession = session;
  authReady = true;
  notify();
}

if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data }) => {
    setAuthState(data.session);
  });
  supabase.auth.onAuthStateChange((_e, session) => {
    setAuthState(session);
  });
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [loading, setLoading] = useState(!authReady);
  useEffect(() => {
    const update = () => { setSession(cachedSession); setLoading(!authReady); };
    listeners.add(update);
    update();
    supabase.auth.getSession().then(({ data }) => {
      setAuthState(data.session);
    });
    return () => { listeners.delete(update); };
  }, []);
  return { session, user: session?.user as User | undefined, loading };
}
