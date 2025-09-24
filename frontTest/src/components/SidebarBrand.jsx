import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../lib/http";

const USE_DUMMY_DATA = import.meta.env?.VITE_USE_LOCAL_AUTH === "true";
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");
const DEFAULT_COMPANY_NAME = "(주)EL 건설";

export default function SidebarBrand() {
  const [companyName, setCompanyName] = useState(DEFAULT_COMPANY_NAME);

  useEffect(() => {
    if (USE_DUMMY_DATA || !API_BASE_URL) return;

    const controller = new AbortController();

    async function loadCompany() {
      try {
        const headers = { Accept: "application/json" };
        const token = getAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/company/profile`, {
          headers,
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`회사 정보 요청 실패 (${res.status})`);
        const data = await res.json();
        const fetched =
          data?.name ||
          data?.companyName ||
          data?.company_name ||
          data?.profile?.name;
        if (fetched) setCompanyName(fetched);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("회사 정보를 불러오지 못했습니다.", err);
      }
    }

    loadCompany();
    return () => controller.abort();
  }, []);

  return (
    <div className="mb-10">
      <Link to="/home" className="inline-flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-2xl font-extrabold tracking-tight text-gray-900 shadow-lg">
          GL
        </span>
        <span className="text-base font-semibold text-white tracking-tight">
          {companyName}
        </span>
      </Link>
    </div>
  );
}
