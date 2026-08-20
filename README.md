# 마실레시피 🥤

프랜차이즈(스타벅스, 메가커피, 컴포즈커피 등) 음료의 **가격 · 용량 · 레시피 구성 · 영양성분을 브랜드별로 비교**하는 사이트.

## 로드맵

- **Phase 1 (완료)** — 음료 검색 + 브랜드별 비교 + 광고 슬롯 + 소셜 로그인
- **Phase 2 (완료)** — 리뷰·별점(맛 태그) + 마이페이지(마셨어요/마시고 싶어요)
- **Phase 3** — 통계 대시보드, 레시피↔맛 상관분석, 신규 음료 제안, 목록 평점순 정렬

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

환경변수 없이 바로 실행된다 — 카탈로그는 로컬 시드(`src/data/seed.ts`)에서 읽고, 로그인·리뷰·마이페이지·광고는 비활성(안내 문구/플레이스홀더) 상태로 렌더링된다.

## 데이터 아키텍처

- **카탈로그**(브랜드/음료/메뉴): 로컬 시드 `src/data/seed.ts`가 원본. 페이지는 SSG로 빌드된다.
- **사용자 데이터**(리뷰, 마셨어요/마시고 싶어요): Supabase에 저장하고 클라이언트에서 조회한다 (`src/lib/reviews.ts`).
- 두 저장소는 **동일한 text id**로 연결된다. 시드를 수정하면 `npm run seed:sql`로 `supabase/seed.sql`을 재생성해 DB에 반영할 것 (upsert 방식이라 재실행해도 안전).

## 구조

```
src/
  app/
    page.tsx                  # 홈 (검색바, 인기 음료, 브랜드)
    drinks/page.tsx           # 검색/목록 (?q=&category=&brand=)
    drinks/[slug]/page.tsx    # ★ 브랜드별 비교 페이지 (SSG + JSON-LD)
    brands/page.tsx           # 브랜드 목록
    brands/[slug]/page.tsx    # 브랜드별 전체 메뉴
  components/                 # Header, SearchBar, DrinkCard, AdSlot 등
  data/seed.ts                # 시드 데이터 (브랜드/음료/메뉴)
  lib/
    types.ts                  # 도메인 타입
    data.ts                   # 데이터 접근 레이어 (Supabase 전환 지점)
    supabase/client.ts        # Supabase 브라우저 클라이언트 (env 있을 때만)
supabase/migrations/          # DB 스키마 (Phase 1+2 테이블, RLS 포함)
```

## 외부 서비스 연동

`.env.example`을 `.env.local`로 복사한 후:

1. **Supabase** — 프로젝트 생성 → SQL Editor에서 `supabase/migrations/0001_init.sql` 실행(스키마) → `supabase/seed.sql` 실행(카탈로그) → URL/anon key를 env에 입력. Auth > Providers에서 Google(또는 카카오) 활성화하면 로그인·리뷰·마이페이지가 모두 동작.
   - 카탈로그 조회까지 Supabase로 옮기려면 `src/lib/data.ts`의 함수 내부만 Supabase 쿼리로 교체하면 된다 (페이지 코드는 수정 불필요).
2. **Google AdSense** — 승인 후 `NEXT_PUBLIC_ADSENSE_CLIENT` 설정, `AdSlot` 컴포넌트에 슬롯 ID 전달. 승인에 수 주가 걸릴 수 있으니 일찍 신청할 것.
3. **배포** — Vercel에 리포 연결이 가장 간단.

## ⚠️ 시드 데이터 주의

`src/data/seed.ts`의 가격·영양성분·레시피 구성값은 **개발용 샘플**이다. 서비스 오픈 전 각 브랜드 공식 홈페이지의 공개 정보(메뉴, 영양성분표)로 검증·교체해야 한다. 프랜차이즈의 실제 내부 레시피는 영업비밀이므로, 공개 정보(구성, 영양성분, 커스텀 옵션)와 사용자 제보 기반 재현 레시피만 다룬다.
