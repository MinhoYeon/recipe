"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Supabase 환경변수가 설정된 경우에만 클라이언트를 반환한다. 미설정 시 null. */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
