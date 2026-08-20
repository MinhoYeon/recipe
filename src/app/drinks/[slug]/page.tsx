import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import ReviewSection from "@/components/ReviewSection";
import { getAllDrinkSlugs, getDrinkBySlug } from "@/lib/data";
import type { BrandDrinkWithBrand } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface DrinkPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllDrinkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DrinkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const drink = await getDrinkBySlug(slug);
  if (!drink) return {};
  const brandNames = drink.menus.map((m) => m.brand.name).join(", ");
  return {
    title: `${drink.name} 브랜드별 비교 — ${brandNames}`,
    description: `${brandNames}의 ${drink.name} 가격, 용량, 샷 수, 당류, 카페인을 한눈에 비교합니다. ${drink.description}`,
  };
}

const formatters: {
  label: string;
  value: (m: BrandDrinkWithBrand) => string | number | null;
}[] = [
  { label: "메뉴명", value: (m) => m.menuName },
  { label: "가격", value: (m) => `${m.price.toLocaleString()}원` },
  { label: "용량", value: (m) => `${m.sizeName} (${m.sizeMl}ml)` },
  { label: "100ml당 가격", value: (m) => `${Math.round(m.price / (m.sizeMl / 100)).toLocaleString()}원` },
  { label: "샷", value: (m) => (m.recipe.shots != null ? `${m.recipe.shots}샷` : null) },
  {
    label: "시럽",
    value: (m) =>
      m.recipe.syrupPumps != null
        ? `${m.recipe.syrupType ?? ""} ${m.recipe.syrupPumps}펌프`.trim()
        : null,
  },
  { label: "우유", value: (m) => m.recipe.milk ?? null },
  { label: "베이스", value: (m) => m.recipe.base ?? null },
  { label: "토핑", value: (m) => m.recipe.toppings?.join(", ") ?? null },
  { label: "칼로리", value: (m) => (m.nutrition.calories != null ? `${m.nutrition.calories}kcal` : null) },
  { label: "당류", value: (m) => (m.nutrition.sugarG != null ? `${m.nutrition.sugarG}g` : null) },
  { label: "카페인", value: (m) => (m.nutrition.caffeineMg != null ? `${m.nutrition.caffeineMg}mg` : null) },
  { label: "비고", value: (m) => m.recipe.notes ?? null },
];

export default async function DrinkPage({ params }: DrinkPageProps) {
  const { slug } = await params;
  const drink = await getDrinkBySlug(slug);
  if (!drink) notFound();

  // 값이 하나도 없는 행은 표에서 제외
  const rows = formatters.filter((f) => drink.menus.some((m) => f.value(m) != null));
  const cheapest = drink.menus[0]; // menus는 가격 오름차순 정렬

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${drink.name} 브랜드별 비교`,
    itemListElement: drink.menus.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `${m.brand.name} ${m.menuName}`,
        offers: { "@type": "Offer", price: m.price, priceCurrency: "KRW" },
      },
    })),
  };

  return (
    <div className="flex flex-col gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-zinc-500">
        <Link href="/drinks" className="hover:underline">
          음료 비교
        </Link>
        {" / "}
        <Link href={`/drinks?category=${drink.category}`} className="hover:underline">
          {CATEGORY_LABELS[drink.category]}
        </Link>
      </nav>

      <header className="flex items-start gap-4">
        <span className="text-6xl">{drink.emoji}</span>
        <div>
          <h1 className="text-3xl font-bold">{drink.name}</h1>
          <p className="mt-2 text-zinc-500">{drink.description}</p>
          {cheapest && (
            <p className="mt-2 text-sm">
              최저가: <strong>{cheapest.brand.name}</strong>{" "}
              {cheapest.price.toLocaleString()}원 ({cheapest.sizeMl}ml)
            </p>
          )}
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-bold">브랜드별 비교</h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 text-left font-medium text-zinc-500">항목</th>
                {drink.menus.map((m) => (
                  <th key={m.id} className="p-3 text-left">
                    <Link href={`/brands/${m.brand.slug}`} className="hover:underline">
                      <span
                        className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: m.brand.color }}
                      />
                      {m.brand.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/50"
                >
                  <td className="p-3 font-medium text-zinc-500">{row.label}</td>
                  {drink.menus.map((m) => (
                    <td key={m.id} className="p-3">
                      {row.value(m) ?? <span className="text-zinc-300 dark:text-zinc-700">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          가격·구성·영양성분은 브랜드 공개 정보 기반이며 매장·시즌에 따라 다를 수 있습니다.
        </p>
      </section>

      <AdSlot />

      <ReviewSection
        menus={drink.menus.map((m) => ({
          id: m.id,
          menuName: m.menuName,
          brandName: m.brand.name,
          brandColor: m.brand.color,
        }))}
      />
    </div>
  );
}
