import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./Icon";

/* =============================================================== Spinner */
export function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* =============================================================== Button */
const BTN = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  subtle:
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white active:scale-95",
};
export function Button({ variant = "primary", loading, icon, children, className = "", ...rest }) {
  return (
    <button className={`${BTN[variant] || BTN.primary} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Spinner /> : icon ? <Icon name={icon} className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

/* =============================================================== Panel */
export function Panel({ as: Tag = "div", hover = false, className = "", children, ...rest }) {
  return (
    <Tag className={`panel ${hover ? "panel-hover group" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* =============================================================== Badge */
const BADGE = {
  default: "border-white/10 bg-white/[0.06] text-slate-300",
  verified: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  violet: "border-[#2563EB]/30 bg-[#2563EB]/10 text-[#93C5FD]",
  warn: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  danger: "border-red-400/25 bg-red-400/10 text-red-300",
};
export function Badge({ tone = "default", icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${BADGE[tone]} ${className}`}>
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

/* =============================================================== Avatar */
export function Avatar({ name = "", size = 44, className = "" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-2xl bg-brand-gradient font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

/* =============================================================== Skeleton */
export function Skeleton({ className = "h-4 w-full" }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />;
}
export function SkeletonCard() {
  return (
    <div className="panel space-y-4 p-6">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

/* =============================================================== EmptyState */
export function EmptyState({ icon = "insights", title, body, action }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="icon-badge mb-4 h-12 w-12"><Icon name={icon} className="h-6 w-6" /></span>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm text-[#a1a1aa]">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* =============================================================== Tabs */
export function Tabs({ tabs, value, onChange, className = "" }) {
  return (
    <div className={`inline-flex flex-wrap rounded-xl border border-white/10 bg-white/[0.03] p-1 ${className}`} role="tablist">
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              active ? "bg-brand-gradient text-white shadow-glow" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.icon && <Icon name={t.icon} className="h-4 w-4" />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* =============================================================== Tooltip */
export function Tooltip({ label, children }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-night-800 px-2.5 py-1 text-xs text-slate-200 opacity-0 shadow-lg transition group-hover/tt:opacity-100">
        {label}
      </span>
    </span>
  );
}

/* =============================================================== ProgressStepper */
export function ProgressStepper({ steps, current }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < current, active = i === current;
        return (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <span
                className={`grid h-7 w-7 place-items-center rounded-full border text-xs font-semibold transition ${
                  done ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                  : active ? "border-[#2563EB]/50 bg-[#2563EB]/15 text-[#93C5FD]"
                  : "border-white/10 bg-white/[0.04] text-slate-500"
                }`}
              >
                {done ? <Icon name="verify" className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={`hidden text-sm sm:inline ${active ? "text-white" : "text-slate-500"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-px flex-1 ${done ? "bg-emerald-400/40" : "bg-white/10"}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* =============================================================== Modal */
export function Modal({ open, onClose, title, children, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="panel relative z-10 w-full max-w-md p-6"
          >
            {title && <h3 className="font-display text-lg font-bold text-white">{title}</h3>}
            <div className="mt-3 text-sm text-[#a1a1aa]">{children}</div>
            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
