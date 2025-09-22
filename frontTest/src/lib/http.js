// 공통 HTTP 유틸 — 다른 API도 여기로 합칠 수 있음
let ACCESS_TOKEN = null;

export function setAuthToken(token) { ACCESS_TOKEN = token || null; }
export function getAuthToken() { return ACCESS_TOKEN; }

export const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "/api";

export async function http(path, { method="GET", headers={}, body, auth=true } = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const init = {
    method,
    headers: { Accept: "application/json", ...headers },
    credentials: "include", // 세션/쿠키 기반이면 유용
  };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  if (auth && ACCESS_TOKEN) {
    init.headers["Authorization"] = `Bearer ${ACCESS_TOKEN}`;
  }
  const res = await fetch(url, init);
  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.message || data.error || data.detail)) || `HTTP ${res.status}`;
    const err = new Error(msg); err.status = res.status; err.data = data; throw err;
  }
  return data;
}
