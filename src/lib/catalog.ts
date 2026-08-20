import { brandDrinks, brands, drinks } from "@/data/seed";
import type { Brand, BrandDrink, Drink } from "@/lib/types";

// 클라이언트 컴포넌트(마이페이지 등)에서 id → 카탈로그 정보를 조회하는 헬퍼.
// 시드 데이터는 정적이므로 클라이언트 번들에 포함해도 무방하다.

export interface MenuInfo {
  menu: BrandDrink;
  brand: Brand;
  drink: Drink;
}

const brandById = new Map(brands.map((b) => [b.id, b]));
const drinkById = new Map(drinks.map((d) => [d.id, d]));
const menuById = new Map(brandDrinks.map((bd) => [bd.id, bd]));

export function getMenuInfo(brandDrinkId: string): MenuInfo | null {
  const menu = menuById.get(brandDrinkId);
  if (!menu) return null;
  const brand = brandById.get(menu.brandId);
  const drink = drinkById.get(menu.drinkId);
  if (!brand || !drink) return null;
  return { menu, brand, drink };
}
