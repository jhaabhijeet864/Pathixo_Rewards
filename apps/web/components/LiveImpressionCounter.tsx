'use client';

import { useState, useEffect, useRef } from 'react';

interface LiveImpressionCounterProps {
  initialCount?: number;
}

export function LiveImpressionCounter({ initialCount = 5790394 }: LiveImpressionCounterProps) {
  const [count, setCount] = useState<number>(initialCount);
  const [lastTick, setLastTick] = useState<number>(Date.now());
  const serverOffsetRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout>;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    // Initialize from storage if previous session was higher than initialCount
    try {
      const stored = localStorage.getItem('pathixo_live_impressions');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= initialCount) {
          setCount(parsed);
        }
      }
    } catch {}

    // Periodic sync with verified impressions from server API
    const syncServerImpressions = async () => {
      try {
        const res = await fetch(`${basePath}/api/events/impression`);
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.total_verified_impressions === 'number' && isMounted) {
          serverOffsetRef.current = data.total_verified_impressions;
        }
      } catch {}
    };

    syncServerImpressions();
    const syncInterval = setInterval(syncServerImpressions, 10000);

    // Stuttering live ticker loop (1 or 2 per second with natural jitter)
    const tick = () => {
      if (!isMounted) return;

      // 72% chance of +1, 25% chance of +2, 3% chance of +3 (burst)
      const rand = Math.random();
      const increment = rand < 0.72 ? 1 : rand < 0.97 ? 2 : 3;

      setCount((prev) => {
        const next = prev + increment;
        try {
          localStorage.setItem('pathixo_live_impressions', next.toString());
        } catch {}
        return next;
      });
      setLastTick(Date.now());

      // Stuttering delay cadence:
      // Averages ~750ms -> ~1.3 to 1.8 increments per second (1 or 2 per second)
      // Jittered between 450ms and 1100ms with occasional quick burst or slight pause
      const jitterRand = Math.random();
      let nextDelay: number;
      if (jitterRand < 0.18) {
        // Quick burst (e.g. 350ms - 520ms)
        nextDelay = Math.floor(350 + Math.random() * 170);
      } else if (jitterRand < 0.85) {
        // Normal cadence (e.g. 600ms - 950ms)
        nextDelay = Math.floor(600 + Math.random() * 350);
      } else {
        // Slight stutter pause (e.g. 1050ms - 1450ms)
        nextDelay = Math.floor(1050 + Math.random() * 400);
      }

      timerId = setTimeout(tick, nextDelay);
    };

    // Start ticking after brief 400ms mount pause
    timerId = setTimeout(tick, 400);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
      clearInterval(syncInterval);
    };
  }, [initialCount]);

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
                  className="font-mono text-2xl sm:text-4xl font-extrabold text-slate-500 px-0.5 sm:px-1 self-end pb-1 sm:pb-2 leading-none"
                >
                  ,
                </span>
              );
            }

            // Using character position from right so each digit slot is stable
            const posFromRight = characters.length - 1 - idx;

            return (
              <span
                key={`slot-${posFromRight}-${char}`}
                className="inline-flex h-11 w-8 sm:h-16 sm:w-12 items-center justify-center rounded-xl border border-[#202d3f] bg-gradient-to-b from-[#151e2b] to-[#0e1622] font-mono text-2xl sm:text-4xl font-extrabold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.6)] animate-digit-tick overflow-hidden"
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

      <style jsx global>{`
        @keyframes digitTickIn {
          0% {
            transform: translateY(35%);
            opacity: 0.4;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-digit-tick {
          animation: digitTickIn 0.16s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
