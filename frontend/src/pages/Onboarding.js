import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import client from "../api/client";
import Icon from "../components/Icon";
import { Button, Panel, Badge, ProgressStepper } from "../components/ui";
import { useToast } from "../components/Toast";

const STEPS = ["Upload resume", "Confirm skills", "Verify skills", "Target role"];

export default function Onboarding() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [skills, setSkills] = useState([]);
  const [busy, setBusy] = useState(false);
  const [ghUrl, setGhUrl] = useState("");
  const [verified, setVerified] = useState([]);
  const [role, setRole] = useState("");
  const fileRef = useRef(null);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const data = new FormData();
      data.append("resume", file);
      const res = await client.post("/resumes/upload/", data);
      setSkills(res.data.skills || []);
      toast("Resume analysed", "success");
      next();
    } catch (e) {
      toast(e.response?.data?.detail || "Upload failed — try PDF, DOCX or TXT.", "error");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!ghUrl.trim()) return next();
    setBusy(true);
    try {
      const res = await client.post("/auth/verify-skills/", { url: ghUrl.trim() });
      setVerified(res.data.verified_skills || []);
      toast(`Verified ${res.data.verified_skills?.length || 0} skills`, "success");
      next();
    } catch (e) {
      toast(e.response?.data?.detail || "Couldn't verify from that URL.", "error");
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    try {
      if (role.trim()) await client.patch("/auth/me/", { headline: role.trim() });
      toast("You're all set 🎉", "success");
      nav("/dashboard");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 animate-rise-in">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">Welcome to SkillSync</h1>
        <p className="mt-2 text-[#a1a1aa]">Four quick steps to your career intelligence profile.</p>
        <div className="mt-6"><ProgressStepper steps={STEPS} current={step} /></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* STEP 1 — upload */}
          {step === 0 && (
            <Panel className="flex flex-col items-center justify-center border-2 border-dashed border-white/15 py-14 text-center">
              <span className="icon-badge h-14 w-14"><Icon name="upload" className="h-6 w-6" /></span>
              <p className="mt-4 font-semibold text-white">{busy ? "Analysing…" : "Upload your resume"}</p>
              <p className="text-xs text-slate-500">PDF, DOCX or TXT · max 5 MB</p>
              <Button className="mt-5" loading={busy} onClick={() => fileRef.current.click()}>Choose file</Button>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
              <button onClick={() => nav("/dashboard")} className="mt-4 text-xs text-slate-500 hover:text-slate-300">Skip for now</button>
            </Panel>
          )}

          {/* STEP 2 — confirm skills */}
          {step === 1 && (
            <Panel className="p-7">
              <h2 className="font-display text-lg font-semibold text-white">We found these skills</h2>
              <p className="mt-1 text-sm text-[#a1a1aa]">Tap to remove any that don't fit.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.length === 0 && <p className="text-sm text-slate-500">No skills detected — you can add them later.</p>}
                {skills.map((s) => (
                  <button key={s} onClick={() => setSkills((x) => x.filter((y) => y !== s))} className="chip hover:border-red-400/40">
                    {s} <span className="ml-1 text-slate-500">✕</span>
                  </button>
                ))}
              </div>
              <div className="mt-7 flex justify-end"><Button onClick={next} icon="target">Looks good</Button></div>
            </Panel>
          )}

          {/* STEP 3 — verify */}
          {step === 2 && (
            <Panel className="p-7">
              <h2 className="font-display text-lg font-semibold text-white">Verify your skills</h2>
              <p className="mt-1 text-sm text-[#a1a1aa]">Paste your GitHub or portfolio to earn verified badges.</p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <input className="input flex-1" placeholder="https://github.com/yourname" value={ghUrl} onChange={(e) => setGhUrl(e.target.value)} />
                <Button loading={busy} onClick={verify} icon="verify">Verify</Button>
              </div>
              {verified.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {verified.map((s) => <Badge key={s} tone="verified" icon="verify">{s}</Badge>)}
                </div>
              )}
              <div className="mt-7 flex justify-between">
                <button onClick={next} className="text-sm text-slate-500 hover:text-slate-300">Skip</button>
                <Button variant="ghost" onClick={next}>Continue</Button>
              </div>
            </Panel>
          )}

          {/* STEP 4 — target role */}
          {step === 3 && (
            <Panel className="p-7">
              <h2 className="font-display text-lg font-semibold text-white">What role are you targeting?</h2>
              <p className="mt-1 text-sm text-[#a1a1aa]">We'll tune your matches and market data to it.</p>
              <input className="input mt-5" placeholder="e.g. Senior Backend Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
              <div className="mt-7 flex justify-end"><Button loading={busy} onClick={finish} icon="rocket">Finish setup</Button></div>
            </Panel>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
