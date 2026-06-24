import React, { useCallback, useEffect, useState } from "react";
import client from "../api/client";
import Icon from "./Icon";

export default function VersionsPanel({ resumeId, content }) {
  const [versions, setVersions] = useState([]);
  const [label, setLabel] = useState("");
  const [tailoredFor, setTailoredFor] = useState("");
  const [saving, setSaving] = useState(false);
  const [a, setA] = useState("");
  const [b, setB] = useState("current");
  const [diff, setDiff] = useState(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [error, setError] = useState("");

  const loadVersions = useCallback(async () => {
    if (!resumeId) return;
    const res = await client.get(`/resumes/${resumeId}/versions/`);
    setVersions(res.data);
    if (res.data.length && !a) setA(String(res.data[0].id));
  }, [resumeId, a]);

  useEffect(() => { loadVersions(); }, [loadVersions]);

  // Reset selections when switching resumes.
  useEffect(() => { setA(""); setB("current"); setDiff(null); }, [resumeId]);

  const saveVersion = async () => {
    if (!resumeId) return;
    setSaving(true);
    setError("");
    try {
      await client.post(`/resumes/${resumeId}/versions/`, {
        label: label.trim(),
        tailored_for: tailoredFor.trim(),
        content,
      });
      setLabel("");
      setTailoredFor("");
      await loadVersions();
    } catch (_) {
      setError("Could not save this version.");
    } finally {
      setSaving(false);
    }
  };

  const compare = async () => {
    if (!a) return;
    setLoadingDiff(true);
    setError("");
    try {
      const params = { a };
      if (b && b !== "current") params.b = b;
      const res = await client.get(`/resumes/${resumeId}/versions/diff/`, { params });
      setDiff(res.data);
    } catch (_) {
      setError("Could not compute the diff.");
    } finally {
      setLoadingDiff(false);
    }
  };

  const label_of = (v) => v.label || `version ${v.id}`;

  if (!resumeId) return null;

  return (
    <div className="card">
      <h3 className="group flex items-center gap-2.5 font-display font-bold text-white">
        <span className="icon-badge"><Icon name="versions" /></span>
        Version history
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Snapshot a tailored copy, then diff versions to see exactly what changed.
      </p>

      {/* Save a new version */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <input className="input" placeholder="Label (e.g. Backend roles)"
          value={label} onChange={(e) => setLabel(e.target.value)} />
        <input className="input" placeholder="Tailored for (e.g. Acme – Django Dev)"
          value={tailoredFor} onChange={(e) => setTailoredFor(e.target.value)} />
      </div>
      <button onClick={saveVersion} disabled={saving} className="btn-primary mt-3 !py-1.5 text-sm">
        {saving ? "Saving…" : "Save current as version"}
      </button>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {/* Version list */}
      {versions.length > 0 && (
        <ul className="mt-5 space-y-1">
          {versions.map((v) => (
            <li key={v.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
              <span className="truncate">
                {label_of(v)}
                {v.tailored_for && <span className="text-slate-500"> · {v.tailored_for}</span>}
              </span>
              <span className="ml-2 shrink-0 text-xs text-slate-500">
                {new Date(v.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Compare controls */}
      {versions.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Compare</span>
          <select className="input !py-1.5 !w-auto" value={a} onChange={(e) => setA(e.target.value)}>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>{label_of(v)}</option>
            ))}
          </select>
          <span className="text-slate-500">with</span>
          <select className="input !py-1.5 !w-auto" value={b} onChange={(e) => setB(e.target.value)}>
            <option value="current">current (editing)</option>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>{label_of(v)}</option>
            ))}
          </select>
          <button onClick={compare} disabled={loadingDiff} className="btn-ghost !py-1.5">
            {loadingDiff ? "Diffing…" : "Compare"}
          </button>
        </div>
      )}

      {/* Diff output */}
      {diff && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-night-950/60 p-3 font-mono text-[12px] leading-relaxed">
          <div className="mb-2 text-slate-500">
            {diff.from} → {diff.to}
          </div>
          {diff.lines.length === 0 ? (
            <div className="text-slate-500">No differences.</div>
          ) : (
            diff.lines.map((l, i) => (
              <div
                key={i}
                className={
                  l.type === "add"
                    ? "text-emerald-300"
                    : l.type === "remove"
                    ? "text-red-300"
                    : "text-slate-500"
                }
              >
                {l.text || " "}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
