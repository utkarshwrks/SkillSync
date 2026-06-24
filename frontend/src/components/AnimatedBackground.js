import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLite } from "./scroll3d";

/* Tiled star layers via radial-gradients (cheap, seamless, GPU-friendly). */
const STARS_SM =
  "radial-gradient(1px 1px at 25px 15px,#fff,transparent)," +
  "radial-gradient(1px 1px at 80px 120px,rgba(255,255,255,.85),transparent)," +
  "radial-gradient(1px 1px at 140px 60px,#fff,transparent)," +
  "radial-gradient(1px 1px at 110px 170px,rgba(255,255,255,.7),transparent)," +
  "radial-gradient(1px 1px at 175px 110px,#fff,transparent)";
const STARS_MD =
  "radial-gradient(1.6px 1.6px at 60px 40px,#fff,transparent)," +
  "radial-gradient(1.6px 1.6px at 220px 160px,rgba(191,219,254,.9),transparent)," +
  "radial-gradient(1.6px 1.6px at 300px 80px,#fff,transparent)," +
  "radial-gradient(1.6px 1.6px at 140px 260px,rgba(255,255,255,.8),transparent)";
const STARS_LG =
  "radial-gradient(2.4px 2.4px at 120px 90px,#fff,transparent)," +
  "radial-gradient(2.2px 2.2px at 400px 300px,rgba(147,197,253,.9),transparent)," +
  "radial-gradient(2px 2px at 260px 420px,#fff,transparent)";

/**
 * Deep-space background: layered twinkling starfields at three depths (each
 * parallaxes with scroll), soft nebula clouds, a slow shooting star, and a
 * vignette. GPU-friendly (transform/opacity only); disabled under
 * prefers-reduced-motion.
 */
export default function AnimatedBackground() {
  const { lite, reduce } = useLite();
  const { scrollYProgress } = useScroll();
  // Lighter parallax on phones / reduced-motion so scrolling stays smooth.
  const k = reduce ? 0 : lite ? 0.4 : 1;
  const yFar = useTransform(scrollYProgress, [0, 1], [0, -80 * k]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, -200 * k]);
  const yNear = useTransform(scrollYProgress, [0, 1], [0, -380 * k]);
  const nebulaY = useTransform(scrollYProgress, [0, 1], [0, 160 * k]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#04060f]">
      {/* deep-space base glow (slightly blue toward the top) */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(37,99,235,0.20),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_80%_100%,rgba(14,165,233,0.10),transparent_60%)]" />

      {/* nebula clouds — promoted to their own layers so the blur rasterizes
          once and the drift is a pure composite (willChange: transform). */}
      <motion.div style={{ y: nebulaY, willChange: "transform" }} className="absolute inset-0">
        <div className="absolute -left-[10%] top-[8%] h-[46vw] w-[46vw] animate-aurora-a rounded-full bg-[#2563EB]/[0.14] blur-[130px] [will-change:transform]" />
        <div className="absolute right-[-8%] top-[40%] h-[40vw] w-[40vw] animate-aurora-b rounded-full bg-[#7c3aed]/[0.10] blur-[140px] [will-change:transform]" />
        <div className="absolute bottom-[-12%] left-[30%] h-[42vw] w-[42vw] animate-aurora-a rounded-full bg-[#0EA5E9]/[0.08] blur-[150px] [will-change:transform]" />
      </motion.div>

      {/* star layers (parallax + twinkle) — transform-only, GPU-composited. */}
      <motion.div style={{ y: yFar, backgroundImage: STARS_SM, backgroundSize: "140px 140px", willChange: "transform" }}
        className="absolute -inset-[20%] opacity-70" />
      <motion.div style={{ y: yFar, backgroundImage: STARS_SM, backgroundSize: "230px 230px", willChange: "transform" }}
        className="absolute -inset-[20%] animate-twinkle opacity-80" />
      <motion.div style={{ y: yMid, backgroundImage: STARS_MD, backgroundSize: "360px 360px", willChange: "transform" }}
        className="absolute -inset-[20%] opacity-90" />
      <motion.div style={{ y: yNear, backgroundImage: STARS_LG, backgroundSize: "520px 520px", willChange: "transform" }}
        className="absolute -inset-[20%]" />

      {/* shooting star (desktop only) */}
      {!lite && (
        <motion.div
          className="absolute h-px w-40 rounded-full bg-gradient-to-r from-transparent via-white to-transparent"
          style={{ top: "12%", left: "-12%", rotate: 18 }}
          animate={{ x: ["0vw", "130vw"], opacity: [0, 0, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 9, ease: "easeOut", times: [0, 0.6, 0.8, 1] }}
        />
      )}

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(130%_90%_at_50%_0%,transparent_45%,rgba(4,6,15,0.92)_100%)]" />
    </div>
  );
}
