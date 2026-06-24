import React, { useEffect, useState } from "react";
import client from "../api/client";
import Loader from "../components/Loader";
import Icon from "../components/Icon";
import CountUp from "../components/CountUp";

// Active pipeline shown as board columns.
const COLUMNS = [
  ["saved", "Saved"],
  ["applied", "Applied"],
  ["interview", "Interviewing"],
  ["offer", "Offer"],
  ["hired", "Hired"],
];
const NEXT = { saved: "applied", applied: "interview", interview: "offer", offer: "hired" };
const LABEL = Object.fromEntries(COLUMNS);

function Funnel({ stats }) {
  if (!stats || stats.totals.tracked === 0) return null;
  const { totals, rates, skill_conversion } = stats;
  const cell = (label, value, suffix = "") => (
    <div className="text-center">
      <div className="stat-num text-2xl font-bold text-white">
        <CountUp value={value} suffix={suffix} />
      </div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
  return (
    <div className="mt-8 card">
      <h2 className="font-display text-lg font-bold text-white">Your funnel</h2>
      <p className="mt-1 text-sm text-slate-500">
        The more outcomes you log, the smarter your insights get.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-6">
        {cell("Applied", totals.applied)}
        {cell("Interviews", totals.interviews)}
        {cell("Offers", totals.offers)}
        {cell("Hired", totals.hired)}
        {cell("Response %", rates.response_rate, "%")}
        {cell("Ghosted", totals.ghosted)}
      </div>
      {skill_conversion.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Which of your skills convert best
          </h3>
          <div className="mt-3 space-y-2">
            {skill_conversion.slice(0, 6).map((s) => (
              <div key={s.skill} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-sm text-slate-300">{s.skill}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-brand-gradient"
                    style={{ width: `${s.response_rate}%` }} />
                </div>
                <span className="w-28 shrink-0 text-right text-xs text-slate-500">
                  {s.responded}/{s.applied} · {s.response_rate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Tracker() {
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    const res = await client.get("/jobs/applications/stats/");
    setStats(res.data);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await client.get("/jobs/applications/");
      setApps(res.data);
      await loadStats();
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const update = async (id, patch) => {
    const res = await client.patch(`/jobs/applications/${id}/`, patch);
    setApps((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    loadStats();
  };

  const remove = async (id) => {
    await client.delete(`/jobs/applications/${id}/`);
    setApps((prev) => prev.filter((a) => a.id !== id));
    loadStats();
  };

  const byStatus = (s) => apps.filter((a) => a.status === s);
  const closed = apps.filter((a) => a.status === "rejected" || a.status === "ghosted");

  const Card = ({ a, closedView }) => (
    <div className="rounded-xl border border-white/10 bg-night-900/60 p-3">
      <a href={a.url} target="_blank" rel="noreferrer"
        className="text-sm font-semibold text-white hover:underline">{a.title}</a>
      <p className="mt-0.5 text-xs text-slate-400">{a.company}</p>
      {(a.matched_skills || []).length > 0 && (
        <p className="mt-1 text-[11px] text-emerald-300/80">★ {a.matched_skills.length} skill match</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {!closedView && NEXT[a.status] && (
          <button onClick={() => update(a.id, { status: NEXT[a.status] })}
            className="rounded-lg border border-white/15 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:border-brand-400/40 hover:text-white">
            → {LABEL[NEXT[a.status]]}
          </button>
        )}
        {!closedView && (
          <>
            <button onClick={() => update(a.id, { status: "rejected" })}
              className="rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:text-red-300">Rejected</button>
            <button onClick={() => update(a.id, { status: "ghosted" })}
              className="rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:text-amber-300">Ghosted</button>
          </>
        )}
        {closedView && (
          <span className={`rounded-lg px-2 py-0.5 text-[11px] ${
            a.status === "rejected" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"}`}>
            {a.status}
          </span>
        )}
        <button onClick={() => remove(a.id)}
          className="ml-auto rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:text-red-300" title="Remove">✕</button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-rise-in">
      <h1 className="flex items-center gap-3 font-display text-3xl font-bold text-white">
        <span className="icon-badge h-11 w-11"><Icon name="tracker" className="h-5 w-5" /></span>
        Application tracker
      </h1>
      <p className="mt-2 text-slate-400">
        Track every job and log the real outcome — that&apos;s what powers your
        personal insights.
      </p>

      {loading ? (
        <Loader label="Loading your applications…" />
      ) : apps.length === 0 ? (
        <div className="mt-8 card text-center text-slate-400">
          Nothing tracked yet — hit “+ Track” on any job in the Jobs tab.
        </div>
      ) : (
        <>
          <Funnel stats={stats} />

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {COLUMNS.map(([key, label]) => {
              const items = byStatus(key);
              return (
                <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-white">{label}</h3>
                    <span className="text-xs text-slate-500">{items.length}</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {items.map((a) => <Card key={a.id} a={a} />)}
                  </div>
                </div>
              );
            })}
          </div>

          {closed.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-400">
                Closed ({closed.length})
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {closed.map((a) => <Card key={a.id} a={a} closedView />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
