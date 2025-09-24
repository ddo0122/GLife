// src/pages/Home.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SidebarBrand from "../components/SidebarBrand";
import SidebarMenu from "../components/SidebarMenu";
import { getAuthToken } from "../lib/http";
import {
  getDummyEducationSchedule,
  getDummyEmployeesForHome,
} from "../lib/dummyData";

const USE_DUMMY_DATA = import.meta.env?.VITE_USE_LOCAL_AUTH === "true";
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "");
const EMPLOYEE_RESOURCE = "/employees/";
const EDUCATION_RESOURCE = "/education-schedules/";

const DEFAULT_EDUCATION_SECTIONS = [
  {
    quarter: 1,
    heading: "1분기",
    items: [
      { id: "q1-helmet", title: "안전 장비 착용 교육", status: null },
      { id: "q1-safety", title: "작업장 안전 수칙", status: null },
    ],
  },
  {
    quarter: 2,
    heading: "2분기",
    items: [
      { id: "q2-evacuation", title: "화재 대피 훈련", status: null },
      { id: "q2-extinguisher", title: "소화기 사용법", status: null },
    ],
  },
  {
    quarter: 3,
    heading: "3분기",
    items: [
      { id: "q3-electric", title: "전기 안전 교육", status: null },
      { id: "q3-shock", title: "감전 사고 예방", status: null },
    ],
  },
  {
    quarter: 4,
    heading: "4분기",
    items: [
      { id: "q4-firstaid", title: "응급 처치 교육", status: null },
      { id: "q4-cpr", title: "심폐소생술(CPR)", status: null },
    ],
  },
];

const STATUS_VARIANTS = {
  default: { label: "", bgClass: "bg-gray-200", borderClass: "border-gray-300", textClass: "text-gray-500" },
  complete: { label: "완료", bgClass: "bg-green-100", borderClass: "border-green-300", textClass: "text-green-900" },
  inProgress: { label: "교육중", bgClass: "bg-yellow-100", borderClass: "border-yellow-300", textClass: "text-yellow-900" },
  pending: { label: "미완료", bgClass: "bg-red-100", borderClass: "border-red-300", textClass: "text-red-900" },
};

const EMPLOYEE_STATUS_KEYWORDS = {
  complete: ["완료", "complete", "completed", "done", "finished"],
  inProgress: [
    "교육중",
    "진행",
    "진행중",
    "in_progress",
    "in-progress",
    "in progress",
    "ongoing",
    "progress",
    "running",
  ],
  pending: [
    "미완료",
    "미이수",
    "미수료",
    "pending",
    "not_completed",
    "not completed",
    "incomplete",
  ],
};

const EMPLOYEE_PIE_COLORS = {
  complete: "#22c55e", // green-500
  inProgress: "#facc15", // yellow-400
  pending: "#ef4444", // red-500
};

const STATUS_ORDER = ["complete", "inProgress", "pending"];
const STATUS_LABELS = {
  complete: "완료",
  inProgress: "교육중",
  pending: "미완료",
};

function buildApiUrl(path) {
  const normalized = path.replace(/^\/+/, "");
  if (!API_BASE_URL) return `/${normalized}`;
  return `${API_BASE_URL}/${normalized}`;
}

async function fetchApi(path) {
  const url = buildApiUrl(path);
  const headers = { Accept: "application/json" };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers, credentials: "include" });
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!res.ok) {
    const message =
      (data && (data.message || data.error || data.detail)) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

function cloneDefaultSections() {
  return DEFAULT_EDUCATION_SECTIONS.map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item })),
  }));
}

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function toQuarter(value) {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const num = Math.floor(value);
    return num >= 1 && num <= 4 ? num : null;
  }
  const str = value.toString().toLowerCase();
  const match = str.match(/[1-4]/);
  if (!match) return null;
  const num = Number(match[0]);
  return num >= 1 && num <= 4 ? num : null;
}

function normalizeEducationItem(raw) {
  if (!raw) return null;
  const quarter = toQuarter(
    raw.quarter ??
      raw.quarter_no ??
      raw.quarterNumber ??
      raw.quarter_name ??
      raw.quarterLabel
  );
  const title =
    raw.title ??
    raw.name ??
    raw.education_name ??
    raw.educationTitle ??
    raw.course;
  if (!quarter || !title) return null;
  const status =
    raw.status ??
    raw.progress ??
    raw.education_status ??
    raw.completion_status ??
    raw.state ??
    raw.result ??
    null;
  return {
    quarter,
    id: raw.id ?? raw.education_id ?? `${quarter}-${title}`,
    title,
    status,
  };
}

