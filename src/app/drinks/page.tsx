import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import CategoryTabs from "@/components/CategoryTabs";
import DrinkCard from "@/components/DrinkCard";
import SearchBar from "@/components/SearchBar";
import { getDrinks } from "@/lib/data";
import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface DrinksPageProps {
  searchParams: Promise<{ q?: string; category?: string; brand?: string }>;
}

export async function generateMetadata({ searchParams }: DrinksPageProps): Promise<Metadata> {
  const { q, category } = await searchParams;
  const categoryLabel =
    category && category in CATEGORY_LABELS ? CATEGORY_LABELS[category as Category] : null;
  const title = q ? `'${q}' 검색 결과` : categoryLabel ? `${categoryLabel} 음료 비교` : "전체 음료 비교";
  return { title };
}

export default async function DrinksPage({ searchParams }: DrinksPageProps) {
  const { q, category, brand } = await searchParams;
  const validCategory =
    category && category in CATEGORY_LABELS ? (category as Category) : undefined;
  const drinks = await getDrinks({ q, category: validCategory, brand });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">음료 비교</h1>
      <SearchBar defaultValue={q} className="max-w-xl" />
      <CategoryTabs active={validCategory} q={q} />

      {drinks.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">
          검색 결과가 없습니다. 다른 검색어를 시도해 보세요.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drinks.slice(0, 6).map((d) => (
            <DrinkCard key={d.id} drink={d} />
          ))}
          {drinks.length > 6 && (
            <>
              <AdSlot className="sm:col-span-2 lg:col-span-3" />
              {drinks.slice(6).map((d) => (
                <DrinkCard key={d.id} drink={d} />
              ))}
            </>
          )}
        </div>
      )}

      <AdSlot />
    </div>
  );
}
