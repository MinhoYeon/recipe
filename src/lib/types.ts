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

// ── Phase 2: 리뷰 & 사용자 기록 ─────────────────────────

/** 맛 태그 — Phase 3 상관분석을 위해 자유 텍스트가 아닌 고정 키를 쓴다 */
export type TasteTag =
  | "sweet"
  | "bitter"
  | "sour"
  | "nutty"
  | "rich"
  | "light"
  | "fresh";

export const TASTE_TAG_LABELS: Record<TasteTag, string> = {
  sweet: "달아요",
  bitter: "써요",
  sour: "산미가 있어요",
  nutty: "고소해요",
  rich: "진해요",
  light: "연해요",
  fresh: "상큼해요",
};

/** reviews 테이블 행 */
export interface Review {
  id: string;
  user_id: string;
  brand_drink_id: string;
  rating: number;
  taste_tags: TasteTag[];
  comment: string;
  created_at: string;
}

export type UserDrinkStatus = "drank" | "want";

export const USER_DRINK_STATUS_LABELS: Record<UserDrinkStatus, string> = {
  drank: "마셨어요",
  want: "마시고 싶어요",
};

/** user_drinks 테이블 행 */
export interface UserDrinkRow {
  id: string;
  user_id: string;
  brand_drink_id: string;
  status: UserDrinkStatus;
  created_at: string;
}

/** 비교 페이지에서 쓰는 조인 결과 */
export interface BrandDrinkWithBrand extends BrandDrink {
  brand: Brand;
}

export interface DrinkWithMenus extends Drink {
  menus: BrandDrinkWithBrand[];
}
