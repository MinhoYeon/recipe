import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import { getAllBrandSlugs, getBrandMenu } from "@/lib/data";
import { CATEGORY_LABELS } from "@/lib/types";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllBrandSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBrandMenu(slug);
  if (!data) return {};
  return {
    title: `${data.brand.name} 메뉴 — 가격·영양성분`,
    description: `${data.brand.name}의 음료 메뉴 가격, 용량, 영양성분을 확인하고 다른 브랜드와 비교하세요.`,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const data = await getBrandMenu(slug);
  if (!data) notFound();
  const { brand, items } = data;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-5 w-5 rounded-full"
            style={{ backgroundColor: brand.color }}
          />
          <h1 className="text-3xl font-bold">{brand.name}</h1>
        </div>
        <p className="mt-2 text-zinc-500">{brand.description}</p>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-bold">메뉴 ({items.length})</h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
                <th className="p-3 font-medium">메뉴</th>
                <th className="p-3 font-medium">카테고리</th>
                <th className="p-3 font-medium">가격</th>
                <th className="p-3 font-medium">용량</th>
                <th className="p-3 font-medium">칼로리</th>
                <th className="p-3 font-medium">비교</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ drink, menu }) => (
                <tr
                  key={menu.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/50"
                >
                  <td className="p-3 font-medium">
                    {drink.emoji} {menu.menuName}
                  </td>
                  <td className="p-3 text-zinc-500">{CATEGORY_LABELS[drink.category]}</td>
                  <td className="p-3">{menu.price.toLocaleString()}원</td>
                  <td className="p-3">
                    {menu.sizeName} ({menu.sizeMl}ml)
                  </td>
                  <td className="p-3">
                    {menu.nutrition.calories != null ? `${menu.nutrition.calories}kcal` : "—"}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/drinks/${drink.slug}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      브랜드 비교 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdSlot />
    </div>
  );
}
