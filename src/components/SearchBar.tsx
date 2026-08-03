interface SearchBarProps {
  defaultValue?: string;
  className?: string;
}

export default function SearchBar({ defaultValue = "", className = "" }: SearchBarProps) {
  return (
    <form action="/drinks" method="GET" className={`relative ${className}`} role="search">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="마시고 싶은 음료를 검색하세요 (예: 아메리카노)"
        className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-5 pr-14 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button
        type="submit"
        aria-label="검색"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
      >
        검색
      </button>
    </form>
  );
}
