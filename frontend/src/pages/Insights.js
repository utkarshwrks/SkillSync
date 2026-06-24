import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import client from "../api/client";
import Loader from "../components/Loader";
import Icon from "../components/Icon";

const money = (n) => (n ? `$${Math.round(n / 1000)}k` : "—");

// A horizontal demand bar for a single skill.
function SkillBar({ name, share, salary, highlight }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`w-28 shrink-0 truncate text-sm font-semibold ${
          highlight ? "text-white" : "text-slate-300"
        }`}
      >
        {name}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-brand-gradient"
          style={{ width: `${Math.min(share, 100)}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-xs text-slate-400">
        {share?.toFixed(0)}%
      </span>
      <span className="w-12 shrink-0 text-right text-xs text-slate-500">
        {money(salary)}
      </span>
    </div>
  );
}

export default function Insights() {
  const [tab, setTab] = useState("pricing");
  const [stats, setStats] = useState(null);
  const [reverse, setReverse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [s, r] = await Promise.all([
        client.get("/jobs/skill-stats/"),
        client.get("/jobs/reverse-match/"),
      ]);
      setStats(s.data);
      setReverse(r.data);
      if (r.data.detail) setMessage(r.data.detail);
    } catch (e) {
      setMessage("Could not load market data. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-rise-in">
      <h1 className="group flex items-center gap-3 font-display text-3xl font-bold text-white">
        <span className="icon-badge h-11 w-11"><Icon name="insights" className="h-5 w-5" /></span>
        Skill Intelligence
      </h1>
      <p className="mt-2 text-slate-400">
        Live demand &amp; pay computed from real job listings — and the jobs
        you&apos;re just one skill away from.
      </p>

      <div className="mt-6 inline-flex flex-wrap rounded-xl border border-white/10 bg-white/5 p-1">
        {[
          ["pricing", "Skill pricing", "pricing"],
          ["reverse", "One skill away", "target"],
          ["salary", "Salary explorer", "salary"],
        ].map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              tab === key ? "bg-brand-gradient text-white shadow-glow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon name={icon} className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Reading the job market…" />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === "pricing" ? (
              <PricingTab stats={stats} />
            ) : tab === "salary" ? (
              <SalaryTab stats={stats} />
            ) : (
              <ReverseTab reverse={reverse} message={message} />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function MemberSalary({ stats }) {
  const [data, setData] = useState(null);
  const [amount, setAmount] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const load = async () => {
    const res = await client.get("/jobs/salary/");
    setData(res.data);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const submit = async () => {
    const amt = parseInt(amount, 10);
    if (!amt) return;
    setBusy(true);
    try {
      // Tie the offer to the user's own skills — that's what makes the data
      // useful (pay per skill), while staying anonymous in aggregate.
      const skills = (stats?.your_skills || []).map((s) => s.name);
      await client.post("/jobs/salary/", { amount: amt, role_title: role, skills });
      setAmount(""); setRole(""); setDone(true);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h2 className="font-display text-lg font-bold text-white">
        Real offers from members
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Anonymous, member-reported pay — richer than scraped listings. Add yours
        to make it better for everyone.
      </p>

      {data?.ready ? (
        <>
          <div className="mt-4 flex flex-wrap gap-6">
            <div>
              <div className="font-display text-2xl font-bold text-emerald-300">
                ${Math.round(data.overall_median / 1000)}k
              </div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500">median</div>
            </div>
            <div className="text-sm text-slate-500 self-end">
              from {data.sample_size} reports · ${Math.round(data.overall_min / 1000)}k–${Math.round(data.overall_max / 1000)}k range
            </div>
          </div>
          {data.by_skill.length > 0 && (
            <div className="mt-5 space-y-2">
              {data.by_skill.map((b) => (
                <div key={b.skill} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{b.skill}</span>
                  <span className="text-emerald-300">
                    ${Math.round(b.median / 1000)}k
                    <span className="ml-1 text-xs text-slate-500">· {b.samples}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          {data?.detail || "Loading…"}
        </p>
      )}

      {/* Contribute */}
      <div className="mt-6 border-t border-white/10 pt-4">
        {done ? (
          <p className="text-sm text-emerald-300">✓ Added — thank you for contributing.</p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="input sm:w-40" type="number" placeholder="Annual $ (e.g. 120000)"
              value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input className="input flex-1" placeholder="Role (optional)"
              value={role} onChange={(e) => setRole(e.target.value)} />
            <button onClick={submit} disabled={busy || !amount} className="btn-primary">
              {busy ? "Adding…" : "Add anonymously"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SalaryTab({ stats }) {
  if (!stats) return null;
  // Build a salary-ranked list from every skill we have pay data for.
  const all = [
    ...(stats.your_skills || []),
    ...(stats.top_skills || []),
    ...(stats.missing_in_demand || []),
  ];
  const seen = new Set();
  const paid = all
    .filter((s) => {
      if (!s.avg_salary || seen.has(s.name)) return false;
      seen.add(s.name);
      return true;
    })
    .sort((a, b) => b.avg_salary - a.avg_salary);

  const max = paid.length ? paid[0].avg_salary : 0;

  return (
    <div className="mt-8 space-y-6">
      <MemberSalary stats={stats} />

      {!paid.length ? (
        <div className="card text-center text-slate-400">
          No listing-based salary data yet — most free listings omit pay. The
          member offers above are the richer source.
        </div>
      ) : (
        <div className="card">
          <h2 className="font-display text-lg font-bold text-white">
            Skills ranked by pay (from listings)
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Average annual salary parsed from listings that disclose it.
          </p>
          <div className="mt-5 space-y-3">
            {paid.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-sm font-semibold text-slate-300">
                  {s.name}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-brand-gradient"
                    style={{ width: `${Math.round((s.avg_salary / max) * 100)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-sm text-emerald-300">
                  ${Math.round(s.avg_salary / 1000)}k
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PricingTab({ stats }) {
  if (!stats) return null;
  const your = stats.your_skills || [];
  const missing = stats.missing_in_demand || [];
  const top = stats.top_skills || [];

  return (
    <div className="mt-8 space-y-8">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Skill · demand (% of jobs) · avg pay</span>
        {stats.updated_at && (
          <span>Updated {new Date(stats.updated_at).toLocaleDateString()}</span>
        )}
      </div>

      {your.length > 0 && (
        <section className="card">
          <h2 className="font-display text-lg font-bold text-white">
            Your skills, ranked by demand
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            How sought-after your resume&apos;s skills are right now.
          </p>
          <div className="mt-5 space-y-3">
            {your.map((s) => (
              <SkillBar key={s.name} {...s} highlight />
            ))}
          </div>
        </section>
      )}

      {missing.length > 0 && (
        <section className="card">
          <h2 className="font-display text-lg font-bold text-white">
            In-demand skills you&apos;re missing
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Learning these would unlock the most listings.
          </p>
          <div className="mt-5 space-y-3">
            {missing.map((s) => (
              <SkillBar key={s.name} {...s} />
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h2 className="font-display text-lg font-bold text-white">
          Top skills across the market
        </h2>
        <div className="mt-5 space-y-3">
          {top.map((s) => (
            <SkillBar key={s.name} {...s} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ReverseTab({ reverse, message }) {
  if (!reverse) return null;
  const results = reverse.results || [];

  if (!results.length) {
    return (
      <div className="mt-8 card text-center text-slate-400">
        {message || "No 'one skill away' matches right now — check back later."}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <p className="text-sm text-slate-400">
        You already match most of what these roles want. Add one skill and you
        qualify.
      </p>
      {results.map((job, i) => (
        <div key={`${job.url}-${i}`} className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                className="font-display text-lg font-bold text-white hover:underline"
              >
                {job.title}
              </a>
              <p className="text-sm text-slate-400">
                {job.company} · {job.location} · {job.source}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">You have:</span>
            {job.matched_skills?.map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
            <span className="text-xs font-semibold text-amber-300">
              Learn to qualify:
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {(job.missing_skill_stats?.length
                ? job.missing_skill_stats
                : (job.missing_skills || []).map((name) => ({ name }))
              ).map((s) => (
                <span
                  key={s.name}
                  className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-200"
                >
                  {s.name}
                  {s.share != null && (
                    <span className="ml-1 text-amber-300/70">
                      · in {s.share.toFixed(0)}% of jobs
                      {s.avg_salary ? ` · ${money(s.avg_salary)}` : ""}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
