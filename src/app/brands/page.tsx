import type { Metadata } from "next";
import Link from "next/link";
import { getBrands } from "@/lib/data";

export const metadata: Metadata = {
  title: "브랜드 목록",
  description: "프랜차이즈 음료 브랜드별 메뉴와 특징을 확인하세요.",
};

export default async function BrandsPage() {
  const brands = await getBrands();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">브랜드</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/brands/${b.slug}`}
            className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-block h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: b.color }}
              />
              <h2 className="text-lg font-semibold group-hover:underline">{b.name}</h2>
            </div>
            <p className="text-sm text-zinc-500">{b.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
