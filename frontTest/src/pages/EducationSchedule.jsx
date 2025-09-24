import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SidebarBrand from "../components/SidebarBrand";
import { dummyScheduleData } from "../lib/dummyData";
import { getAuthToken } from "../lib/http";

const USE_DUMMY_DATA = import.meta.env?.VITE_USE_LOCAL_AUTH === "true";
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const STORAGE_KEY = "edu_schedule_by_year_v2";

const QUARTERS = [
  { value: 1, label: "1분기" },
  { value: 2, label: "2분기" },
  { value: 3, label: "3분기" },
  { value: 4, label: "4분기" },
];

const STATUS_OPTIONS = [
  { value: "", label: "상태 없음" },
  { value: "완료", label: "완료" },
  { value: "교육중", label: "교육중" },
  { value: "미완료", label: "미완료" },
];

const STATUS_STYLES = {
  완료: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  교육중: "bg-amber-100 text-amber-700 border border-amber-200",
  미완료: "bg-rose-100 text-rose-700 border border-rose-200",
};

const INITIAL_DRAFT = {
  quarter: 1,
  title: "",
  status: "",
  location: "",
  note: "",
};

function normalizeQuarter(value) {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const n = Math.round(value);
    return n >= 1 && n <= 4 ? n : null;
  }
  const match = value.toString().match(/[1-4]/);
  if (!match) return null;
  const n = Number(match[0]);
  return n >= 1 && n <= 4 ? n : null;
}

function extractEventsFromDummy() {
  return transformScheduleList(dummyScheduleData.events || []).map((event) => ({
    ...event,
    id: event.id || `dummy-${event.quarter}-${event.title}`,
  }));
}

function transformScheduleList(list) {
  return list
    .map((item) => {
      const rawStart = item?.start || item?.begin_at || item?.date || item?.start_date;
      const derivedYear = rawStart ? new Date(rawStart).getFullYear() : undefined;
      const year =
        item?.year ??
        item?.education_year ??
        item?.year_no ??
        item?.yearNumber ??
        derivedYear ??
        new Date().getFullYear();
      return {
        id: item?.id || item?.education_id || `${item?.quarter}-${item?.title}-${Date.now()}`,
        year,
        quarter: normalizeQuarter(
          item?.quarter ??
            item?.quarter_no ??
            item?.quarterNumber ??
            item?.quarter_name ??
            item?.quarterLabel
        ),
        title:
          item?.title ??
          item?.name ??
          item?.education_name ??
          item?.educationTitle ??
          item?.course ??
          "",
        status:
          item?.status ??
          item?.education_status ??
          item?.progress ??
          item?.state ??
          item?.result ??
          "",
        location: item?.location ?? item?.place ?? "",
        note:
          item?.note ??
          item?.description ??
          item?.memo ??
          item?.detail ??
          item?.remark ??
          "",
      };
    })
    .filter((item) => item.quarter && item.title);
}

