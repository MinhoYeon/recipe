import Link from "next/link";
import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface CategoryTabsProps {
  active?: Category;
  q?: string;
}

export default function CategoryTabs({ active, q }: CategoryTabsProps) {
  const base = q ? `&q=${encodeURIComponent(q)}` : "";
  const tabs: { label: string; href: string; isActive: boolean }[] = [
    { label: "전체", href: `/drinks?${base.slice(1)}`, isActive: !active },
    ...(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => ({
      label: CATEGORY_LABELS[c],
      href: `/drinks?category=${c}${base}`,
      isActive: active === c,
    })),
  ];

  return (
    <nav className="flex flex-wrap gap-2" aria-label="카테고리">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={
            t.isActive
              ? "rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
              : "rounded-full border border-zinc-300 px-4 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
