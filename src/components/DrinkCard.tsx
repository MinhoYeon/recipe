import Link from "next/link";
import type { DrinkWithMenus } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

export default function DrinkCard({ drink }: { drink: DrinkWithMenus }) {
  const prices = drink.menus.map((m) => m.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <Link
      href={`/drinks/${drink.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl">{drink.emoji}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {CATEGORY_LABELS[drink.category]}
        </span>
      </div>
      <div>
        <h3 className="font-semibold group-hover:underline">{drink.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{drink.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between text-sm">
        <span className="text-zinc-500">{drink.menus.length}개 브랜드</span>
        {prices.length > 0 && (
          <span className="font-medium">
            {minPrice.toLocaleString()}원
            {maxPrice !== minPrice && ` ~ ${maxPrice.toLocaleString()}원`}
          </span>
        )}
      </div>
    </Link>
  );
}
