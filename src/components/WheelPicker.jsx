import { useEffect, useRef, useCallback } from "react";

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const PAD_ROWS = (VISIBLE_ROWS - 1) / 2;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function WheelColumn({ count, value, onChange, label }) {
  const scrollRef = useRef(null);
  const timeoutRef = useRef(null);
  const isProgrammatic = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = value * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - target) > 1) {
      isProgrammatic.current = true;
      el.scrollTo({ top: target, behavior: "instant" in window ? "instant" : "auto" });
      requestAnimationFrame(() => {
        isProgrammatic.current = false;
      });
    }
  }, []);

  const commitFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(count - 1, idx));
    el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
    if (clamped !== value) onChange(clamped);
  }, [count, onChange, value]);

  const handleScroll = () => {
    if (isProgrammatic.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(commitFromScroll, 120);
  };

  const step = (dir) => {
    const next = Math.max(0, Math.min(count - 1, value + dir));
    onChange(next);
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: next * ITEM_HEIGHT, behavior: "smooth" });
  };

  return (
    <div className="relative flex flex-col items-center">
      {label && (
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-black/40">{label}</div>
      )}
      <div
        className="relative"
        style={{ height: ITEM_HEIGHT * VISIBLE_ROWS, width: 84 }}
      >
        <div
          className="pointer-events-none absolute left-0 right-0 rounded-2xl bg-black/5"
          style={{ top: ITEM_HEIGHT * PAD_ROWS, height: ITEM_HEIGHT }}
        />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onWheel={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(commitFromScroll, 120);
          }}
          onTouchEnd={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(commitFromScroll, 120);
          }}
          className="no-scrollbar h-full overflow-y-scroll"
          style={{ scrollSnapType: "y mandatory" }}
        >
          <div style={{ height: ITEM_HEIGHT * PAD_ROWS }} />
          {Array.from({ length: count }, (_, i) => {
            const selected = i === value;
            return (
              <button
                type="button"
                key={i}
                onClick={() => step(i - value)}
                className="flex w-full items-center justify-center tabular select-none"
                style={{
                  height: ITEM_HEIGHT,
                  scrollSnapAlign: "start",
                  fontSize: selected ? 26 : 19,
                  fontWeight: selected ? 800 : 500,
                  color: selected ? "#111111" : "rgba(0,0,0,0.3)",
                  transition: "color 120ms ease, font-size 120ms ease",
                }}
              >
                {pad2(i)}
              </button>
            );
          })}
          <div style={{ height: ITEM_HEIGHT * PAD_ROWS }} />
        </div>
      </div>
    </div>
  );
}

export default function WheelPicker({ hour, minute, onChangeHour, onChangeMinute }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-3xl bg-white border border-black/5 shadow-sm px-8 py-6">
      <WheelColumn count={24} value={hour} onChange={onChangeHour} label="ชั่วโมง" />
      <div className="text-3xl font-extrabold text-black/20 pb-1">:</div>
      <WheelColumn count={60} value={minute} onChange={onChangeMinute} label="นาที" />
    </div>
  );
}