async function fetchSchedulesFromApi(signal) {
  if (!API_BASE_URL) return [];
  const headers = { Accept: "application/json" };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/education-schedules`, {
    headers,
    credentials: "include",
    signal,
  });
  if (!res.ok) throw new Error(`교육 일정 조회 실패 (${res.status})`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  return transformScheduleList(list);
}

function groupByQuarter(events, year) {
  const base = {
    1: [],
    2: [],
    3: [],
    4: [],
  };
  events
    .filter((event) => event.year === year)
    .forEach((event) => {
      const q = normalizeQuarter(event.quarter);
      if (!q) return;
      base[q].push(event);
    });
  Object.values(base).forEach((list) => list.sort((a, b) => a.title.localeCompare(b.title)));
  return base;
}

export default function EducationSchedule() {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [extraYears, setExtraYears] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const broadcastSchedules = useCallback((list) => {
    window.dispatchEvent(
      new CustomEvent("app:data-sync", {
        detail: { schedules: list, source: "education" },
      })
    );
  }, []);

  const applyScheduleUpdate = useCallback(
    (list, { broadcast = false } = {}) => {
      setEvents(list);
      setExtraYears((prev) => {
        const merged = new Set(prev);
        list.forEach((event) => {
          if (event.year && event.year !== currentYear) merged.add(event.year);
        });
        return Array.from(merged).sort((a, b) => a - b);
      });
      const yearsFromList = list.map((event) => event.year).filter(Boolean);
      if (yearsFromList.length) {
        setSelectedYear((prev) =>
          yearsFromList.includes(prev) ? prev : Math.max(...yearsFromList)
        );
      }
      if (broadcast) broadcastSchedules(list);
    },
    [broadcastSchedules, currentYear]
  );

  const syncWithServer = useCallback(
    async ({ broadcast = true, showLoader = false, signal } = {}) => {
      if (USE_DUMMY_DATA) return;
      if (showLoader) {
        setLoading(true);
        setError("");
      }
      try {
        const list = await fetchSchedulesFromApi(signal);
        setError("");
        applyScheduleUpdate(list, { broadcast });
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err.message || "교육 일정을 불러오지 못했습니다.");
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [applyScheduleUpdate]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.version === 2 && Array.isArray(parsed.events)) {
          if (Array.isArray(parsed.extraYears)) setExtraYears(parsed.extraYears);
          applyScheduleUpdate(parsed.events, { broadcast: false });
          setSelectedYear(parsed.selectedYear || currentYear);
          return;
        }
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((event) => ({
            ...event,
            year: event.year || currentYear,
          }));
          applyScheduleUpdate(migrated, { broadcast: false });
          return;
        }
      }
    } catch {
      /* ignore */
    }

    if (USE_DUMMY_DATA) {
      const dummyEvents = extractEventsFromDummy();
      applyScheduleUpdate(dummyEvents, { broadcast: false });
      return;
    }

    const controller = new AbortController();
    syncWithServer({ broadcast: false, showLoader: true, signal: controller.signal }).catch(
      () => {}
    );
    return () => controller.abort();
  }, [applyScheduleUpdate, currentYear, syncWithServer]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 2, events, selectedYear, extraYears })
      );
    } catch {
      /* ignore */
    }
  }, [events, selectedYear, extraYears]);

  const years = useMemo(() => {
    const yearSet = new Set(events.map((event) => event.year).filter(Boolean));
    yearSet.add(currentYear);
    extraYears.forEach((year) => yearSet.add(year));
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [events, currentYear, extraYears]);

  useEffect(() => {
    if (!years.includes(selectedYear)) {
      const fallback = years[years.length - 1] || currentYear;
      setSelectedYear(fallback);
    }
  }, [years, selectedYear, currentYear]);

  const sections = useMemo(() => groupByQuarter(events, selectedYear), [events, selectedYear]);

  const isReadOnly = selectedYear < currentYear;
  const readOnlyNotice = isReadOnly
    ? `${selectedYear}년 일정은 등록 이력이므로 수정할 수 없습니다.`
    : null;

  const handleExternalSync = useCallback(
    (evt) => {
      if (USE_DUMMY_DATA) return;
      if (evt.detail?.source === "education") return;
      const payload = evt.detail?.schedules;
      if (!payload) return;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.events)
        ? payload.events
        : [];
      if (!list.length) return;
      const normalized = transformScheduleList(list);
      if (!normalized.length) return;
      applyScheduleUpdate(normalized, { broadcast: false });
    },
    [applyScheduleUpdate]
  );

  useEffect(() => {
    if (USE_DUMMY_DATA) return;
    window.addEventListener("app:data-sync", handleExternalSync);
    return () => window.removeEventListener("app:data-sync", handleExternalSync);
  }, [handleExternalSync]);

  function handleDraftChange(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddYear() {
    let input = window.prompt(
      "추가할 연도를 입력하세요.",
      String(selectedYear >= currentYear ? selectedYear : currentYear)
    );
    if (!input) return;
    input = input.trim();
    const yearNum = Number(input);
    if (!Number.isFinite(yearNum) || !Number.isInteger(yearNum)) {
      alert("유효한 연도를 입력하세요.");
      return;
    }
    if (yearNum < 2000 || yearNum > 2100) {
      alert("2000년부터 2100년 사이의 연도만 추가할 수 있습니다.");
      return;
    }
    if (years.includes(yearNum)) {
      setSelectedYear(yearNum);
      return;
    }
    setExtraYears((prev) => [...new Set([...prev, yearNum])].sort((a, b) => a - b));
    setSelectedYear(yearNum);
  }

  function openModal() {
    if (isReadOnly) return;
    setDraft(INITIAL_DRAFT);
    setModalOpen(true);
  }

  async function saveEvent() {
    if (!draft.title.trim()) {
      alert("제목을 입력하세요.");
      return;
    }
    const quarter = normalizeQuarter(draft.quarter);
    if (!quarter) {
      alert("분기를 선택하세요.");
      return;
    }

    const newEvent = {
      id: `quarter-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      year: selectedYear,
      quarter,
      title: draft.title.trim(),
      status: draft.status,
      location: draft.location.trim(),
      note: draft.note.trim(),
    };

    if (USE_DUMMY_DATA) {
      const nextList = [...events, newEvent];
      setError("");
      applyScheduleUpdate(nextList, { broadcast: true });
      setModalOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        year: selectedYear,
        quarter,
        title: newEvent.title,
        status: newEvent.status || undefined,
        location: newEvent.location || undefined,
        note: newEvent.note || undefined,
      };
      const res = await fetch(`${API_BASE_URL}/education-schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        let message = text;
        try {
          const data = JSON.parse(text || "{}");
          message = data.message || data.error || data.detail || message;
        } catch {}
        throw new Error(message || `HTTP ${res.status}`);
      }
      setModalOpen(false);
      setDraft(INITIAL_DRAFT);
      await syncWithServer({ broadcast: true });
    } catch (err) {
      console.error(err);
      alert(err.message || "일정을 추가하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeEvent(id) {
    if (isReadOnly) return;

    if (USE_DUMMY_DATA) {
      const nextList = events.filter((event) => event.id !== id);
      setError("");
      applyScheduleUpdate(nextList, { broadcast: true });
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/education-schedules/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        let message = text;
        try {
          const data = JSON.parse(text || "{}");
          message = data.message || data.error || data.detail || message;
        } catch {}
        throw new Error(message || `HTTP ${res.status}`);
      }
      await syncWithServer({ broadcast: true });
    } catch (err) {
      console.error(err);
      alert(err.message || "일정을 삭제하지 못했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
      {/* Sidebar */}
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
              <Link to="/notices" className="block p-2 hover:bg-gray-700 rounded">
                Notices
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="mx-auto w-full max-w-6xl space-y-6 mt-12 px-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white drop-shadow">교육 일정</h1>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-white/60 bg-white/90 px-3 py-1.5 text-sm font-semibold text-gray-800 shadow"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddYear}
              className="rounded-lg border border-white/60 bg-white/40 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-white/60 hover:text-gray-800"
            >
              연도 추가
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openModal}
              disabled={isReadOnly || submitting}
              className={`rounded-lg px-4 py-2 text-sm font-semibold shadow transition ${
                isReadOnly || submitting
                  ? "cursor-not-allowed bg-white/50 text-gray-400"
                  : "bg-white/90 text-gray-800 hover:bg-white"
              }`}
            >
              분기 일정 추가
            </button>
          </div>
        </div>

        {readOnlyNotice && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {readOnlyNotice}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {QUARTERS.map(({ value, label }) => {
            const list = sections[value] || [];
            return (
              <div key={value} className="rounded-2xl bg-white/95 shadow-md border border-white/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">{label}</h2>
                  <span className="text-xs text-gray-400">{list.length}건</span>
                </div>
                <div className="space-y-3">
                  {list.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-400">
                      등록된 일정이 없습니다.
                    </div>
                  )}
                  {list.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                          {item.location && (
                            <div className="text-xs text-gray-500">장소: {item.location}</div>
                          )}
                          {item.note && (
                            <div className="text-xs text-gray-500">비고: {item.note}</div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {item.status && (
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[item.status] || "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                              {item.status}
                            </span>
                          )}
                          {!isReadOnly && (
                            <button
                              onClick={() => removeEvent(item.id)}
                              disabled={deletingId === item.id}
                              className={`text-xs font-medium ${
                                deletingId === item.id
                                  ? "cursor-not-allowed text-gray-400"
                                  : "text-red-500 hover:text-red-600"
                              }`}
                            >
                              {deletingId === item.id ? "삭제 중..." : "삭제"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            교육 일정을 불러오는 중입니다...
          </div>
        )}
      </div>

      {modalOpen && !isReadOnly && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white px-6 py-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-lg font-semibold text-gray-900">분기 일정 추가</div>
            <div className="space-y-4">
              <label className="block text-sm text-gray-700">
                분기
                <select
                  value={draft.quarter}
                  onChange={(e) => handleDraftChange("quarter", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {QUARTERS.map((quarter) => (
                    <option key={quarter.value} value={quarter.value}>
                      {quarter.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-gray-700">
                제목 *
                <input
                  value={draft.title}
                  onChange={(e) => handleDraftChange("title", e.target.value)}
                  placeholder="예: 2분기 화재 대응 교육"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm text-gray-700">
                상태
                <select
                  value={draft.status}
                  onChange={(e) => handleDraftChange("status", e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-gray-700">
                장소
                <input
                  value={draft.location}
                  onChange={(e) => handleDraftChange("location", e.target.value)}
                  placeholder="예: 본사 교육실 A"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm text-gray-700">
                비고
                <textarea
                  value={draft.note}
                  onChange={(e) => handleDraftChange("note", e.target.value)}
                  placeholder="예: 전 직원 필참"
                  rows={3}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={saveEvent}
                disabled={submitting}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  submitting
                    ? "cursor-not-allowed bg-blue-300"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
