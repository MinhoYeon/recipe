const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

interface AdSlotProps {
  /** AdSense 광고 단위 슬롯 ID (승인 후 발급) */
  slot?: string;
  className?: string;
}

/**
 * 광고 슬롯. NEXT_PUBLIC_ADSENSE_CLIENT가 설정되면 AdSense 광고를,
 * 미설정(승인 전)이면 자리 표시용 플레이스홀더를 렌더링한다.
 */
export default function AdSlot({ slot, className = "" }: AdSlotProps) {
  if (!ADSENSE_CLIENT || !slot) {
    return (
      <div
        className={`flex h-24 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-600 ${className}`}
        aria-hidden
      >
        AD
      </div>
    );
  }
  return (
    <div className={className}>
      <ins
        className="adsbygoogle block"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
        }}
      />
    </div>
  );
}
