import React, { useEffect, useState } from "react";
import client from "../api/client";
import JobCard from "../components/JobCard";
import Icon from "../components/Icon";
import { SkeletonCard, EmptyState } from "../components/ui";

const LOC_FILTERS = [
  ["all", "All"],
  ["india", "India"],
  ["remote", "Remote"],
];
const INDIA_HINTS = ["india", "bengaluru", "bangalore", "hyderabad", "pune", "mumbai", "delhi", "gurgaon", "noida", "chennai", "kolkata"];
function matchesLoc(job, f) {
  if (f === "all") return true;
  const loc = (job.location || "").toLowerCase();
  if (f === "remote") return /remote|anywhere|flexible/.test(loc);
  if (f === "india") return INDIA_HINTS.some((h) => loc.includes(h));
  return true;
}

export default function Jobs() {
  const [tab, setTab] = useState("recommended");
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tracked, setTracked] = useState(new Set());
  const [locFilter, setLocFilter] = useState("all");

  const summarise = (results) => {
    const set = [...new Set(results.map((j) => j.source))];
    setSources(set);
  };

  // Load which job URLs the user is already tracking, to mark cards.
  const loadTracked = async () => {
    try {
      const res = await client.get("/jobs/applications/");
      setTracked(new Set(res.data.map((a) => a.url)));
    } catch (_) { /* non-blocking */ }
  };

  const trackJob = async (job) => {
    try {
      await client.post("/jobs/applications/", {
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        source: job.source,
        matched_skills: job.matched_skills || [],
      });
      setTracked((prev) => new Set(prev).add(job.url));
    } catch (_) { /* ignore; button stays actionable */ }
  };

  const loadRecommended = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await client.get("/jobs/recommended/");
      setJobs(res.data.results);
      setSkills(res.data.skills_used || []);
      summarise(res.data.results);
      if (res.data.detail) setMessage(res.data.detail);
    } finally {
      setLoading(false);
    }
  };

  const search = async (e) => {
    e?.preventDefault();
    setTab("search");
    setLoading(true);
    setMessage("");
    try {
      const res = await client.get("/jobs/", { params: { q: query } });
      setJobs(res.data.results);
      setSkills(res.data.skills_used || []);
      summarise(res.data.results);
      if (!res.data.results.length) setMessage("No jobs found — try another keyword.");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadRecommended(); loadTracked(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-rise-in">
      <h1 className="flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-white">
        <span className="icon-badge h-11 w-11"><Icon name="jobs" className="h-5 w-5" /></span>
        Find your next role
      </h1>
      <p className="mt-2 text-slate-400">
        Aggregated live from Remotive, Jobicy, RemoteOK, Arbeitnow, Himalayas,
        Adzuna (India) &amp; The Muse — ranked to your resume.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => { setTab("recommended"); loadRecommended(); }}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              tab === "recommended" ? "bg-brand-gradient text-white" : "text-slate-400"
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setTab("search")}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              tab === "search" ? "bg-brand-gradient text-white" : "text-slate-400"
            }`}
          >
            Search
          </button>
        </div>

        {tab === "search" && (
          <form onSubmit={search} className="flex flex-1 gap-2">
            <input className="input" placeholder="e.g. python, react, data analyst…"
              value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className="btn-primary">Search</button>
          </form>
        )}

        {/* Location filter */}
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          {LOC_FILTERS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setLocFilter(key)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
                locFilter === key ? "bg-brand-gradient text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {(skills.length > 0 || sources.length > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {skills.length > 0 && <span>Matching on:</span>}
          {skills.slice(0, 8).map((s) => <span key={s} className="chip">{s}</span>)}
          {sources.length > 0 && (
            <span className="ml-2 text-slate-600">· {jobs.length} roles from {sources.length} boards</span>
          )}
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (() => {
        const visible = jobs.filter((j) => matchesLoc(j, locFilter));
        if (!visible.length) {
          return (
            <div className="mt-8">
              <EmptyState
                icon="jobs"
                title={message || (locFilter !== "all" ? `No ${locFilter} roles in this batch` : "No jobs found")}
                body={locFilter !== "all" ? "Try the “All” filter, or search a different keyword." : "Try another keyword or upload a resume for tailored matches."}
              />
            </div>
          );
        }
        return (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((job, i) => (
              <JobCard
                key={`${job.url}-${i}`}
                job={job}
                onTrack={trackJob}
                tracked={tracked.has(job.url)}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
}
