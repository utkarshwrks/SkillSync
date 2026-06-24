import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-night-950/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} SkillSync — match your skills to your next role.</p>
        <p>Built with Django REST + React.</p>
      </div>
    </footer>
  );
}
