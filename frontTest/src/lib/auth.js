// 로그인/로그아웃 전용 — 기존 api.js 안 건드림
import { http, setAuthToken } from "./http";

export async function login({ id, password }) {
  const data = await http("/auth/login", { method: "POST", body: { id, password }, auth: false });

  // 백엔드 응답 키에 맞게 매핑
  const accessToken  = data?.accessToken || data?.token || data?.access_token;
  const refreshToken = data?.refreshToken || data?.refresh_token;
  const user = data?.user ?? { id: data?.id, name: data?.name, role: data?.role };

  if (!accessToken) throw new Error("로그인 응답에 accessToken이 없습니다.");
  setAuthToken(accessToken);
  return { accessToken, refreshToken, user };
}

export async function logout() {
  try { await http("/auth/logout", { method: "POST" }); } catch (e) { /* optional */ }
  setAuthToken(null);
}

