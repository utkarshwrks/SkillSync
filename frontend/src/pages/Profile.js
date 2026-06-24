import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function Profile() {
  const { user, setUser } = useAuth();
  const profile = user?.profile || {};
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: profile.phone || "",
    headline: profile.headline || "",
    bio: profile.bio || "",
    github: profile.github || "",
    linkedin: profile.linkedin || "",
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // Skill verification (Seed 2)
  const [verifyUrl, setVerifyUrl] = useState(profile.github || "");
  const [verified, setVerified] = useState(profile.verified_skills || []);
  const [verifying, setVerifying] = useState(false);
  const [verifyErr, setVerifyErr] = useState("");

  const verify = async () => {
    if (!verifyUrl.trim()) return;
    setVerifying(true);
    setVerifyErr("");
    try {
      const res = await client.post("/auth/verify-skills/", { url: verifyUrl.trim() });
      setVerified(res.data.verified_skills);
    } catch (e) {
      setVerifyErr(e.response?.data?.detail || "Could not verify from that URL.");
    } finally {
      setVerifying(false);
    }
  };

  const update = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setSaved(false); };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await client.patch("/auth/me/", form);
      setUser(res.data);
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  const initials = (user?.username || "U").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 animate-rise-in">
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card h-fit text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-brand-gradient font-display text-3xl font-bold text-white shadow-glow">
            {initials}
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-white">
            {form.first_name || user?.username}
          </h2>
          <p className="text-sm text-slate-400">{form.headline || "Add a headline"}</p>
          <div className="mt-4 space-y-1 text-sm text-slate-400">
            {form.email && <p>✉ {form.email}</p>}
            {form.phone && <p>📞 {form.phone}</p>}
          </div>
          <div className="mt-3 flex justify-center gap-3 text-sm">
            {form.github && <a href={form.github} className="text-brand-300 hover:text-brand-200">GitHub</a>}
            {form.linkedin && <a href={form.linkedin} className="text-brand-300 hover:text-brand-200">LinkedIn</a>}
          </div>

          {/* Shareable public skill profile */}
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Your public profile
            </p>
            <a
              href={`/u/${user?.username}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block truncate text-sm text-brand-300 hover:text-brand-200"
            >
              /u/{user?.username}
            </a>
            <button
              onClick={() =>
                navigator.clipboard?.writeText(`${window.location.origin}/u/${user?.username}`)
              }
              className="btn-ghost mt-2 !py-1.5 text-xs"
            >
              Copy share link
            </button>
          </div>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={save} className="card md:col-span-2">
          <h1 className="font-display text-xl font-bold text-white">Edit profile</h1>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className="input" name="first_name" placeholder="First name" value={form.first_name} onChange={update} />
            <input className="input" name="last_name" placeholder="Last name" value={form.last_name} onChange={update} />
            <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={update} />
            <input className="input" name="phone" placeholder="Phone" value={form.phone} onChange={update} />
          </div>
          <input className="input mt-3" name="headline" placeholder="Headline (e.g. Frontend Developer)" value={form.headline} onChange={update} />
          <textarea className="input mt-3 h-24 resize-none" name="bio" placeholder="Short bio" value={form.bio} onChange={update} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input className="input" name="github" placeholder="GitHub URL" value={form.github} onChange={update} />
            <input className="input" name="linkedin" placeholder="LinkedIn URL" value={form.linkedin} onChange={update} />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
            {saved && <span className="text-sm text-emerald-300">✓ Saved</span>}
          </div>
        </motion.form>
      </div>

      {/* Skill verification (Seed 2) */}
      <div className="mt-6 card">
        <h2 className="font-display text-lg font-bold text-white">Verify your skills</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste your GitHub profile or portfolio — we&apos;ll confirm which
          skills are backed by real work and add a ✓ badge to your public profile.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            className="input flex-1"
            placeholder="https://github.com/yourname  or  https://yoursite.dev"
            value={verifyUrl}
            onChange={(e) => setVerifyUrl(e.target.value)}
          />
          <button onClick={verify} disabled={verifying} className="btn-primary">
            {verifying ? "Verifying…" : "Verify"}
          </button>
        </div>
        {verifyErr && <p className="mt-3 text-sm text-red-400">{verifyErr}</p>}
        {verified.length > 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Verified skills
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {verified.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-200">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
