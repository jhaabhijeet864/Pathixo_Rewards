'use client';

import { useState, useEffect, useRef } from 'react';

interface LiveImpressionCounterProps {
  initialCount?: number;
}

export function LiveImpressionCounter({ initialCount = 5790394 }: LiveImpressionCounterProps) {
  const [count, setCount] = useState<number>(initialCount);
  const prevCountRef = useRef<number>(count);

  useEffect(() => {
    let isMounted = true;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    const fetchLiveImpressions = async () => {
      try {
        const res = await fetch(`${basePath}/api/events/impression`);
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.total_impressions === 'number' && isMounted) {
          setCount(data.total_impressions);
        } else if (typeof data.total_verified_impressions === 'number' && isMounted) {
          setCount(initialCount + data.total_verified_impressions);
        }
      } catch {
        // Fallback to active display
      }
    };

    fetchLiveImpressions();
    const interval = setInterval(fetchLiveImpressions, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [initialCount]);

  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);

  const formatted = count.toLocaleString('en-US');
  const characters = formatted.split('');

  return (
    <div className="inline-flex flex-col items-center">
      {/* Segmented Digit Display Container */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0c1219]/90 px-5 sm:px-8 py-4 sm:py-5 shadow-2xl backdrop-blur-md">
        {/* Digit Tiles Row */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 select-none">
          {characters.map((char, idx) => {
            if (char === ',') {
              return (
                <span
                  key={`sep-${idx}`}
                  className="font-mono text-2xl sm:text-4xl font-extrabold text-slate-500 px-0.5 self-end pb-1 sm:pb-2 leading-none"
                >
                  ,
                </span>
              );
            }

            return (
              <span
                key={`digit-${idx}-${char}`}
                className="inline-flex h-11 w-8 sm:h-16 sm:w-12 items-center justify-center rounded-lg border border-[#223244] bg-gradient-to-b from-[#16212e] to-[#0f1722] font-mono text-2xl sm:text-4xl font-extrabold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_10px_rgba(0,0,0,0.6)] transition-all duration-300"
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Live Badge & Label */}
        <div className="mt-3.5 flex items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-[#062e1e]/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#10e599]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            LIVE
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-400">
            Total ad impressions from our users
          </span>
        </div>
      </div>
    </div>
  );
}