function mergeEducationSections(apiItems) {
  if (!Array.isArray(apiItems) || apiItems.length === 0) {
    return cloneDefaultSections();
  }
  const grouped = {};
  apiItems.forEach((item) => {
    const normalized = normalizeEducationItem(item);
    if (!normalized) return;
    if (!grouped[normalized.quarter]) grouped[normalized.quarter] = [];
    grouped[normalized.quarter].push(normalized);
  });

  const hasAny = Object.values(grouped).some((list) => list.length > 0);
  if (!hasAny) return cloneDefaultSections();

  return DEFAULT_EDUCATION_SECTIONS.map((section) => {
    const list = grouped[section.quarter];
    if (!list?.length) {
      return {
        ...section,
        items: section.items.map((item) => ({ ...item })),
      };
    }
    return {
      ...section,
      items: list.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status ?? null,
      })),
    };
  });
}

function resolveStatus(status) {
  if (!status) return STATUS_VARIANTS.default;
  const value = status.toString().trim().toLowerCase();
  const completeMatches = ["완료", "complete", "completed", "done", "finished"];
  const inProgressMatches = [
    "교육중",
    "진행",
    "진행중",
    "in_progress",
    "in-progress",
    "in progress",
    "ongoing",
    "progress",
    "running",
  ];
  const pendingMatches = [
    "미완료",
    "미이수",
    "미수료",
    "pending",
    "not_completed",
    "not completed",
    "incomplete",
  ];

  if (completeMatches.includes(value)) return STATUS_VARIANTS.complete;
  if (inProgressMatches.includes(value)) return STATUS_VARIANTS.inProgress;
  if (pendingMatches.includes(value)) return STATUS_VARIANTS.pending;
  return STATUS_VARIANTS.default;
}

function normalizeEmployeeStatus(status) {
  if (!status) return null;
  const value = status.toString().trim().toLowerCase();
  if (EMPLOYEE_STATUS_KEYWORDS.complete.includes(value)) return "complete";
  if (EMPLOYEE_STATUS_KEYWORDS.inProgress.includes(value)) return "inProgress";
  if (EMPLOYEE_STATUS_KEYWORDS.pending.includes(value)) return "pending";
  return null;
}

