import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useReducedMotion } from "framer-motion";

/**
 * Scroll-driven 3D primitives (CSS 3D transforms only — no WebGL).
 * On desktop: sections warp in from deep space, the hero panel tilts, layers
 * parallax. On phones / reduced-motion ("lite" mode) we soften everything and
 * drop the expensive blur so scrolling stays buttery. Transform/opacity only.
 */

const SPRING = { stiffness: 90, damping: 26, mass: 0.7 };

/* True when we should run the lightweight version (small screen OR reduced-motion). */
export function useLite() {
  const reduce = useReducedMotion();
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return { lite: reduce || small, reduce, small };
}

/* A section that reveals on scroll, from a chosen direction:
   - "depth"  → emerges from behind the screen (scale + blur), the signature.
   - "up"     → slides up from below.
   - "down"   → drops down from above.
   - "left"   → slides in from the left.
   - "right"  → slides in from the right.
   Spring-smoothed; softened on mobile; flat under reduced-motion. */
export function Section3D({ children, className = "", from = "depth" }) {
  const ref = useRef(null);
  const { lite, reduce } = useLite();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.92", "start 0.42"] });
  const p = useSpring(scrollYProgress, SPRING);
  const dist = lite ? 48 : 100;

  const opacity = useTransform(p, [0, 1], [reduce ? 1 : 0, 1]);
  const y = useTransform(p, [0, 1], [
    reduce ? 0 : from === "up" ? dist : from === "down" ? -dist : from === "depth" ? (lite ? 26 : 56) : 0,
    0,
  ]);
  const x = useTransform(p, [0, 1], [
    reduce ? 0 : from === "left" ? -dist : from === "right" ? dist : 0,
    0,
  ]);
  const scale = useTransform(p, [0, 1], [
    reduce ? 1 : from === "depth" ? (lite ? 0.88 : 0.66) : 0.985,
    1,
  ]);
  // Blur only for the depth variant on desktop (it's the expensive part). Kept
  // modest — a tall scroll-driven blur ramp re-rasterizes the whole section.
  const blurPx = useTransform(p, [0, 0.8, 1], [8, 1, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const useBlur = from === "depth" && !lite;

  const style = {
    opacity, x, y, scale,
    willChange: useBlur ? "transform, opacity, filter" : "transform, opacity",
    ...(useBlur ? { filter } : {}),
  };
  return (
    <section ref={ref} className={className} style={{ perspective: 1500 }}>
      <motion.div style={style}>{children}</motion.div>
    </section>
  );
}

/* ================================================================ ScrollStack
 * A depth "card deck": panels are stacked in one pinned viewport. As you scroll,
 * the active panel moves FORWARD (scales up) and fades out, while the next panel
 * rises FROM BEHIND (scales up from the back) into focus. Desktop-only — on
 * phones / reduced-motion it falls back to normal stacked flow.
 */
export function ScrollStack({ children }) {
  const ref = useRef(null);
  const stageRef = useRef(null);
  const { lite } = useLite();
  const items = React.Children.toArray(children);
  const N = items.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Mouse-reactive parallax for the whole stage (idle liveliness).
  const tiltX = useSpring(0, { stiffness: 120, damping: 18, mass: 0.4 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 18, mass: 0.4 });
  const onMove = (e) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    tiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 6);
  };
  const onLeave = () => { tiltX.set(0); tiltY.set(0); };

  if (lite) {
    // normal flow (no scroll-jack) on small screens / reduced-motion
    return <>{items.map((c, i) => <div key={i} className="py-16">{c}</div>)}</>;
  }

  return (
    <div ref={ref} style={{ height: `${N * 100}vh` }} className="relative">
      <div
        ref={stageRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="sticky top-0 h-screen overflow-hidden"
        style={{ perspective: 1600 }}
      >
        <motion.div className="relative h-full w-full" style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}>
          {items.map((child, i) => (
            <StackPanel key={i} i={i} N={N} progress={scrollYProgress}>
              {child}
            </StackPanel>
          ))}
        </motion.div>
        <Rail progress={scrollYProgress} N={N} />
      </div>
    </div>
  );
}

