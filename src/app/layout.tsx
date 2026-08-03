import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  title: {
    default: "마실레시피 — 프랜차이즈 음료 브랜드별 비교",
    template: "%s | 마실레시피",
  },
  description:
    "스타벅스, 메가커피, 컴포즈커피 등 프랜차이즈 음료의 가격·용량·레시피 구성·영양성분을 브랜드별로 한눈에 비교하세요.",
  keywords: ["카페 메뉴 비교", "프랜차이즈 커피", "음료 레시피", "카페인 비교", "당류 비교"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <Footer />
        {ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
