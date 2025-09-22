// 로그인/로그아웃 전용 — 기존 api.js 안 건드림
import { http, setAuthToken } from "./http";

/**
 * 로컬 개발 전용 로그인 우선 처리
 * - .env에 VITE_USE_LOCAL_AUTH=true 이거나
 * - VITE_API_BASE_URL이 비어있는 경우(백엔드 미연결)에는
 *   아이디/비밀번호가 test/test면 즉시 로그인 처리합니다.
 */
export async function login({ id, password }) {
  const useLocal =
    (import.meta?.env?.VITE_USE_LOCAL_AUTH === "true") ||
    !import.meta?.env?.VITE_API_BASE_URL;
gi
  if (useLocal) {
    if (id === "test" && password === "test") {
      const user = { id: "test", name: "테스트 사용자", role: "admin" };
      const accessToken = "local-dev-token";
      const refreshToken = null;
      setAuthToken(accessToken);
      return { accessToken, refreshToken, user };
    }
    // 로컬모드에서 틀린 자격증명
    throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
  }

  // ⬇️ 백엔드가 연결된 경우 기존 로직 사용
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
