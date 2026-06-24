import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(
    params.get("mode") === "register" ? "register" : "login"
  );
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const isRegister = mode === "register";
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const flattenError = (data) => {
    if (!data) return "Something went wrong. Please try again.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    const first = Object.values(data)[0];
    return Array.isArray(first) ? first[0] : String(first);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ username: form.username, password: form.password });
      navigate("/dashboard");
    } catch (err) {
      setError(flattenError(err.response?.data));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full"
      >
        <div className="absolute -inset-3 rounded-3xl bg-brand-gradient opacity-15 blur-2xl" />
        <div className="card relative">
          <h1 className="font-display text-2xl font-bold text-white">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isRegister
              ? "Start analysing your resume in seconds."
              : "Log in to continue to your dashboard."}
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-3">
            <input className="input" name="username" placeholder="Username"
              value={form.username} onChange={update} required />
            {isRegister && (
              <>
                <input className="input" type="email" name="email" placeholder="Email"
                  value={form.email} onChange={update} required />
                <input className="input" name="phone" placeholder="Phone (optional)"
                  value={form.phone} onChange={update} />
              </>
            )}
            <input className="input" type="password" name="password" placeholder="Password"
              value={form.password} onChange={update} required />
            {isRegister && (
              <input className="input" type="password" name="confirm_password"
                placeholder="Confirm password" value={form.confirm_password}
                onChange={update} required />
            )}
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? "Please wait…" : isRegister ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            {isRegister ? "Already have an account?" : "New to SkillSync?"}{" "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setMode(isRegister ? "login" : "register");
              }}
              className="font-semibold text-brand-300 hover:text-brand-200"
            >
              {isRegister ? "Log in" : "Create one"}
            </button>
          </p>
        </div>
      </motion.div>

      <Link to="/" className="mt-6 text-sm text-slate-500 hover:text-slate-300">
        ← Back to home
      </Link>
    </div>
  );
}
