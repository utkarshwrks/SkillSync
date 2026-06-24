import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import client from "../api/client";
import QualityPanel from "../components/QualityPanel";
import VersionsPanel from "../components/VersionsPanel";
import Icon from "../components/Icon";
import CountUp from "../components/CountUp";

function ScoreRing({ score }) {
  const color = score >= 75 ? "#34d399" : score >= 50 ? "#818cf8" : "#fbbf24";
  const R = 48;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative grid h-28 w-28 place-items-center">
      <svg className="h-28 w-28 -rotate-90">
        <circle cx="56" cy="56" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
        <circle
          cx="56" cy="56" r={R} stroke={color} strokeWidth="10" fill="none"
          strokeLinecap="round" strokeDasharray={C}
          strokeDashoffset={C * (1 - score / 100)}
          style={{ transition: "stroke-dashoffset 0.9s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="stat-num text-2xl font-extrabold text-white">
          <CountUp value={score} />
        </div>
        <div className="text-[10px] uppercase tracking-wide text-slate-500">score</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [resume, setResume] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState("modern");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [content, setContent] = useState("");
  const [appliedFixes, setAppliedFixes] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [section, setSection] = useState("fixes");
  const fileRef = useRef(null);

  useEffect(() => {
    client.get("/resumes/").then((r) => {
      setResumes(r.data);
      if (r.data.length) selectResume(r.data[0]);
    });
    client.get("/resumes/templates/").then((r) => setTemplates(r.data.templates));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectResume = (r) => {
    setResume(r);
    setContent(r.content || r.improved_resume || r.original_text || "");
    setAppliedFixes([]);
    setDirty(false);
    setSavedAt(false);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setUploading(true);
    const data = new FormData();
    data.append("resume", file);
    try {
      const res = await client.post("/resumes/upload/", data);
      setResumes((prev) => [res.data, ...prev]);
      selectResume(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Try a PDF, DOCX or TXT.");
    } finally {
      setUploading(false);
    }
  };

  const applyFix = (fix, idx) => {
    setContent((prev) => {
      if (fix.original && prev.includes(fix.original)) {
        return prev.replace(fix.original, fix.improved);
      }
      return prev ? `${prev}\n${fix.improved}` : fix.improved;
    });
    setAppliedFixes((prev) => [...prev, idx]);
    setDirty(true);
  };

  const applyAll = () => {
    if (!resume?.fixes) return;
    let next = content;
    resume.fixes.forEach((fix) => {
      if (fix.original && next.includes(fix.original)) next = next.replace(fix.original, fix.improved);
      else next = next ? `${next}\n${fix.improved}` : fix.improved;
    });
    setContent(next);
    setAppliedFixes(resume.fixes.map((_, i) => i));
    setDirty(true);
  };

  const save = async () => {
    if (!resume) return;
    await client.patch(`/resumes/${resume.id}/`, { content });
    setDirty(false);
    setSavedAt(true);
    setTimeout(() => setSavedAt(false), 2500);
  };

  const exportPdf = async () => {
    if (!resume) return;
    setExporting(true);
    try {
      const res = await client.post(
        `/resumes/${resume.id}/export/`,
        { template, name, contact, content },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_${template}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (_) {
      setError("Could not export PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-rise-in">
      <h1 className="flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-white">
        <span className="icon-badge h-11 w-11"><Icon name="dashboard" className="h-5 w-5" /></span>
        Your dashboard
      </h1>
      <p className="mt-2 text-slate-400">
        Upload a resume, apply fixes directly to it, and export a polished PDF.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Upload + history */}
        <div className="space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            className={`card flex flex-col items-center justify-center border-2 border-dashed py-10 text-center transition ${
              dragOver ? "border-brand-400 bg-brand-500/10" : "border-white/15"
            }`}
          >
            <div className="text-4xl">📄</div>
            <p className="mt-3 font-semibold text-slate-200">
              {uploading ? "Analysing…" : "Drop your resume here"}
            </p>
            <p className="text-xs text-slate-500">PDF, DOCX or TXT · max 5 MB</p>
            <button className="btn-primary mt-4" onClick={() => fileRef.current.click()} disabled={uploading}>
              Choose file
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>

          {resumes.length > 0 && (
            <div className="card">
              <h3 className="font-display font-bold text-white">History</h3>
              <ul className="mt-3 space-y-1">
                {resumes.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => selectResume(r)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                        resume?.id === r.id ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate">{r.filename}</span>
                      <span className="ml-2 shrink-0 text-xs text-slate-500">{r.score}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Analysis */}
        <div className="lg:col-span-2">
          {!resume ? (
            <div className="card flex h-full min-h-[300px] items-center justify-center text-center text-slate-500">
              Upload a resume to see your analysis here.
            </div>
          ) : (
            <motion.div key={resume.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="card flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <ScoreRing score={resume.score || 0} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-white">Overall assessment</h3>
                    <span className="chip">{resume.source === "gemini" ? "AI" : "Offline"}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{resume.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(resume.skills || []).map((s) => <span key={s} className="chip">{s}</span>)}
                  </div>
                </div>
              </div>

              {/* Section tabs — keeps the analysis from being one giant scroll */}
              <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                {[
                  ["fixes", "Fixes", "metric"],
                  ["quality", "Quality", "quality"],
                  ["editor", "Editor", "doc"],
                  ["export", "Export", "upload"],
                ].map(([key, label, icon]) => (
                  <button
                    key={key}
                    onClick={() => setSection(key)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      section === key ? "bg-brand-gradient text-white shadow-glow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon name={icon} className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* ---- FIXES + advice ---- */}
              {section === "fixes" && (resume.fixes || []).length > 0 && (
                <div className="card">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-white">Suggested fixes</h3>
                    <button onClick={applyAll} className="text-sm font-semibold text-brand-300 hover:text-brand-200">
                      Apply all
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Apply edits straight into your resume below, then export.
                  </p>
                  <div className="mt-4 space-y-3">
                    {resume.fixes.map((fix, i) => {
                      const done = appliedFixes.includes(i);
                      return (
                        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          {fix.original && (
                            <p className="text-sm text-slate-500 line-through decoration-red-400/40">
                              {fix.original}
                            </p>
                          )}
                          <p className="mt-1 text-sm font-medium text-emerald-300">{fix.improved}</p>
                          {fix.reason && <p className="mt-1 text-xs text-slate-500">💡 {fix.reason}</p>}
                          <button
                            onClick={() => applyFix(fix, i)}
                            disabled={done}
                            className={`mt-2 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                              done ? "bg-emerald-500/15 text-emerald-300" : "btn-primary !px-3 !py-1"
                            }`}
                          >
                            {done ? "✓ Applied" : "Apply fix"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---- QUALITY ---- */}
              {section === "quality" && <QualityPanel resumeId={resume.id} />}

              {/* Suggestions (shown under Fixes) */}
              {section === "fixes" && (resume.suggestions || []).length > 0 && (
                <div className="card">
                  <h3 className="font-display font-bold text-white">General advice</h3>
                  <ul className="mt-3 space-y-2">
                    {resume.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-400">
                        <span className="text-brand-300">▸</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ---- EDITOR + versions ---- */}
              {section === "editor" && (
                <>
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-white">Edit your resume</h3>
                  <div className="flex items-center gap-3">
                    <AnimatePresence>
                      {savedAt && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-xs text-emerald-300">✓ Saved</motion.span>
                      )}
                    </AnimatePresence>
                    <button onClick={save} disabled={!dirty} className="btn-ghost !py-1.5 text-sm disabled:opacity-40">
                      Save
                    </button>
                  </div>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => { setContent(e.target.value); setDirty(true); }}
                  spellCheck={false}
                  className="input mt-3 h-72 resize-y whitespace-pre font-mono text-[13px] leading-relaxed"
                />
              </div>

              {/* Version history + diff */}
              <VersionsPanel resumeId={resume.id} content={content} />
                </>
              )}

              {/* ---- EXPORT ---- */}
              {section === "export" && (
              <div className="card">
                <h3 className="font-display font-bold text-white">Export as PDF</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a template and download a clean, ATS-friendly PDF.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input className="input" placeholder="Full name (PDF header)" value={name} onChange={(e) => setName(e.target.value)} />
                  <input className="input" placeholder="Contact line (email · links)" value={contact} onChange={(e) => setContact(e.target.value)} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button key={t.id} onClick={() => setTemplate(t.id)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        template === t.id ? "border-brand-400 bg-brand-500/15 text-white" : "border-white/15 text-slate-400 hover:border-white/30"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <button className="btn-primary mt-5" onClick={exportPdf} disabled={exporting}>
                  {exporting ? "Generating…" : "⬇ Download PDF"}
                </button>
              </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
