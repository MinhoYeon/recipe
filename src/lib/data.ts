import { brandDrinks, brands, drinks } from "@/data/seed";
import type {
  Brand,
  BrandDrinkWithBrand,
  Category,
  Drink,
  DrinkWithMenus,
} from "@/lib/types";

// 데이터 접근은 전부 이 모듈을 통한다.
// 지금은 로컬 시드 데이터를 읽지만, Supabase 연동 시 이 함수들의 내부만
// supabase 쿼리로 교체하면 페이지 코드는 그대로 유지된다.

const brandById = new Map(brands.map((b) => [b.id, b]));

function menusOf(drinkId: string): BrandDrinkWithBrand[] {
  return brandDrinks
    .filter((bd) => bd.drinkId === drinkId)
    .map((bd) => ({ ...bd, brand: brandById.get(bd.brandId)! }))
    .sort((a, b) => a.price - b.price);
}

export async function getBrands(): Promise<Brand[]> {
  return brands;
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  return brands.find((b) => b.slug === slug) ?? null;
}

export interface DrinkFilter {
  q?: string;
  category?: Category;
  brand?: string; // brand slug
}

export async function getDrinks(filter: DrinkFilter = {}): Promise<DrinkWithMenus[]> {
  let result = drinks;

  if (filter.q) {
    const q = filter.q.replaceAll(" ", "").toLowerCase();
    result = result.filter(
      (d) =>
        d.name.replaceAll(" ", "").includes(q) ||
        d.nameEn.replaceAll(" ", "").toLowerCase().includes(q),
    );
  }
  if (filter.category) {
    result = result.filter((d) => d.category === filter.category);
  }

  let withMenus = result.map((d) => ({ ...d, menus: menusOf(d.id) }));

  if (filter.brand) {
    const brand = brands.find((b) => b.slug === filter.brand);
    if (brand) {
      withMenus = withMenus.filter((d) => d.menus.some((m) => m.brandId === brand.id));
    }
  }
  return withMenus;
}

export async function getDrinkBySlug(slug: string): Promise<DrinkWithMenus | null> {
  const drink = drinks.find((d) => d.slug === slug);
  if (!drink) return null;
  return { ...drink, menus: menusOf(drink.id) };
}

export async function getAllDrinkSlugs(): Promise<string[]> {
  return drinks.map((d) => d.slug);
}

export async function getAllBrandSlugs(): Promise<string[]> {
  return brands.map((b) => b.slug);
}

/** 브랜드 페이지: 해당 브랜드의 전체 메뉴를 음료 정보와 함께 반환 */
export async function getBrandMenu(
  brandSlug: string,
): Promise<{ brand: Brand; items: { drink: Drink; menu: BrandDrinkWithBrand }[] } | null> {
  const brand = brands.find((b) => b.slug === brandSlug);
  if (!brand) return null;
  const drinkById = new Map(drinks.map((d) => [d.id, d]));
  const items = brandDrinks
    .filter((bd) => bd.brandId === brand.id)
    .map((bd) => ({ drink: drinkById.get(bd.drinkId)!, menu: { ...bd, brand } }))
    .sort((a, b) => a.drink.name.localeCompare(b.drink.name, "ko"));
  return { brand, items };
}
