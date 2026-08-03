-- 마실레시피 초기 스키마
-- Phase 1(브랜드/음료/레시피)과 Phase 2(리뷰/사용자 기록) 테이블을 함께 정의한다.
-- Supabase SQL Editor 또는 `supabase db push`로 적용.

create table brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  color text not null default '#666666',
  description text not null default '',
  created_at timestamptz not null default now()
);

create table drinks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  name_en text not null default '',
  category text not null check (category in ('coffee', 'latte', 'smoothie', 'tea', 'ade')),
  description text not null default '',
  emoji text not null default '🥤',
  created_at timestamptz not null default now()
);

create table brand_drinks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands (id) on delete cascade,
  drink_id uuid not null references drinks (id) on delete cascade,
  menu_name text not null,
  price integer not null,
  size_name text not null default '',
  size_ml integer,
  -- 레시피 구성값. Phase 3 상관분석을 위해 구조화된 키를 유지한다:
  -- { "shots": 2, "syrupPumps": 3, "syrupType": "바닐라", "milk": "...", "base": "...", "toppings": [], "notes": "..." }
  recipe jsonb not null default '{}',
  -- { "calories": 180, "sugarG": 13, "caffeineMg": 75, "sodiumMg": 5, "proteinG": 10 }
  nutrition jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (brand_id, drink_id)
);

-- Phase 2: 리뷰 (별점 + 구조화된 맛 태그)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brand_drink_id uuid not null references brand_drinks (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  -- 맛 태그: ['sweet','bitter','sour','nutty','body'] 중 복수 선택
  taste_tags text[] not null default '{}',
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, brand_drink_id)
);

-- Phase 2: 사용자-음료 기록 (마셨어요 / 마시고 싶어요)
create table user_drinks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brand_drink_id uuid not null references brand_drinks (id) on delete cascade,
  status text not null check (status in ('drank', 'want')),
  created_at timestamptz not null default now(),
  unique (user_id, brand_drink_id)
);

create index idx_brand_drinks_drink on brand_drinks (drink_id);
create index idx_brand_drinks_brand on brand_drinks (brand_id);
create index idx_reviews_brand_drink on reviews (brand_drink_id);
create index idx_user_drinks_user on user_drinks (user_id);

-- RLS: 카탈로그는 전체 공개 읽기, 리뷰/기록은 본인만 쓰기
alter table brands enable row level security;
alter table drinks enable row level security;
alter table brand_drinks enable row level security;
alter table reviews enable row level security;
alter table user_drinks enable row level security;

create policy "public read brands" on brands for select using (true);
create policy "public read drinks" on drinks for select using (true);
create policy "public read brand_drinks" on brand_drinks for select using (true);
create policy "public read reviews" on reviews for select using (true);

create policy "own insert reviews" on reviews for insert with check (auth.uid() = user_id);
create policy "own update reviews" on reviews for update using (auth.uid() = user_id);
create policy "own delete reviews" on reviews for delete using (auth.uid() = user_id);

create policy "own read user_drinks" on user_drinks for select using (auth.uid() = user_id);
create policy "own insert user_drinks" on user_drinks for insert with check (auth.uid() = user_id);
create policy "own update user_drinks" on user_drinks for update using (auth.uid() = user_id);
create policy "own delete user_drinks" on user_drinks for delete using (auth.uid() = user_id);
