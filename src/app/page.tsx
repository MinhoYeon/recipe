import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import DrinkCard from "@/components/DrinkCard";
import SearchBar from "@/components/SearchBar";
import { getBrands, getDrinks } from "@/lib/data";

export default async function Home() {
  const [drinks, brands] = await Promise.all([getDrinks(), getBrands()]);
  // 비교 가치가 큰 순서(취급 브랜드 수)로 인기 음료 노출
  const featured = [...drinks].sort((a, b) => b.menus.length - a.menus.length).slice(0, 6);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-center gap-6 py-10 text-center">
        <h1 className="text-3xl font-bold leading-snug sm:text-4xl">
          같은 음료, 브랜드마다 뭐가 다를까?
        </h1>
        <p className="max-w-xl text-zinc-500">
          프랜차이즈 음료의 가격 · 용량 · 샷 수 · 당류 · 카페인을 브랜드별로 한눈에 비교하세요.
        </p>
        <SearchBar className="w-full max-w-xl" />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">인기 비교 음료</h2>
          <Link href="/drinks" className="text-sm text-zinc-500 hover:underline">
            전체 보기 →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <DrinkCard key={d.id} drink={d} />
          ))}
        </div>
      </section>

      <AdSlot />

      <section>
        <h2 className="mb-4 text-xl font-bold">브랜드</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: b.color }}
                />
                <h3 className="font-semibold group-hover:underline">{b.name}</h3>
              </div>
              <p className="line-clamp-2 text-sm text-zinc-500">{b.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
