import React from "react";

export default function Loader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-brand-400" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
