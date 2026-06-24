import React, { useCallback, useEffect, useState } from "react";
import client from "../api/client";
import Icon from "./Icon";

const tone = (s) =>
  s >= 75 ? "#34d399" : s >= 50 ? "#818cf8" : "#fbbf24";

// A labelled horizontal gauge for one lens (ATS or recruiter).
function Gauge({ label, score, hint }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-200">{label}</span>
        <span className="font-display text-xl font-bold" style={{ color: tone(score) }}>
          {score}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, background: tone(score), transition: "width 0.8s ease" }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default function QualityPanel({ resumeId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!resumeId) return;
    setLoading(true);
    setError("");
    try {
      const res = await client.get(`/resumes/${resumeId}/quality/`);
      setData(res.data);
    } catch (_) {
      setError("Could not load the quality report.");
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => { load(); }, [load]);

  if (!resumeId) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="group flex items-center gap-2.5 font-display font-bold text-white">
          <span className="icon-badge"><Icon name="quality" /></span>
          Resume quality check
        </h3>
        <button
          onClick={load}
          disabled={loading}
          className="text-sm font-semibold text-brand-300 hover:text-brand-200 disabled:opacity-40"
        >
          {loading ? "Checking…" : "Re-check"}
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Scored two ways — most tools only optimise for ATS, which can make a
        resume robots love but recruiters skim past.
      </p>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {data && (
        <>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Gauge label="ATS (machine) match" score={data.ats_score}
              hint="Keyword coverage & parseable structure" />
            <Gauge label="Recruiter readability" score={data.recruiter_score}
              hint="Action verbs, impact & a human-friendly read" />
          </div>

          {(data.conflicts || []).length > 0 && (
            <div className="mt-5 space-y-2">
              {data.conflicts.map((c, i) => (
                <div key={i} className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-200">
                  ⚠ {c}
                </div>
              ))}
            </div>
          )}

          {(data.ats_notes || []).length + (data.recruiter_notes || []).length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(data.ats_notes || []).length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Improve ATS
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {data.ats_notes.map((n, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-400">
                        <span className="text-brand-300">▸</span><span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(data.recruiter_notes || []).length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Improve readability
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {data.recruiter_notes.map((n, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-400">
                        <span className="text-brand-300">▸</span><span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {(data.metric_prompts || []).length > 0 && (
            <div className="mt-6">
              <h4 className="font-display font-bold text-white">Add real numbers</h4>
              <p className="mt-1 text-sm text-slate-500">
                We never invent metrics — answer these with your own numbers to
                make each bullet land.
              </p>
              <div className="mt-3 space-y-3">
                {data.metric_prompts.map((p, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-sm text-slate-300">“{p.bullet}”</p>
                    <p className="mt-1.5 text-sm font-medium text-brand-200">❓ {p.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
