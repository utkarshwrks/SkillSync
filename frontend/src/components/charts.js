import React from "react";
import { motion } from "framer-motion";
import CountUp from "./CountUp";

/* Shared SVG gradient defs (referenced by id across charts). */
export function ChartDefs() {
  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="sk-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="55%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="sk-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Radial progress ring with a count-up center value. */
export function RadialScore({ value = 82, size = 132, stroke = 11, label = "Match", suffix = "" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#sk-grad)"
          strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - value / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="stat-num text-3xl font-bold text-white">
          <CountUp value={value} suffix={suffix} />
        </div>
        <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">{label}</div>
      </div>
    </div>
  );
}

/* Animated horizontal meter row. */
export function BarMeter({ label, value, max = 100, valueLabel, accent = "url(#sk-grad)", delay = 0 }) {
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="stat-num text-slate-400">{valueLabel}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
        />
      </div>
    </div>
  );
}

/* Smooth area/line trend from a list of numbers. */
export function AreaTrend({ points = [], width = 320, height = 96 }) {
  if (points.length < 2) return null;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const stepX = width / (points.length - 1);
  const xy = points.map((p, i) => [i * stepX, height - ((p - min) / span) * (height - 12) - 6]);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <motion.path
        d={area} fill="url(#sk-area)"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      <motion.path
        d={line} fill="none" stroke="url(#sk-grad)" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx={xy[xy.length - 1][0]} cy={xy[xy.length - 1][1]} r="4" fill="#0EA5E9"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ delay: 1.3, type: "spring", stiffness: 300 }}
      />
    </svg>
  );
}

/* Tiny inline sparkline (no axes) for compact trend hints. */
export function Sparkline({ points = [], width = 96, height = 28, stroke = "#0EA5E9" }) {
  if (points.length < 2) return null;
  const min = Math.min(...points), max = Math.max(...points), span = max - min || 1;
  const stepX = width / (points.length - 1);
  const d = points
    .map((p, i) => `${i ? "L" : "M"}${(i * stepX).toFixed(1)},${(height - ((p - min) / span) * (height - 4) - 2).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <motion.path
        d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

/* Compact hiring-funnel bars (applied → interview → offer). */
export function Funnel({ steps = [] }) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: 72 }}>
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-1 flex-col items-center justify-end gap-1.5">
          <motion.div
            className="w-full rounded-md bg-gradient-to-t from-[#2563EB]/80 to-[#0EA5E9]/80"
            initial={{ height: 0 }}
            whileInView={{ height: `${(s.value / max) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ minHeight: 6 }}
          />
          <span className="text-[10px] text-slate-500">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
