"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  className?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  layout?: string;
}

export function AdUnit({ className = "", format = "auto" }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      const w = window as unknown as { adsbygoogle: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, []);

  return (
    <div className={`ad-container my-6 ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-1099525389748059"
        data-ad-slot="auto"
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
