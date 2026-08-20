// src/data/seed.ts의 카탈로그를 supabase/seed.sql로 변환한다.
// 실행: npm run seed:sql  (시드 데이터 변경 시마다 재실행 후 커밋)
import { writeFileSync } from "node:fs";
import { brandDrinks, brands, drinks } from "../src/data/seed";

const esc = (s: string) => s.replaceAll("'", "''");
const str = (s: string) => `'${esc(s)}'`;
const jsonb = (v: unknown) => `'${esc(JSON.stringify(v))}'::jsonb`;

const lines: string[] = [
  "-- 자동 생성 파일 — 직접 수정하지 말 것. (npm run seed:sql)",
  "-- 원본: src/data/seed.ts",
  "",
];

for (const b of brands) {
  lines.push(
    `insert into brands (id, slug, name, color, description) values (${str(b.id)}, ${str(b.slug)}, ${str(b.name)}, ${str(b.color)}, ${str(b.description)}) on conflict (id) do update set slug = excluded.slug, name = excluded.name, color = excluded.color, description = excluded.description;`,
  );
}
lines.push("");

for (const d of drinks) {
  lines.push(
    `insert into drinks (id, slug, name, name_en, category, description, emoji) values (${str(d.id)}, ${str(d.slug)}, ${str(d.name)}, ${str(d.nameEn)}, ${str(d.category)}, ${str(d.description)}, ${str(d.emoji)}) on conflict (id) do update set slug = excluded.slug, name = excluded.name, name_en = excluded.name_en, category = excluded.category, description = excluded.description, emoji = excluded.emoji;`,
  );
}
lines.push("");

for (const bd of brandDrinks) {
  lines.push(
    `insert into brand_drinks (id, brand_id, drink_id, menu_name, price, size_name, size_ml, recipe, nutrition) values (${str(bd.id)}, ${str(bd.brandId)}, ${str(bd.drinkId)}, ${str(bd.menuName)}, ${bd.price}, ${str(bd.sizeName)}, ${bd.sizeMl}, ${jsonb(bd.recipe)}, ${jsonb(bd.nutrition)}) on conflict (id) do update set brand_id = excluded.brand_id, drink_id = excluded.drink_id, menu_name = excluded.menu_name, price = excluded.price, size_name = excluded.size_name, size_ml = excluded.size_ml, recipe = excluded.recipe, nutrition = excluded.nutrition;`,
  );
}
lines.push("");

writeFileSync("supabase/seed.sql", lines.join("\n"));
console.log(
  `supabase/seed.sql 생성 완료 — brands ${brands.length}, drinks ${drinks.length}, brand_drinks ${brandDrinks.length}`,
);