function StackPanel({ i, N, progress, children }) {
  // local = active index − this panel. 0 = front & centered; >0 = passed (push
  // forward + fade); <0 = upcoming (sits deep behind).
  const opacity = useTransform(progress, (v) => {
    const past = Math.max(0, Math.abs(v * (N - 1) - i) - 0.42); // plateau ±0.42 → no dead zones
    return Math.max(0, 1 - past * 3.2);
  });
  const scale = useTransform(progress, (v) => {
    const l = v * (N - 1) - i;
    return l >= 0 ? 1 + l * 0.5 : 1 + l * 0.32; // forward when passed, deep when upcoming
  });
  // Lean toward the viewer as it pushes forward; lean away while still behind.
  const rotateX = useTransform(progress, (v) => {
    const l = v * (N - 1) - i;
    return l >= 0 ? l * 7 : l * 4;
  });
  // Depth of field: sharp when active, blurs with distance (capped — full-
  // screen blur is the costliest thing to rasterize per frame).
  const blurPx = useTransform(progress, (v) => Math.min(6, Math.max(0, Math.abs(v * (N - 1) - i) - 0.42) * 11));
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const zIndex = useTransform(progress, (v) => 100 - Math.round(Math.abs(v * (N - 1) - i) * 10));
  const pointerEvents = useTransform(opacity, (o) => (o > 0.6 ? "auto" : "none"));
  // Giant ghost numeral that fades with the panel.
  const numOpacity = useTransform(opacity, (o) => o * 0.05);

  return (
    <motion.div
      style={{ opacity, scale, rotateX, filter, zIndex, pointerEvents, transformStyle: "preserve-3d", willChange: "transform, opacity, filter" }}
      className="absolute inset-0 grid place-items-center px-5"
    >
      <motion.span
        style={{ opacity: numOpacity }}
        className="pointer-events-none absolute select-none font-display text-[44vh] font-extrabold leading-none text-white"
        aria-hidden
      >
        {String(i + 1).padStart(2, "0")}
      </motion.span>
      <div className="relative max-h-screen w-full overflow-y-auto py-16">{children}</div>
    </motion.div>
  );
}

/* Living scroll-progress rail — active dot elongates + brightens. */
function Rail({ progress, N }) {
  return (
    <div className="absolute right-6 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-center gap-2.5 md:flex">
      {Array.from({ length: N }).map((_, i) => <RailDot key={i} i={i} N={N} progress={progress} />)}
    </div>
  );
}
function RailDot({ i, N, progress }) {
  const dist = useTransform(progress, (v) => Math.abs(v * (N - 1) - i));
  const height = useTransform(dist, [0, 0.5, 1.5], [30, 11, 8]);
  const opacity = useTransform(dist, [0, 0.6, 1.4], [1, 0.5, 0.28]);
  return <motion.div style={{ height, opacity }} className="w-1.5 rounded-full bg-brand-gradient" />;
}

/* Parallax layer — drifts vertically as it passes through the viewport. */
export function Parallax({ children, speed = 0.25, className = "" }) {
  const ref = useRef(null);
  const { lite } = useLite();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const mag = lite ? speed * 50 : speed * 120;
  const y = useTransform(scrollYProgress, [0, 1], lite ? [0, 0] : [-mag, mag]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* Hero panel that tilts in 3D as the hero scrolls past (subtle, cinematic). */
export function HeroTilt({ children, className = "" }) {
  const ref = useRef(null);
  const { lite, reduce } = useLite();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, SPRING);
  const rotateX = useTransform(p, [0, 1], reduce ? [0, 0] : lite ? [0, 6] : [0, 14]);
  const rotateY = useTransform(p, [0, 1], reduce ? [0, 0] : lite ? [0, -3] : [0, -8]);
  const scale = useTransform(p, [0, 1], reduce ? [1, 1] : lite ? [1, 0.97] : [1, 0.92]);
  const y = useTransform(p, [0, 1], reduce ? [0, 0] : lite ? [0, 30] : [0, 60]);
  const opacity = useTransform(p, [0, 1], reduce ? [1, 1] : [1, 0.55]);
  return (
    <div ref={ref} className={className} style={{ perspective: 1300 }}>
      <motion.div style={{ rotateX, rotateY, scale, y, opacity, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}
