import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";
import { ChartDefs, BarMeter } from "../components/charts";
import { Section3D, HeroTilt, ScrollStack } from "../components/scroll3d";

/* ---------- motion helpers ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

function Section({ children, className = "" }) {
  return (
    <motion.section
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function Kicker({ children }) {
  return (
    <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0EA5E9]">
      {children}
    </motion.p>
  );
}

/* ============================================= HERO: CAREER INTELLIGENCE FLOW */
const FLOW = [
  { icon: "upload", label: "Resume", sub: "Parsed & understood" },
  { icon: "insights", label: "Skills", sub: "Extracted from your work" },
  { icon: "verify", label: "Verification", sub: "Proven via GitHub", accent: true },
  { icon: "pricing", label: "Market Analysis", sub: "Live demand & pay" },
  { icon: "target", label: "Job Matching", sub: "Roles you actually fit" },
  { icon: "tracker", label: "Applications", sub: "Tracked end-to-end" },
  { icon: "rocket", label: "Outcomes", sub: "Every result teaches the system" },
];

function CareerFlow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="panel relative p-6 sm:p-7"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Career Intelligence Flow
        </p>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          live
        </span>
      </div>

      <div className="relative mt-6">
        {/* connecting spine */}
        <motion.div
          className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-[#2563EB] via-[#3B82F6] to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          style={{ transformOrigin: "top" }}
          transition={{ duration: 1.3, ease: "easeOut", delay: 0.3 }}
        />
        {/* traveling data pulse */}
        <motion.div
          className="absolute left-[15px] h-2.5 w-2.5 rounded-full bg-[#0EA5E9]"
          style={{ boxShadow: "0 0 12px 2px rgba(168,85,247,0.6)" }}
          animate={{ top: ["1%", "94%"] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="space-y-3">
          {FLOW.map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
              className="relative flex items-center gap-4 pl-1"
            >
              <span
                className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                  n.accent
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-white/10 bg-night-800 text-[#60A5FA]"
                }`}
              >
                <Icon name={n.icon} className="h-[18px] w-[18px]" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{n.label}</p>
                <p className="text-xs text-slate-500">{n.sub}</p>
              </div>
              {n.accent && (
                <span className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                  verified
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================ DATA SOURCES */
const SOURCES = ["Remotive", "RemoteOK", "Jobicy", "Arbeitnow", "Himalayas", "Adzuna", "The Muse"];

/* =========================================================== BENTO CARDS */
const PLATFORM = [
  { icon: "quality", t: "Resume Intelligence", d: "Instant resume analysis and improvements." },
  { icon: "verify", t: "Skill Verification", d: "Verify skills through GitHub and real projects." },
  { icon: "pricing", t: "Market Demand", d: "Discover which skills employers actually need." },
  { icon: "salary", t: "Salary Intelligence", d: "Understand earning potential based on live data." },
  { icon: "tracker", t: "Application Tracking", d: "Track applications and hiring outcomes." },
  { icon: "profile", t: "Public Skill Profile", d: "Build a trusted, shareable professional profile." },
];

/* ====================================================================== FAQ */
const FAQS = [
  { q: "Is SkillSync free?", a: "Yes. Core analysis, market intelligence, verification, and tracking run on free data sources — no paid APIs required." },
  { q: "How are skills verified?", a: "We read your public GitHub and portfolio to confirm which skills are backed by real projects, then add verified badges to your profile. We never inspect private data." },
  { q: "Where does the market & salary data come from?", a: "Live listings aggregated from Remotive, RemoteOK, Jobicy, Arbeitnow, Himalayas, Adzuna (incl. India) and The Muse, plus anonymous member-reported offers." },
  { q: "Do you support the Indian job market?", a: "Yes — Adzuna's India endpoint surfaces real local listings (Bengaluru, Hyderabad, Pune and more) alongside global remote roles." },
  { q: "Is my resume data private?", a: "Always. Your resume text is never shown on your public profile, and salary contributions are only ever served as anonymous aggregates." },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <span className="font-medium text-white">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-xl leading-none text-[#0EA5E9]">+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-[#a1a1aa]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===================================================================== PAGE */
export default function Landing() {
  const { user } = useAuth();
  const ctaTo = user ? "/dashboard" : "/login?mode=register";
  const primaryLabel = user ? "Go to Dashboard" : "Analyze My Resume";

  return (
    // overflow-x: clip (NOT hidden) — clips horizontal slide-ins without
    // creating a scroll container, so the sticky deck still pins correctly.
    <div style={{ overflowX: "clip" }}>
      <ChartDefs />

      {/* ============================================ HERO */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24 pt-16 sm:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-slate-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
              Career intelligence, not another resume tool
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-6 font-display text-[2.7rem] font-extrabold leading-[1.04] tracking-tight text-white sm:text-[3.75rem]"
            >
              Know exactly where your <span className="gradient-text">career</span> stands.
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg leading-relaxed text-[#a1a1aa]">
              Analyze your resume, verify your skills, understand market demand,
              track real hiring outcomes, and discover what opportunities you're
              actually qualified for.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
              <Link to={ctaTo} className="btn-primary">{primaryLabel} <span aria-hidden>→</span></Link>
              <Link to="/jobs" className="btn-ghost">Explore Platform</Link>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Icon name="bolt" className="h-4 w-4 text-[#0EA5E9]" />
              Powered by live market data and verified skills.
            </motion.p>

            {/* credibility stat strip */}
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
              {[["7", "job sources"], ["12k+", "listings analysed"], ["100%", "free, no paid APIs"]].map(([n, l]) => (
                <div key={l} className="flex items-baseline gap-2">
                  <span className="stat-num text-xl font-bold text-white">{n}</span>
                  <span className="text-sm text-slate-500">{l}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* product preview: soft blue glow + scroll-linked 3D tilt */}
          <HeroTilt className="relative">
            <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_70%_30%,rgba(37,99,235,0.18),transparent_70%)] blur-2xl" />
            <CareerFlow />
          </HeroTilt>
        </div>
      </section>

      {/* ============================================ DATA SOURCES */}
      <Section className="border-y border-white/5 py-10">
        <div className="mx-auto max-w-6xl px-5">
          <motion.p variants={fadeUp} className="text-center text-xs uppercase tracking-[0.2em] text-slate-600">
            Live opportunities aggregated from
          </motion.p>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {SOURCES.map((s) => (
              <span
                key={s}
                className="font-display text-lg font-semibold tracking-tight text-slate-500 grayscale transition-all duration-300 hover:text-slate-200"
              >
                {s}
              </span>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ============ NARRATIVE — depth card-stack deck (forward + from behind) */}
      <ScrollStack>
        {/* — panel 1: platform — */}
        <div className="mx-auto max-w-6xl px-5">
          <motion.div variants={fadeUp} className="max-w-2xl">
            <Kicker>The platform</Kicker>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-[2.5rem]">
              Career Intelligence Platform
            </h2>
            <p className="mt-4 text-lg text-[#a1a1aa]">
              Everything you need to understand, prove, and advance your career —
              in one intelligent system.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {/* feature card spanning two rows with a mini visual */}
            <motion.div variants={fadeUp} className="panel panel-hover group p-7 md:row-span-2">
              <div className="icon-badge h-11 w-11"><Icon name="quality" className="h-5 w-5" /></div>
              <h3 className="mt-5 font-display text-xl font-semibold text-white">Resume Intelligence</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a1a1aa]">
                Instant resume analysis and improvements — scored for both the ATS
                and a human recruiter, with evidence-based rewrites.
              </p>
              <div className="mt-7 space-y-4">
                <BarMeter label="ATS match" value={88} valueLabel="88" />
                <BarMeter label="Recruiter readability" value={74} valueLabel="74" delay={0.15} />
              </div>
            </motion.div>

            {PLATFORM.slice(1).map((c) => (
              <motion.div key={c.t} variants={fadeUp} className="panel panel-hover group p-7">
                <div className="icon-badge h-11 w-11"><Icon name={c.icon} className="h-5 w-5" /></div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a1a1aa]">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
        {/* — panel 2: why broken — */}
        <div className="mx-auto max-w-6xl px-5">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
            <Kicker>The difference</Kicker>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-[2.5rem]">
              Why job searching feels broken
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { t: "Traditional resume tools", f: "Focus on keywords", icon: "doc", dim: true },
              { t: "Job boards", f: "Focus on application volume", icon: "jobs", dim: true },
              { t: "SkillSync", f: "Focus on outcomes", icon: "rocket", highlight: true },
            ].map((c) => (
              <motion.div
                key={c.t}
                variants={fadeUp}
                className={`panel panel-hover group p-7 ${
                  c.highlight ? "border-[#2563EB]/40 bg-[#2563EB]/[0.06]" : ""
                }`}
              >
                <div className={`icon-badge h-11 w-11 ${c.highlight ? "border-[#2563EB]/40 text-[#93C5FD]" : ""}`}>
                  <Icon name={c.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">{c.t}</h3>
                <p className={`mt-2 flex items-center gap-2 text-sm ${c.highlight ? "text-[#93C5FD]" : "text-slate-500"}`}>
                  <span aria-hidden>→</span> {c.f}
                </p>
                {c.highlight && (
                  <p className="mt-4 text-sm leading-relaxed text-[#a1a1aa]">
                    We measure what actually gets you hired — and feed it back to
                    make every next move smarter.
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        {/* — panel 3: flywheel — */}
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <FlywheelLoop />
          </div>
          <div className="order-1 lg:order-2">
            <Kicker>Proprietary</Kicker>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-[2.5rem]">
              The Outcome Data Flywheel
            </h2>
            <p className="mt-4 text-lg text-[#a1a1aa]">
              Every application, interview, and offer feeds back into the system.
              The more you use SkillSync, the more precisely it knows what gets
              people like you hired — so every recommendation gets better.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Resume", "Application", "Interview", "Offer", "Hire", "Insights", "Better applications"].map((s, i) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-night-900 px-2.5 py-1 text-xs text-slate-300">
                  <span className="text-[#0EA5E9]">{String(i + 1).padStart(2, "0")}</span> {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* — panel 4: verified profile — */}
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <motion.div variants={fadeUp}>
            <Kicker>Shareable proof</Kicker>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-[2.5rem]">
              A verified skill profile people trust
            </h2>
            <p className="mt-4 text-lg text-[#a1a1aa]">
              One link that proves your expertise through real projects and shows
              live market context — not another PDF lost in an inbox.
            </p>
            <Link to={ctaTo} className="btn-ghost mt-8">Create your profile</Link>
          </motion.div>

          <motion.div variants={fadeUp} className="panel p-7">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-lg font-bold text-white">UK</div>
              <div>
                <p className="font-display text-lg font-semibold text-white">Utkarsh Kushwaha</p>
                <p className="text-sm text-slate-500">Verified through GitHub projects</p>
              </div>
            </div>

            <div className="my-5 rule" />

            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Verified skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Django", "FastAPI", "Python"].map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-sm text-emerald-200">
                  <Icon name="verify" className="h-3.5 w-3.5" /> {s} Verified
                </span>
              ))}
            </div>

            <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-slate-500">Live market demand</p>
            <div className="mt-3 space-y-3.5">
              <BarMeter label="Python" value={82} valueLabel="82%" />
              <BarMeter label="Django" value={64} valueLabel="64%" delay={0.12} />
              <BarMeter label="FastAPI" value={38} valueLabel="38%" delay={0.24} />
            </div>
          </motion.div>
        </div>
      </ScrollStack>

      {/* ============================================ FAQ */}
      <Section className="py-24">
        <div className="mx-auto max-w-3xl px-5">
          <motion.div variants={fadeUp} className="text-center">
            <Kicker>Questions</Kicker>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-[2.5rem]">
              Frequently asked
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-10 space-y-3">
            {FAQS.map((f) => <FaqItem key={f.q} {...f} />)}
          </motion.div>
        </div>
      </Section>

      {/* ============================================ FINAL CTA */}
      <Section3D from="up" className="px-5 py-28">
        <div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-night-900 p-12 text-center sm:p-16"
        >
          <div className="pointer-events-none absolute -top-1/2 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[#2563EB]/12 blur-[130px]" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              Stop guessing.<br />Start understanding your <span className="gradient-text">career</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-[#a1a1aa]">
              Build your verified career profile in minutes — free, no catch.
            </p>
            <div className="mt-9 flex justify-center">
              <Link to={ctaTo} className="btn-primary">Get Started Free <span aria-hidden>→</span></Link>
            </div>
          </div>
        </div>
      </Section3D>
    </div>
  );
}

/* ====================================================== FLYWHEEL LOOP (SVG) */
function FlywheelLoop() {
  const steps = [
    { icon: "upload", label: "Resume" },
    { icon: "jobs", label: "Application" },
    { icon: "insights", label: "Interview" },
    { icon: "quality", label: "Offer" },
    { icon: "rocket", label: "Hire" },
    { icon: "pricing", label: "Insights" },
    { icon: "target", label: "Better apps" },
  ];
  const R = 38; // % radius within the box
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <svg viewBox="0 0 300 300" className="h-full w-full">
        <defs>
          <linearGradient id="fw" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" /><stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <circle cx="150" cy="150" r={R * 3} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        {/* rotating highlight arc suggesting a continuous loop */}
        <motion.circle
          cx="150" cy="150" r={R * 3} fill="none" stroke="url(#fw)" strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray="60 540"
          animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "150px 150px" }}
        />
      </svg>

      {/* center */}
      <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/10 bg-night-900 p-3 text-center">
        <div>
          <p className="font-display text-sm font-bold text-white">Every action</p>
          <p className="text-[11px] leading-tight text-slate-500">improves the next</p>
        </div>
      </div>

      {/* nodes around the ring */}
      {steps.map((n, i) => {
        const ang = (i / steps.length) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + R * Math.cos(ang);
        const y = 50 + R * Math.sin(ang);
        return (
          <motion.div
            key={n.label}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 200 }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-night-800 text-[#60A5FA] shadow-lg">
              <Icon name={n.icon} className="h-5 w-5" />
            </span>
            <span className="whitespace-nowrap text-[10px] text-slate-500">{n.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
