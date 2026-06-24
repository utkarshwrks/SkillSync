import React, { createContext, useContext, useEffect, useState } from "react";
import client, { TOKEN_KEY } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get("/auth/me/")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  // Keep token and user in lockstep: when any request 401s, the client clears
  // the token and fires this event — we reset the user so ProtectedRoute
  // redirects cleanly instead of leaving a broken half-logged-in session.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("skillsync:unauthorized", onUnauthorized);
    return () => window.removeEventListener("skillsync:unauthorized", onUnauthorized);
  }, []);

  const persist = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  };

  const login = async (credentials) => {
    const res = await client.post("/auth/login/", credentials);
    persist(res.data);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await client.post("/auth/register/", payload);
    persist(res.data);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await client.post("/auth/logout/");
    } catch (_) {
      /* ignore network errors on logout */
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = { user, setUser, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
