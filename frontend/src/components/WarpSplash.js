import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const SEEN_KEY = "skillsync_warp_seen";
const LINES = 28;

/**
 * One-time "hyperspace" entrance: star-streaks burst outward from center, the
 * logo warps in, then the whole overlay zooms into the app and fades. Shows
 * once per browser session; skipped entirely for reduced-motion.
 */
export default function WarpSplash() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch (_) { /* ignore */ }
    if (seen) return;
    setShow(true);
    // Mark "seen" only when we actually dismiss — NOT on mount. Otherwise React
    // StrictMode's double-invoke (dev) clears this timer on cleanup and the
    // re-run early-returns on the already-set flag, leaving the splash stuck.
    const t = setTimeout(() => {
      setShow(false);
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (_) { /* ignore */ }
    }, 1050);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#04060f]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.25, filter: "blur(8px)" }}
          transition={{ duration: 0.4, ease: [0.6, 0, 0.4, 1] }}
        >
          {/* radial star-streaks */}
          {Array.from({ length: LINES }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-px w-[55vmax] origin-left bg-gradient-to-r from-transparent via-white/80 to-transparent"
              style={{ rotate: (360 / LINES) * i }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1], opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.7, delay: (i % 7) * 0.01, ease: "easeIn" }}
            />
          ))}

          {/* central glow */}
          <motion.div
            className="absolute h-64 w-64 rounded-full bg-[#2563EB]/30 blur-[80px]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0, 0.9, 0.5] }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />

          {/* logo warp-in */}
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient font-display text-3xl font-bold text-white shadow-glow">
              S
            </div>
            <motion.span
              className="font-display text-sm uppercase tracking-[0.4em] text-slate-400"
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ duration: 0.45, delay: 0.25 }}
            >
              SkillSync
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
