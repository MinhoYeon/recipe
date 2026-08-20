import Link from "next/link";
import LoginButton from "@/components/LoginButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-xl">🥤</span>
          <span>마실레시피</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/drinks" className="hover:text-zinc-900 dark:hover:text-white">
            음료 비교
          </Link>
          <Link href="/brands" className="hover:text-zinc-900 dark:hover:text-white">
            브랜드
          </Link>
          <Link href="/me" className="hover:text-zinc-900 dark:hover:text-white">
            마이페이지
          </Link>
        </nav>
        <LoginButton />
      </div>
    </header>
  );
}
