"use client";

interface StarRatingProps {
  value: number;
  /** 지정하면 입력 모드로 동작 */
  onChange?: (value: number) => void;
  size?: "sm" | "lg";
}

export default function StarRating({ value, onChange, size = "sm" }: StarRatingProps) {
  const sizeClass = size === "lg" ? "text-2xl" : "text-base";
  return (
    <span className={`inline-flex ${sizeClass}`} role={onChange ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n}점`}
            onClick={() => onChange(n)}
            className="transition hover:scale-110"
          >
            <span className={n <= value ? "text-amber-400" : "text-zinc-300 dark:text-zinc-700"}>
              ★
            </span>
          </button>
        ) : (
          <span
            key={n}
            className={n <= value ? "text-amber-400" : "text-zinc-300 dark:text-zinc-700"}
          >
            ★
          </span>
        ),
      )}
    </span>
  );
}
