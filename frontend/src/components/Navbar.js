import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/jobs", label: "Jobs", icon: "jobs" },
  { to: "/insights", label: "Insights", icon: "insights" },
  { to: "/tracker", label: "Tracker", icon: "tracker" },
  { to: "/profile", label: "Profile", icon: "profile" },
  { to: "/settings", label: "Settings", icon: "quality" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-night-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-white shadow-glow">
            S
          </span>
          <span className="font-display text-xl font-bold text-white">SkillSync</span>
        </Link>

        {user && (
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }`
                }
              >
                <Icon name={l.icon} className="h-4 w-4" />
                {l.label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-400">Hi, {user.username}</span>
              <button onClick={handleLogout} className="btn-ghost py-2">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost py-2">
                Log in
              </Link>
              <Link to="/login?mode=register" className="btn-primary py-2">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-white" />
            <span className="block h-0.5 w-6 bg-white" />
            <span className="block h-0.5 w-6 bg-white" />
          </div>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-night-900/95 px-4 py-3 md:hidden">
          {user ? (
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-slate-300 hover:bg-white/5"
                >
                  <Icon name={l.icon} className="h-4 w-4" />
                  {l.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="btn-ghost mt-1">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" className="btn-ghost" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link
                to="/login?mode=register"
                className="btn-primary"
                onClick={() => setOpen(false)}
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
