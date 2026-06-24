import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";
import Loader from "../components/Loader";

const money = (n) => (n ? `$${Math.round(n / 1000)}k` : null);

export default function PublicProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    client
      .get(`/auth/profile/${username}/`)
      .then((r) => setData(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <Loader label="Loading profile…" />;

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Profile not found</h1>
        <Link to="/" className="btn-primary mt-6 inline-block">Go home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="card text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-brand-gradient font-display text-3xl font-bold text-white shadow-glow">
          {data.name?.[0]?.toUpperCase() || "?"}
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-white">{data.name}</h1>
        <p className="mt-1 text-slate-400">
          @{data.username} · {data.skill_count} skills ·
          {" "}joined {new Date(data.joined).getFullYear()}
        </p>
        {data.verified_count > 0 && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            ✓ {data.verified_count} verified skills
          </span>
        )}
      </div>

      <div className="mt-6 card">
        <h2 className="font-display text-lg font-bold text-white">Skills</h2>
        <p className="mt-1 text-sm text-slate-500">
          With live market demand from real job listings.
        </p>
        {data.skills.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No skills published yet.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.skills.map((s) => (
              <span
                key={s.name}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  s.verified
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                {s.verified && <span className="mr-1">✓</span>}
                {s.name}
                {s.share != null && (
                  <span className="ml-1.5 text-xs text-brand-300">
                    {s.share.toFixed(0)}%
                    {money(s.avg_salary) ? ` · ${money(s.avg_salary)}` : ""}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Built with{" "}
        <Link to="/" className="text-brand-300 hover:underline">SkillSync</Link>
      </p>
    </div>
  );
}
