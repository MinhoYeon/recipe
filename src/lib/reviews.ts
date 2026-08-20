"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Review, TasteTag, UserDrinkRow, UserDrinkStatus } from "@/lib/types";

// 리뷰·사용자 기록은 Supabase에 저장한다 (카탈로그는 로컬 시드).
// 모든 함수는 Supabase 미설정 시 조용히 빈 값을 반환한다 — UI 쪽에서 안내를 담당.

export async function fetchReviews(brandDrinkIds: string[]): Promise<Review[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || brandDrinkIds.length === 0) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .in("brand_drink_id", brandDrinkIds)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as Review[];
}

export interface ReviewInput {
  brandDrinkId: string;
  rating: number;
  tasteTags: TasteTag[];
  comment: string;
}

/** 같은 메뉴에 대한 내 리뷰는 하나 — 있으면 덮어쓴다 */
export async function upsertReview(input: ReviewInput): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("로그인이 필요합니다.");
  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: userData.user.id,
      brand_drink_id: input.brandDrinkId,
      rating: input.rating,
      taste_tags: input.tasteTags,
      comment: input.comment,
    },
    { onConflict: "user_id,brand_drink_id" },
  );
  if (error) throw new Error(error.message);
}

export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw new Error(error.message);
}

export async function fetchMyReviews(): Promise<Review[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Review[];
}

export async function fetchMyUserDrinks(): Promise<UserDrinkRow[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];
  const { data, error } = await supabase
    .from("user_drinks")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as UserDrinkRow[];
}

/** status를 null로 주면 기록 삭제(토글 해제) */
export async function setUserDrinkStatus(
  brandDrinkId: string,
  status: UserDrinkStatus | null,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("로그인이 필요합니다.");

  if (status === null) {
    const { error } = await supabase
      .from("user_drinks")
      .delete()
      .eq("user_id", userData.user.id)
      .eq("brand_drink_id", brandDrinkId);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase.from("user_drinks").upsert(
    { user_id: userData.user.id, brand_drink_id: brandDrinkId, status },
    { onConflict: "user_id,brand_drink_id" },
  );
  if (error) throw new Error(error.message);
}
