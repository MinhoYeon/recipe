"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StarRating from "@/components/StarRating";
import {
  deleteReview,
  fetchMyUserDrinks,
  fetchReviews,
  setUserDrinkStatus,
  upsertReview,
} from "@/lib/reviews";
import type { Review, TasteTag, UserDrinkStatus } from "@/lib/types";
import { TASTE_TAG_LABELS, USER_DRINK_STATUS_LABELS } from "@/lib/types";
import { useSupabaseUser } from "@/lib/useSupabaseUser";

export interface ReviewMenu {
  id: string;
  menuName: string;
  brandName: string;
  brandColor: string;
}

interface ReviewSectionProps {
  menus: ReviewMenu[];
}

const ALL_TAGS = Object.keys(TASTE_TAG_LABELS) as TasteTag[];

export default function ReviewSection({ menus }: ReviewSectionProps) {
  const { user, configured } = useSupabaseUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myStatuses, setMyStatuses] = useState<Record<string, UserDrinkStatus>>({});
  const [error, setError] = useState<string | null>(null);

  // 작성 폼 상태
  const [selectedMenuId, setSelectedMenuId] = useState(menus[0]?.id ?? "");
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<TasteTag[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const menuById = useMemo(() => new Map(menus.map((m) => [m.id, m])), [menus]);
  const menuIds = useMemo(() => menus.map((m) => m.id), [menus]);

  const reload = useCallback(async () => {
    try {
      setReviews(await fetchReviews(menuIds));
    } catch (e) {
      setError(e instanceof Error ? e.message : "리뷰를 불러오지 못했습니다.");
    }
  }, [menuIds]);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    fetchReviews(menuIds)
      .then((rs) => {
        if (!cancelled) setReviews(rs);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "리뷰를 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, [configured, menuIds]);

  useEffect(() => {
    let cancelled = false;
    const load = user
      ? fetchMyUserDrinks().catch(() => [])
      : Promise.resolve([]);
    load.then((rows) => {
      if (cancelled) return;
      setMyStatuses(
        Object.fromEntries(
          rows.filter((r) => menuById.has(r.brand_drink_id)).map((r) => [r.brand_drink_id, r.status]),
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [user, menuById]);

  // 메뉴를 선택하면 내 기존 리뷰를 폼에 프리필
  function selectMenu(menuId: string) {
    setSelectedMenuId(menuId);
    const mine = user
      ? reviews.find((r) => r.user_id === user.id && r.brand_drink_id === menuId)
      : undefined;
    setRating(mine?.rating ?? 0);
    setTags(mine?.taste_tags ?? []);
    setComment(mine?.comment ?? "");
  }

  if (!configured) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-400 dark:border-zinc-700">
        ⭐ 리뷰·기록 기능은 Supabase 연동 후 활성화됩니다. (README 참고)
      </section>
    );
  }

  const stats = menus.map((m) => {
    const rs = reviews.filter((r) => r.brand_drink_id === m.id);
    const avg = rs.length ? rs.reduce((sum, r) => sum + r.rating, 0) / rs.length : null;
    return { menu: m, count: rs.length, avg };
  });

  async function toggleStatus(menuId: string, status: UserDrinkStatus) {
    if (!user) {
      alert("로그인 후 이용할 수 있습니다.");
      return;
    }
    const next = myStatuses[menuId] === status ? null : status;
    // 낙관적 갱신
    setMyStatuses((prev) => {
      const copy = { ...prev };
      if (next === null) delete copy[menuId];
      else copy[menuId] = next;
      return copy;
    });
    try {
      await setUserDrinkStatus(menuId, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      void reload();
    }
  }

  async function submit() {
    if (!user) {
      alert("로그인 후 리뷰를 작성할 수 있습니다.");
      return;
    }
    if (rating === 0) {
      alert("별점을 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await upsertReview({ brandDrinkId: selectedMenuId, rating, tasteTags: tags, comment });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "리뷰 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeReview(id: string) {
    if (!confirm("리뷰를 삭제할까요?")) return;
    try {
      await deleteReview(id);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">리뷰</h2>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {/* 브랜드별 평점 요약 + 마셨어요/마시고 싶어요 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ menu, count, avg }) => (
          <div
            key={menu.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: menu.brandColor }}
              />
              {menu.brandName}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <StarRating value={avg ? Math.round(avg) : 0} />
              <span className="text-sm text-zinc-500">
                {avg ? `${avg.toFixed(1)} (${count})` : "리뷰 없음"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              {(Object.keys(USER_DRINK_STATUS_LABELS) as UserDrinkStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStatus(menu.id, s)}
                  className={
                    myStatuses[menu.id] === s
                      ? "rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-zinc-900"
                      : "rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }
                >
                  {s === "drank" ? "✅" : "🤍"} {USER_DRINK_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 리뷰 작성 폼 */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-semibold">리뷰 쓰기</h3>
        {!user ? (
          <p className="mt-2 text-sm text-zinc-500">로그인 후 리뷰를 작성할 수 있습니다.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {menus.map((m) => (
                <button
                  key={m.id}
                  onClick={() => selectMenu(m.id)}
                  className={
                    selectedMenuId === m.id
                      ? "rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
                      : "rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }
                >
                  {m.brandName}
                </button>
              ))}
            </div>
            <StarRating value={rating} onChange={setRating} size="lg" />
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                  }
                  className={
                    tags.includes(t)
                      ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800"
                      : "rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }
                >
                  {TASTE_TAG_LABELS[t]}
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="맛은 어땠나요? (선택)"
              className="w-full rounded-xl border border-zinc-300 bg-transparent p-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700"
            />
            <button
              onClick={submit}
              disabled={submitting}
              className="self-end rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              {submitting ? "저장 중…" : "등록"}
            </button>
          </div>
        )}
      </div>

      {/* 리뷰 목록 */}
      {reviews.length > 0 && (
        <ul className="flex flex-col gap-3">
          {reviews.map((r) => {
            const menu = menuById.get(r.brand_drink_id);
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    {menu && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: menu.brandColor }}
                        />
                        {menu.brandName}
                      </span>
                    )}
                    <StarRating value={r.rating} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    {new Date(r.created_at).toLocaleDateString("ko-KR")}
                    {user?.id === r.user_id && (
                      <button onClick={() => removeReview(r.id)} className="hover:text-red-500">
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                {r.taste_tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.taste_tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {TASTE_TAG_LABELS[t] ?? t}
                      </span>
                    ))}
                  </div>
                )}
                {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