function buildEmployeeSummary(employees) {
  if (!Array.isArray(employees) || employees.length === 0) {
    return {
      total: 0,
      counts: { complete: 0, inProgress: 0, pending: 0 },
      lists: { complete: [], inProgress: [], pending: [] },
      percents: { complete: 0, inProgress: 0, pending: 0 },
      segments: STATUS_ORDER.map((key) => ({
        key,
        label: STATUS_LABELS[key],
        percent: 0,
        count: 0,
        startAngle: -90,
        endAngle: -90,
        midAngle: -90,
      })),
    };
  }

  const counts = { complete: 0, inProgress: 0, pending: 0 };
  const lists = { complete: [], inProgress: [], pending: [] };

  employees.forEach((emp) => {
    const key = normalizeEmployeeStatus(emp.status) ?? "pending";
    counts[key] += 1;
    lists[key].push(emp);
  });

  const total = employees.length;
  const percents = {
    complete: total ? (counts.complete / total) * 100 : 0,
    inProgress: total ? (counts.inProgress / total) * 100 : 0,
    pending: total ? (counts.pending / total) * 100 : 0,
  };

  let currentAngle = -90;
  const segments = STATUS_ORDER.map((key) => {
    const percent = percents[key];
    const angle = (percent / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const midAngle = startAngle + angle / 2;
    currentAngle = endAngle;
    return {
      key,
      label: STATUS_LABELS[key],
      percent,
      count: counts[key],
      startAngle,
      endAngle,
      midAngle,
    };
  });

  return { total, counts, lists, percents, segments };
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

const Home = () => {
  const [employees, setEmployees] = useState(() => (USE_DUMMY_DATA ? getDummyEmployeesForHome() : []));
  const [educationSections, setEducationSections] = useState(() =>
    USE_DUMMY_DATA ? mergeEducationSections(getDummyEducationSchedule()) : cloneDefaultSections()
  );

  const employeeSummary = useMemo(() => buildEmployeeSummary(employees), [employees]);
  const {
    total: totalEmployees,
    counts: employeeCounts,
    lists: employeeLists,
    segments: employeeSegments,
  } = employeeSummary;

  useEffect(() => {
    let isMounted = true;
    if (USE_DUMMY_DATA) {
      setEmployees(getDummyEmployeesForHome());
      return () => {
        isMounted = false;
      };
    }

    const fetchEmployees = async (payload) => {
      try {
        const incoming = payload ?? (await fetchApi(EMPLOYEE_RESOURCE));
        if (!isMounted) return;
        setEmployees(asArray(incoming));
      } catch (err) {
        console.error("직원 데이터 불러오기 실패:", err);
      }
    };

    fetchEmployees();

    const handleSync = (evt) => {
      if (!isMounted) return;
      const incoming = evt.detail?.employees;
      if (incoming) {
        setEmployees(asArray(incoming));
      } else {
        fetchEmployees();
      }
    };

    window.addEventListener("app:data-sync", handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener("app:data-sync", handleSync);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (USE_DUMMY_DATA) {
      setEducationSections(mergeEducationSections(getDummyEducationSchedule()));
      return () => {
        isMounted = false;
      };
    }

    const fetchSchedules = async (payload) => {
      try {
        const incoming = payload ?? (await fetchApi(EDUCATION_RESOURCE));
        if (!isMounted) return;
        const merged = mergeEducationSections(asArray(incoming));
        setEducationSections(merged);
      } catch (err) {
        console.error("교육 일정 불러오기 실패:", err);
      }
    };

    fetchSchedules();

    const handleSync = (evt) => {
      if (!isMounted) return;
      const incoming = evt.detail?.schedules;
      if (incoming) {
        fetchSchedules(incoming);
      } else {
        fetchSchedules();
      }
    };

    window.addEventListener("app:data-sync", handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener("app:data-sync", handleSync);
    };
  }, []);

  const getStatusColor = (status) => {
    const key = normalizeEmployeeStatus(status) ?? "pending";
    if (key === "complete") return "bg-green-500";
    if (key === "inProgress") return "bg-yellow-500";
    return "bg-red-500"; // pending
  };

  const chartSegments = employeeSegments.filter((seg) => seg.percent > 0);
  const chartCenter = 100;
  const chartRadius = 90;
  const labelRadius = 60;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <SidebarBrand />
        <SidebarMenu />
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
        <div className="flex gap-4">
          {/* 좌측 분기별 교육 일정 */}
          <section
            className="flex-1 border border-gray-300 p-4 rounded bg-white overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 2rem)" }}
          >
            <h3 className="text-lg font-semibold mb-4">교육 일정</h3>

            {educationSections.map((section) => (
              <div key={section.quarter} className="mb-6 last:mb-0">
                <p className="font-bold mb-2">{section.heading}</p>
                <div className="flex flex-col gap-4">
                  {section.items.map((item) => {
                    const statusMeta = resolveStatus(item.status);
                    const titleWithStatus = statusMeta.label
                      ? `${item.title} (${statusMeta.label})`
                      : item.title;
                    return (
                      <div
                        key={item.id}
                        className={`border rounded overflow-hidden ${statusMeta.borderClass}`}
                      >
                        <div
                          className={`h-24 flex items-center justify-center px-4 text-center ${statusMeta.bgClass} ${statusMeta.textClass}`}
                        >
                          <span className="text-sm sm:text-base">{titleWithStatus}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          {/* 중앙/우측 메인 콘텐츠 */}
          <section className="flex flex-col gap-4 flex-[3]">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="border border-gray-300 p-4 rounded bg-white flex flex-col">
                <h3 className="text-lg font-semibold mb-2">전체 교육 이수율</h3>
                {totalEmployees > 0 ? (
                  <div className="flex flex-col items-center gap-5 mt-2 flex-1 justify-center">
                    <svg width="220" height="220" viewBox="0 0 200 200">
                      <circle cx={chartCenter} cy={chartCenter} r={chartRadius} fill="#f3f4f6" />
                      {chartSegments.map((segment) => {
                        const color = EMPLOYEE_PIE_COLORS[segment.key] || "#9ca3af";
                        if (segment.percent >= 99.9) {
                          return (
                            <circle
                              key={`seg-${segment.key}`}
                              cx={chartCenter}
                              cy={chartCenter}
                              r={chartRadius}
                              fill={color}
                              stroke="#ffffff"
                              strokeWidth="1"
                            />
                          );
                        }
                        const pathD = describeArc(
                          chartCenter,
                          chartCenter,
                          chartRadius,
                          segment.startAngle,
                          segment.endAngle
                        );
                        return (
                          <path
                            key={`seg-${segment.key}`}
                            d={pathD}
                            fill={color}
                            stroke="#ffffff"
                            strokeWidth="1"
                          />
                        );
                      })}
                      {chartSegments.map((segment) => {
                        if (segment.percent <= 0) return null;
                        const isFull = segment.percent >= 99.9;
                        const point = isFull
                          ? { x: chartCenter, y: chartCenter }
                          : polarToCartesian(chartCenter, chartCenter, labelRadius, segment.midAngle);
                        const pct = Math.round(segment.percent);
                        return (
                          <text
                            key={`label-${segment.key}`}
                            x={point.x}
                            y={point.y}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill="#111827"
                          >
                            <tspan fontSize="12" fontWeight="700" fill="#111827">
                              {pct}%
                            </tspan>
                            <tspan
                              x={point.x}
                              dy="1.1em"
                              fontSize="10"
                              fontWeight="500"
                              fill="#4b5563"
                            >
                              {segment.count}명
                            </tspan>
                          </text>
                        );
                      })}
                    </svg>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        완료
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                        교육중
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        미완료
                      </span>
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400">
                      총 {totalEmployees}명 기준
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">직원 데이터가 없습니다.</p>
                )}
              </div>

              <div className="border border-gray-300 p-4 rounded bg-white flex flex-col">
                <h3 className="text-lg font-semibold">완료 인원</h3>
                <p className="text-xs text-gray-500">총 {employeeCounts.complete}명</p>
                <div className="mt-3 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "16rem" }}>
                  {employeeLists.complete.length ? (
                    employeeLists.complete.map((emp, idx) => (
                      <div
                        key={emp.id ?? `${emp.name}-${idx}`}
                        className="rounded border border-green-200 bg-green-50 px-3 py-2 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-green-900">{emp.name}</div>
                          <div className="text-xs text-green-700">{emp.id}</div>
                        </div>
                        {emp.rate && (
                          <span className="text-sm font-medium text-green-800">{emp.rate}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">완료한 인원이 없습니다.</p>
                  )}
                </div>
              </div>

              <div className="border border-gray-300 p-4 rounded bg-white flex flex-col">
                <h3 className="text-lg font-semibold">미완료 인원</h3>
                <p className="text-xs text-gray-500">총 {employeeCounts.pending}명</p>
                <div className="mt-3 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "16rem" }}>
                  {employeeLists.pending.length ? (
                    employeeLists.pending.map((emp, idx) => (
                      <div
                        key={emp.id ?? `${emp.name}-${idx}`}
                        className="rounded border border-red-200 bg-red-50 px-3 py-2 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-red-900">{emp.name}</div>
                          <div className="text-xs text-red-700">{emp.id}</div>
                        </div>
                        {emp.rate && (
                          <span className="text-sm font-medium text-red-800">{emp.rate}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">미완료 인원이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 교육 인원별 현황 */}
            <div className="border border-gray-300 p-4 rounded bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">실시간 수강 현황</h3>
                <Link
                  to="/dashboard"
                  className="px-3 py-1  text-gray-400 rounded hover:text-gray-700 hover:bg-gray-400 transition"
                >
                  대시보드 보기
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="w-2/12 px-3 py-2 text-left">사번</th>
                      <th className="w-2/12 px-3 py-2 text-left">이름</th>
                      <th className="w-4/12 px-3 py-2 text-left">상태</th>
                      <th className="px-3 py-2 text-left">수강률</th>
                    </tr>
                  </thead>
                </table>

                {/* 스크롤 가능한 영역 */}
                <div className="flex flex-col space-y-2 mt-1 max-h-48 overflow-y-auto">
                  {employees.map((emp) => (
                    <div key={emp.id} className="flex items-center">
                      <div className="w-2/12 px-3 py-2">{emp.id}</div>
                      <div className="w-2/12 px-3 py-2">{emp.name}</div>
                      <div className="w-4/12 px-3 py-2 flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${getStatusColor(emp.status)} inline-block`}
                        ></span>
                        <span className="px-2 py-1 rounded text-gray-600">
                          {emp.status}
                        </span>
                      </div>
                      <div className="w-2/12 px-3 py-2">{emp.rate}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 공지사항 */}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
