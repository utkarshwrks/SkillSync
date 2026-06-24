import React, { useEffect, useRef, useState } from "react";

/**
 * Animated number that counts up to `value` when it scrolls into view.
 * Supports a prefix/suffix (e.g. "$" / "%" / "k") and decimals.
 */
export default function CountUp({ value = 0, duration = 900, prefix = "", suffix = "", decimals = 0, className = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const from = 0;
          const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(from + (value - from) * eased);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  const shown = decimals ? display.toFixed(decimals) : Math.round(display).toString();
  return (
    <span ref={ref} className={className}>
      {prefix}{shown}{suffix}
    </span>
  );
}
