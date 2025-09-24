import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SidebarBrand from "../components/SidebarBrand";
import { getDummyDashboardData } from "../lib/dummyData";

const USE_DUMMY_DATA = import.meta.env?.VITE_USE_LOCAL_AUTH === "true";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    let isMounted = true;

    const initSelection = (dataset) => {
      if (!dataset.length) return;
      const firstYear = dataset[0];
      setSelectedYear(firstYear.year);
      if (firstYear.quarters?.length) setSelectedQuarter(firstYear.quarters[0].quarter);
    };

    const load = async () => {
      if (USE_DUMMY_DATA) {
        const dummy = getDummyDashboardData();
        if (!isMounted) return;
        setData(dummy);
        initSelection(dummy);
        return;
      }

      try {
        const res = await fetch("/data/dashboard.json");
        const json = await res.json();
        if (!isMounted) return;
        setData(json);
        initSelection(json);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentYearData = data.find(d => d.year === selectedYear);
  const currentQuarterData = currentYearData?.quarters.find(q => q.quarter === selectedQuarter);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (Home 기준) */}
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

      {/* Main content */}
      <main className="flex-1 p-6 flex flex-col gap-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 min-h-screen">
        {/* Header with title and selection */}
        <header className="flex flex-col items-center gap-5">
          <h1 className="text-3xl font-bold text-white drop-shadow-md">Dashboard</h1>
          <div className="flex gap-6 bg-white bg-opacity-80 rounded-lg p-4 shadow-md">
            {/* Year Selector */}
            <select
              className="p-2 rounded border border-gray-300 text-lg font-semibold"
              value={selectedYear || ""}
              onChange={(e) => {
                const year = Number(e.target.value);
                setSelectedYear(year);
                const yearData = data.find(d => d.year === year);
                setSelectedQuarter(yearData?.quarters[0]?.quarter || null);
                setExpandedRows({});
              }}
            >
              {data.map((d) => (
                <option key={d.year} value={d.year}>{d.year}년</option>
              ))}
            </select>

            {/* Quarter Selector */}
            <select
              className="p-2 rounded border border-gray-300 text-lg font-semibold"
              value={selectedQuarter || ""}
              onChange={(e) => {
                setSelectedQuarter(e.target.value);
                setExpandedRows({});
              }}
            >
              {currentYearData?.quarters.map(q => (
                <option key={q.quarter} value={q.quarter}>{q.quarter}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Training Status Table */}
        <section className="flex-1 bg-white bg-opacity-90 rounded-lg p-6 shadow-lg overflow-auto max-h-[calc(100vh-220px)]">
          {currentQuarterData ? (
            <>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{currentQuarterData.training}</h2>
              {currentQuarterData.employees.length > 0 ? (
                <table className="min-w-full border-collapse text-base" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr className="bg-gray-100 sticky top-0 z-10">
                      <th className="px-3 py-4 h-12 text-left font-semibold text-gray-700 text-lg">사번</th>
                      <th className="px-2 py-4 h-12 text-left font-semibold text-gray-700 text-lg">이름</th>
                      <th className="px-3 py-4 h-12 text-center font-semibold text-gray-700 text-lg">이행률</th>
                      <th className="px-3 py-4 h-12 text-lg"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentQuarterData.employees.map(emp => {
                      const avg = Math.round(emp.actions.reduce((a, b) => a + b, 0) / emp.actions.length);
                      return (
                        <React.Fragment key={emp.id}>
                          <tr className="border-t border-gray-300 hover:bg-gray-50 transition">
                            <td className="px-3 py-4 h-12 flex items-center text-lg">
                              <div className="w-8 h-8 rounded-full bg-gray-400 inline-block mr-2"></div>
                              {emp.id}
                            </td>
                            <td className="px-1 py-4 h-12 text-lg">{emp.name}</td>
                            <td className="px-3 py-4 h-12 text-center text-lg">{avg}%</td>
                            <td className="px-3 py-4 h-12 text-center text-lg">
                              <button
                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm focus:outline-none"
                                onClick={() => toggleRow(emp.id)}
                                aria-expanded={expandedRows[emp.id] ? "true" : "false"}
                                aria-controls={`actions-${emp.id}`}
                              >
                                {expandedRows[emp.id] ? "접기" : "상세보기"}
                              </button>
                            </td>
                          </tr>
                          {expandedRows[emp.id] && (
                            <tr className="bg-gray-50">
                              <td colSpan={4} className="px-6 py-3">
                                <div id={`actions-${emp.id}`} className="transition ease-in-out flex flex-col gap-3 overflow-hidden">
                                  {emp.actions.map((action, index) => (
                                    <div key={index} className="w-full">
                                      <div className="flex justify-between mb-1 text-sm font-semibold text-gray-700">
                                        <span>행동 {index + 1}</span>
                                        <span>{action}%</span>
                                      </div>
                                      <div className="w-full bg-gray-300 rounded h-5">
                                        <div className="bg-indigo-600 h-5 rounded transition-all duration-300" style={{ width: `${action}%` }}></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-600 mt-10 font-medium">해당 분기에 교육을 받은 직원이 없습니다.</p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-700 text-lg mt-20 font-semibold">선택한 년도/분기에 데이터가 없습니다.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
