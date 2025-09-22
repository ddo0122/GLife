import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as Auth from "../lib/auth";
import { setAuthToken } from "../lib/http";

const AuthContext = createContext(null);
const KEY = "auth"; // { user, accessToken, refreshToken }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 새로고침 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.accessToken) setAuthToken(saved.accessToken);
      if (saved?.user) setUser(saved.user);
    } catch {}
  }, []);

  const isAuthenticated = !!user;

  async function login({ id, password }) {
    const { accessToken, refreshToken, user: u } = await Auth.login({ id, password });
    setUser(u);
    localStorage.setItem(KEY, JSON.stringify({ user: u, accessToken, refreshToken }));
    return u;
  }

  async function logout() {
    try { await Auth.logout(); } finally {
      setUser(null);
      localStorage.removeItem(KEY);
      setAuthToken(null);
    }
  }

  const value = useMemo(() => ({ user, isAuthenticated, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
