"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StarRating from "@/components/StarRating";
import { getMenuInfo } from "@/lib/catalog";
import { fetchMyReviews, fetchMyUserDrinks, setUserDrinkStatus } from "@/lib/reviews";
import type { Review, UserDrinkRow, UserDrinkStatus } from "@/lib/types";
import { TASTE_TAG_LABELS, USER_DRINK_STATUS_LABELS } from "@/lib/types";
import { useSupabaseUser } from "@/lib/useSupabaseUser";

function MenuLine({ brandDrinkId }: { brandDrinkId: string }) {
  const info = getMenuInfo(brandDrinkId);
  if (!info) return <span className="text-zinc-400">삭제된 메뉴</span>;
  return (
    <Link href={`/drinks/${info.drink.slug}`} className="group flex items-center gap-2">
      <span className="text-xl">{info.drink.emoji}</span>
      <span className="flex items-center gap-1.5 text-sm text-zinc-500">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: info.brand.color }}
        />
        {info.brand.name}
      </span>
      <span className="font-medium group-hover:underline">{info.menu.menuName}</span>
    </Link>
  );
}

export default function MyPage() {
  const { user, loading, configured } = useSupabaseUser();
  const [records, setRecords] = useState<UserDrinkRow[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadRecords = user ? fetchMyUserDrinks().catch(() => []) : Promise.resolve([]);
    const loadReviews = user ? fetchMyReviews().catch(() => []) : Promise.resolve([]);
    loadRecords.then((rows) => {
      if (!cancelled) setRecords(rows);
    });
    loadReviews.then((rows) => {
      if (!cancelled) setReviews(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!configured) {
    return (
      <p className="py-24 text-center text-sm text-zinc-500">
        마이페이지는 Supabase 연동 후 사용할 수 있습니다. (README 참고)
      </p>
    );
  }
  if (loading) {
    return <p className="py-24 text-center text-sm text-zinc-500">불러오는 중…</p>;
  }
  if (!user) {
    return (
      <p className="py-24 text-center text-sm text-zinc-500">
        로그인하면 마신 음료와 마시고 싶은 음료를 기록할 수 있습니다.
      </p>
    );
  }

  async function remove(brandDrinkId: string) {
    setRecords((prev) => prev.filter((r) => r.brand_drink_id !== brandDrinkId));
    try {
      await setUserDrinkStatus(brandDrinkId, null);
    } catch {
      setRecords(await fetchMyUserDrinks());
    }
  }

  const sections: { status: UserDrinkStatus; emoji: string }[] = [
    { status: "want", emoji: "🤍" },
    { status: "drank", emoji: "✅" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      {sections.map(({ status, emoji }) => {
        const list = records.filter((r) => r.status === status);
        return (
          <section key={status}>
            <h2 className="mb-3 text-lg font-bold">
              {emoji} {USER_DRINK_STATUS_LABELS[status]} ({list.length})
            </h2>
            {list.length === 0 ? (
              <p className="text-sm text-zinc-500">
                아직 없어요.{" "}
                <Link href="/drinks" className="underline">
                  음료 둘러보기 →
                </Link>
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {list.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <MenuLine brandDrinkId={r.brand_drink_id} />
                    <button
                      onClick={() => remove(r.brand_drink_id)}
                      className="text-xs text-zinc-400 hover:text-red-500"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <section>
        <h2 className="mb-3 text-lg font-bold">✍️ 내 리뷰 ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-zinc-500">작성한 리뷰가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <MenuLine brandDrinkId={r.brand_drink_id} />
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} />
                    <span className="text-xs text-zinc-400">
                      {new Date(r.created_at).toLocaleDateString("ko-KR")}
                    </span>
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
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
