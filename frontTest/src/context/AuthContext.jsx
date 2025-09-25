import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as Auth from "../lib/auth";
import { setAuthToken } from "../lib/http";

const AuthContext = createContext(null);
const KEY = "auth"; // { user, accessToken, refreshToken }

function loadStoredAuth() {
  if (typeof window === "undefined") {
    return { user: null, accessToken: null, refreshToken: null };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { user: null, accessToken: null, refreshToken: null };
    const saved = JSON.parse(raw);
    const accessToken = saved?.accessToken ?? null;
    if (accessToken) setAuthToken(accessToken);
    return {
      user: saved?.user ?? null,
      accessToken,
      refreshToken: saved?.refreshToken ?? null,
    };
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => loadStoredAuth());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const isAuthenticated = !!state.user;

  async function login({ id, password }) {
    const { accessToken, refreshToken, user: u } = await Auth.login({ id, password });
    const payload = { user: u, accessToken, refreshToken: refreshToken ?? null };
    localStorage.setItem(KEY, JSON.stringify(payload));
    setState(payload);
    return u;
  }

  async function logout() {
    try {
      await Auth.logout();
    } finally {
      localStorage.removeItem(KEY);
      setAuthToken(null);
      setState({ user: null, accessToken: null, refreshToken: null });
    }
  }

  const value = useMemo(
    () => ({
      user: state.user,
      isAuthenticated,
      login,
      logout,
      isReady,
    }),
    [isAuthenticated, state.user, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
