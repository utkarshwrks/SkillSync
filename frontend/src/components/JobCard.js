import React from "react";
import { motion } from "framer-motion";

export default function JobCard({ job, onTrack, tracked }) {
  const handleTrack = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tracked && onTrack) onTrack(job);
  };

  return (
    <motion.a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card group relative flex flex-col gap-3 overflow-hidden transition hover:border-brand-400/40 hover:shadow-glow"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-white">{job.title}</h3>
          <p className="text-sm text-slate-400">
            {job.company} · {job.location}
          </p>
        </div>
        {(job.matched_skills || []).length > 0 && (
          <span className="chip whitespace-nowrap border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
            ★ {job.matched_skills.length} match
          </span>
        )}
      </div>

      {job.description && (
        <p className="line-clamp-3 text-sm text-slate-400">{job.description}</p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <span className="chip border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          {job.source}
        </span>
        {(job.matched_skills || []).slice(0, 4).map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
        {onTrack && (
          <button
            onClick={handleTrack}
            disabled={tracked}
            className={`ml-auto rounded-lg px-3 py-1 text-xs font-semibold transition ${
              tracked
                ? "bg-emerald-500/15 text-emerald-300"
                : "border border-white/15 text-slate-300 hover:border-brand-400/40 hover:text-white"
            }`}
          >
            {tracked ? "✓ Tracking" : "+ Track"}
          </button>
        )}
      </div>
    </motion.a>
  );
}
