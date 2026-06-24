import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";
import { Panel, Button, Modal } from "../components/ui";
import { useToast } from "../components/Toast";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });
  const [busy, setBusy] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);

  const upd = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setBusy(true);
    try {
      const res = await client.patch("/auth/me/", form);
      setUser(res.data);
      toast("Settings saved", "success");
    } catch (_) {
      toast("Couldn't save settings", "error");
    } finally {
      setBusy(false);
    }
  };

  const doLogout = async () => {
    await logout();
    nav("/");
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 animate-rise-in">
      <h1 className="flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-white">
        <span className="icon-badge h-11 w-11"><Icon name="profile" className="h-5 w-5" /></span>
        Settings
      </h1>

      {/* Account */}
      <Panel className="mt-8 p-7">
        <h2 className="font-display text-lg font-semibold text-white">Account</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input className="input" name="first_name" placeholder="First name" value={form.first_name} onChange={upd} />
          <input className="input" name="last_name" placeholder="Last name" value={form.last_name} onChange={upd} />
          <input className="input sm:col-span-2" name="email" type="email" placeholder="Email" value={form.email} onChange={upd} />
        </div>
        <div className="mt-5"><Button loading={busy} onClick={save}>Save changes</Button></div>
      </Panel>

      {/* Privacy */}
      <Panel className="mt-6 p-7">
        <h2 className="font-display text-lg font-semibold text-white">Data & privacy</h2>
        <ul className="mt-4 space-y-2.5 text-sm text-[#a1a1aa]">
          <li className="flex gap-2"><Icon name="verify" className="mt-0.5 h-4 w-4 text-emerald-400" /> Your resume text is never shown on your public profile.</li>
          <li className="flex gap-2"><Icon name="verify" className="mt-0.5 h-4 w-4 text-emerald-400" /> Salary contributions are stored and served only as anonymous aggregates.</li>
          <li className="flex gap-2"><Icon name="verify" className="mt-0.5 h-4 w-4 text-emerald-400" /> Skill verification reads only public GitHub/portfolio data.</li>
        </ul>
      </Panel>

      {/* Danger zone */}
      <Panel className="mt-6 border-red-400/20 p-7">
        <h2 className="font-display text-lg font-semibold text-red-300">Danger zone</h2>
        <p className="mt-2 text-sm text-[#a1a1aa]">Sign out of your account on this device.</p>
        <Button variant="ghost" className="mt-4 !border-red-400/30 !text-red-300" onClick={() => setConfirmOut(true)}>
          Log out
        </Button>
      </Panel>

      <Modal
        open={confirmOut}
        onClose={() => setConfirmOut(false)}
        title="Log out?"
        footer={<>
          <Button variant="subtle" onClick={() => setConfirmOut(false)}>Cancel</Button>
          <Button onClick={doLogout}>Log out</Button>
        </>}
      >
        You'll need to sign in again to access your dashboard.
      </Modal>
    </div>
  );
}
