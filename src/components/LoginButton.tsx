"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabaseConfigured, useSupabaseUser } from "@/lib/useSupabaseUser";

export default function LoginButton() {
  const { user } = useSupabaseUser();
  const email = user?.email ?? null;

  async function signIn() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      alert("Supabase 프로젝트 연동 후 사용할 수 있습니다. (README 참고)");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function signOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
  }

  if (supabaseConfigured && email) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="hidden text-zinc-500 sm:inline">{email}</span>
        <button
          onClick={signOut}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      로그인
    </button>
  );
}
