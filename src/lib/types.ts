export type Category = "coffee" | "latte" | "smoothie" | "tea" | "ade";

export const CATEGORY_LABELS: Record<Category, string> = {
  coffee: "커피",
  latte: "라떼·밀크",
  smoothie: "스무디·프라페",
  tea: "티",
  ade: "에이드·주스",
};

export interface Brand {
  id: string;
  slug: string;
  name: string;
  /** 브랜드 대표 색상 (Tailwind가 아닌 hex, 카드 액센트용) */
  color: string;
  description: string;
}

export interface Drink {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  category: Category;
  description: string;
  emoji: string;
}

/** 레시피 구성값 — Phase 3 상관분석을 위해 자유 텍스트가 아닌 구조화 필드로 유지한다 */
export interface Recipe {
  shots?: number;
  syrupPumps?: number;
  syrupType?: string;
  milk?: string;
  base?: string;
  toppings?: string[];
  notes?: string;
}

export interface Nutrition {
  calories?: number;
  sugarG?: number;
  caffeineMg?: number;
  sodiumMg?: number;
  proteinG?: number;
}

export interface BrandDrink {
  id: string;
  brandId: string;
  drinkId: string;
  menuName: string;
  price: number;
  sizeName: string;
  sizeMl: number;
  recipe: Recipe;
  nutrition: Nutrition;
}

/** 비교 페이지에서 쓰는 조인 결과 */
export interface BrandDrinkWithBrand extends BrandDrink {
  brand: Brand;
}

export interface DrinkWithMenus extends Drink {
  menus: BrandDrinkWithBrand[];
}
