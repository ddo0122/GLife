import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SidebarBrand from "../components/SidebarBrand";
import { http } from "../lib/http";

const USE_DUMMY_DATA = import.meta.env?.VITE_USE_LOCAL_AUTH === "true";

const DUMMY_NOTICES = [
  {
    id: "dummy-1",
    title: "2024년 6월 산업안전보건 교육 공지",
    url: "https://www.kosha.or.kr",
    source: "KOSHA",
    publishedAt: "2024-06-03",
  },
  {
    id: "dummy-2",
    title: "여름철 폭염 대응 안전수칙 안내",
    url: "https://www.kosha.or.kr",
    source: "KOSHA",
    publishedAt: "2024-06-01",
  },
  {
    id: "dummy-3",
    title: "산업안전보건법 주요 개정 사항",
    url: "https://www.kosha.or.kr",
    source: "고용노동부",
    publishedAt: "2024-05-27",
  },
];

function normalizeNotices(list) {
  return (list || []).map((item, idx) => ({
    id: item.id || item.url || `notice-${idx}`,
    title: item.title || item.name || "제목 없음",
    url: item.url || item.link || "",
    source: item.source || item.origin || "",
    publishedAt: item.publishedAt || item.date || item.created_at || "",
  }));
}

export default function SafetyNotices() {
  const [notices, setNotices] = useState(() => (USE_DUMMY_DATA ? DUMMY_NOTICES : []));
  const [loading, setLoading] = useState(!USE_DUMMY_DATA);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNotices = async () => {
    if (USE_DUMMY_DATA) {
      setNotices(DUMMY_NOTICES);
      setError("");
      setLoading(false);
      setLastUpdated(new Date());
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await http("/notices", { auth: false });
      const normalized = normalizeNotices(Array.isArray(data) ? data : data?.results || []);
      setNotices(normalized);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("공지 불러오기 실패", err);
      setError(err.message || "공지 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusMessage = useMemo(() => {
    if (loading) return "크롤링 중입니다...";
    if (error) return error;
    if (!notices.length) return "표시할 공지가 없습니다.";
    return "";
  }, [loading, error, notices.length]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <SidebarBrand />
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard" className="block p-2 hover:bg-gray-700 rounded">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/schedule" className="block p-2 hover:bg-gray-700 rounded">
                Schedule
              </Link>
            </li>
            <li>
              <Link to="/viewer" className="block p-2 hover:bg-gray-700 rounded">
                Viewer
              </Link>
            </li>
            <li>
              <Link to="/employee" className="block p-2 hover:bg-gray-700 rounded">
                Employee
              </Link>
            </li>
            <li>
              <Link to="/notices" className="block p-2 rounded bg-gray-900/70">
                Notices
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow">산업안전 공지</h1>
              {lastUpdated && (
                <p className="text-xs text-white/80">
                  마지막 업데이트: {lastUpdated.toLocaleString("ko-KR")}
                </p>
              )}
            </div>
            <button
              onClick={fetchNotices}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-sm font-semibold shadow ${
                loading
                  ? "cursor-not-allowed bg-white/50 text-gray-400"
                  : "bg-white/90 text-gray-800 hover:bg-white"
              }`}
            >
              {loading ? "불러오는 중..." : "새로 고침"}
            </button>
          </header>

        <section className="rounded-2xl bg-white/95 p-5 shadow-lg min-h-[320px]">
            {statusMessage ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-500">
                {statusMessage}
              </div>
            ) : (
              <ul className="space-y-4">
                {notices.map((notice) => (
                  <li
                    key={notice.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          {notice.url ? (
                            <a
                              href={notice.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {notice.title}
                            </a>
                          ) : (
                            notice.title
                          )}
                        </h2>
                        {notice.source && (
                          <p className="text-xs text-gray-500 mt-1">출처: {notice.source}</p>
                        )}
                      </div>
                      {notice.publishedAt && (
                        <span className="text-xs text-gray-400">
                          {(() => {
                            const d = new Date(notice.publishedAt);
                            return Number.isNaN(d.getTime())
                              ? notice.publishedAt
                              : d.toLocaleDateString("ko-KR");
                          })()}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
