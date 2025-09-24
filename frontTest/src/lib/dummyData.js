const EMPLOYEES = [
  { id: "EMP-001", name: "김안전", dept: "안전관리팀", position: "팀장", status: "완료", completionRate: 100 },
  { id: "EMP-002", name: "박현장", dept: "생산1팀", position: "라인리더", status: "교육중", completionRate: 72 },
  { id: "EMP-003", name: "이도윤", dept: "품질보증팀", position: "엔지니어", status: "미완료", completionRate: 35 },
  { id: "EMP-004", name: "최관리", dept: "운영지원팀", position: "매니저", status: "교육중", completionRate: 55 },
  { id: "EMP-005", name: "정미래", dept: "연구개발팀", position: "선임연구원", status: "완료", completionRate: 92 },
];

const EVENTS = [
  { id: "ev-2024-q1-helmet", quarter: 1, title: "안전 장비 착용 교육", start: "2024-01-18T09:00", end: "2024-01-18T11:00", allDay: false, location: "본사 교육실 A", status: "완료" },
  { id: "ev-2024-q1-safety", quarter: 1, title: "작업장 안전 수칙", start: "2024-03-05T14:00", end: "2024-03-05T16:00", allDay: false, location: "본사 교육실 B", status: "교육중" },
  { id: "ev-2024-q2-fire", quarter: 2, title: "화재 대피 훈련", start: "2024-05-20", allDay: true, location: "전사", status: "미완료" },
  { id: "ev-2024-q2-extinguisher", quarter: 2, title: "소화기 사용법", start: "2024-06-07T10:00", end: "2024-06-07T12:00", allDay: false, location: "실습장", status: "완료" },
  { id: "ev-2024-q3-electric", quarter: 3, title: "전기 안전 교육", start: "2024-09-10T09:00", end: "2024-09-10T11:00", allDay: false, location: "연수원 2실", status: "교육중" },
  { id: "ev-2024-q4-firstaid", quarter: 4, title: "응급 처치 교육", start: "2024-11-04T13:00", end: "2024-11-04T15:00", allDay: false, location: "연수원 1실", status: "완료" },
  { id: "ev-2024-q4-cpr", quarter: 4, title: "심폐소생술(CPR)", start: "2024-12-12T09:00", end: "2024-12-12T10:30", allDay: false, location: "연수원 1실", status: "미완료" },
];

const EVENT_META = {
  "ev-2024-q1-helmet": {
    enrolledEmpNos: ["EMP-001", "EMP-002", "EMP-004", "EMP-005"],
    completedEmpNos: ["EMP-001", "EMP-005"],
  },
  "ev-2024-q1-safety": {
    enrolledEmpNos: ["EMP-001", "EMP-002", "EMP-003"],
    completedEmpNos: ["EMP-001"],
  },
  "ev-2024-q2-fire": {
    enrolledEmpNos: ["EMP-001", "EMP-002", "EMP-003", "EMP-004", "EMP-005"],
    completedEmpNos: ["EMP-001", "EMP-005"],
  },
  "ev-2024-q2-extinguisher": {
    enrolledEmpNos: ["EMP-001", "EMP-002", "EMP-004", "EMP-005"],
    completedEmpNos: ["EMP-001", "EMP-005"],
  },
  "ev-2024-q3-electric": {
    enrolledEmpNos: ["EMP-001", "EMP-002", "EMP-003", "EMP-004"],
    completedEmpNos: ["EMP-001"],
  },
  "ev-2024-q4-firstaid": {
    enrolledEmpNos: ["EMP-001", "EMP-002", "EMP-004", "EMP-005"],
    completedEmpNos: ["EMP-001", "EMP-002", "EMP-005"],
  },
  "ev-2024-q4-cpr": {
    enrolledEmpNos: ["EMP-002", "EMP-003", "EMP-004"],
    completedEmpNos: ["EMP-002"],
  },
};

const DASHBOARD_ACTIONS = {
  "1분기": {
    "EMP-001": [100, 98, 95],
    "EMP-002": [82, 74, 68],
    "EMP-003": [54, 40, 32],
    "EMP-004": [66, 58, 52],
    "EMP-005": [96, 92, 90],
  },
  "2분기": {
    "EMP-001": [95, 90, 92],
    "EMP-002": [70, 65, 60],
    "EMP-003": [48, 38, 30],
    "EMP-004": [60, 55, 50],
    "EMP-005": [94, 90, 88],
  },
  "3분기": {
    "EMP-001": [90, 88, 85],
    "EMP-002": [68, 60, 58],
    "EMP-003": [42, 35, 28],
    "EMP-004": [58, 52, 48],
    "EMP-005": [92, 88, 86],
  },
  "4분기": {
    "EMP-001": [98, 96, 95],
    "EMP-002": [76, 70, 68],
    "EMP-003": [40, 32, 28],
    "EMP-004": [62, 58, 54],
    "EMP-005": [95, 92, 90],
  },
};

