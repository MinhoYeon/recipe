"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** 현재 로그인 사용자. loading은 초기 세션 확인이 끝나면 false가 된다. */
export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase는 INITIAL_SESSION 이벤트를 즉시 발화하므로 마이크로태스크로 미룬다
      queueMicrotask(() => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading, configured: supabaseConfigured };
}