const DASHBOARD = [
  {
    year: 2024,
    quarters: [
      {
        quarter: "1분기",
        training: "1분기 안전 교육 패키지",
        summary: "안전 장비 착용·작업장 안전 수칙",
        employees: EMPLOYEES.map((emp) => ({
          id: emp.id,
          name: emp.name,
          actions: [...(DASHBOARD_ACTIONS["1분기"][emp.id] || [])],
        })),
      },
      {
        quarter: "2분기",
        training: "2분기 화재 대응 및 소화기 실습",
        summary: "화재 대피 훈련·소화기 사용법",
        employees: EMPLOYEES.map((emp) => ({
          id: emp.id,
          name: emp.name,
          actions: [...(DASHBOARD_ACTIONS["2분기"][emp.id] || [])],
        })),
      },
      {
        quarter: "3분기",
        training: "3분기 전기·장비 안전 심화",
        summary: "전기 안전 교육",
        employees: EMPLOYEES.map((emp) => ({
          id: emp.id,
          name: emp.name,
          actions: [...(DASHBOARD_ACTIONS["3분기"][emp.id] || [])],
        })),
      },
      {
        quarter: "4분기",
        training: "4분기 응급 대응 및 CPR",
        summary: "응급 처치 교육·심폐소생술",
        employees: EMPLOYEES.map((emp) => ({
          id: emp.id,
          name: emp.name,
          actions: [...(DASHBOARD_ACTIONS["4분기"][emp.id] || [])],
        })),
      },
    ],
  },
];

const EDUCATION_SCHEDULE = EVENTS.map((event) => ({
  id: event.id,
  quarter: event.quarter,
  title: event.title,
  status: event.status,
}));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const dummyEmployees = EMPLOYEES.map((emp) => ({
  id: emp.id,
  name: emp.name,
  status: emp.status,
  dept: emp.dept,
  rate: `${emp.completionRate}%`,
}));

export const dummyEmployeeDirectory = EMPLOYEES;

export const dummyEducationSchedule = EDUCATION_SCHEDULE;

export const dummyDashboard = DASHBOARD;

export const dummyScheduleData = {
  events: EVENTS,
  eventMeta: EVENT_META,
  employees: EMPLOYEES.map((emp) => ({ empNo: emp.id, name: emp.name, dept: emp.dept })),
};

export const dummyScheduleApi = {
  async listEvents() {
    await delay(80);
    return [...EVENTS]
      .sort((a, b) => new Date(b.start || b.date || 0) - new Date(a.start || a.date || 0))
      .map((event) => ({ ...event }));
  },
  async getEventDetail(id) {
    await delay(60);
    const event = EVENTS.find((ev) => ev.id === id);
    if (!event) throw new Error("이벤트를 찾을 수 없습니다.");
    const meta = EVENT_META[id] || { enrolledEmpNos: [], completedEmpNos: [] };
    return {
      ...event,
      enrolledEmpNos: [...(meta.enrolledEmpNos || [])],
      completedEmpNos: [...(meta.completedEmpNos || [])],
    };
  },
  async listEmployees() {
    await delay(40);
    return dummyScheduleData.employees.map((emp) => ({ ...emp }));
  },
};

export function getDummyEmployeesForHome() {
  return dummyEmployees.map((emp) => ({ ...emp }));
}

export function getDummyEducationSchedule() {
  return dummyEducationSchedule.map((item) => ({ ...item }));
}

export function getDummyDashboardData() {
  return dummyDashboard.map((entry) => ({
    ...entry,
    quarters: entry.quarters.map((quarter) => ({
      ...quarter,
      employees: quarter.employees.map((emp) => ({ ...emp, actions: [...emp.actions] })),
    })),
  }));
}

export function getDummyEventDetail(id) {
  const event = EVENTS.find((ev) => ev.id === id);
  if (!event) return null;
  const meta = EVENT_META[id] || { enrolledEmpNos: [], completedEmpNos: [] };
  return {
    ...event,
    enrolledEmpNos: [...(meta.enrolledEmpNos || [])],
    completedEmpNos: [...(meta.completedEmpNos || [])],
  };
}

export function getDummyScheduleEvents() {
  return EVENTS.map((event) => ({ ...event }));
}
