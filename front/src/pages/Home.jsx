// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
  const fetchEmployees = async () => {
    try {
      // api 주소 적으시오
      const res = await fetch("http://localhost:8000/api/employees/"); 
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("데이터 불러오기 실패:", err);
    }
  };

  fetchEmployees();
}, []);

  const getStatusColor = (status) => {
    if (status === "완료") return "bg-green-500";
    if (status === "진행중") return "bg-yellow-500";
    return "bg-red-500"; // 미완료
  };


  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <div className="mb-8">
          <div className="mb-8 flex items-center gap-2">
            {/* 로고 자리 */}
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-gray-800 font-bold">
              로고
            </div>
            {/* 회사 이름 */}
            <p className="text-xl font-bold">회사 이름</p>
          </div>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard" className="block p-2 hover:bg-gray-700 rounded">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/setting" className="block p-2 hover:bg-gray-700 rounded">
                Setting
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
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
        <div className="flex gap-4">
          {/* 좌측 분기별 교육 일정 */}
          <section className="flex-1 border border-gray-300 p-4 rounded bg-white overflow-y-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            <h3 className="text-lg font-semibold mb-4">교육 일정</h3>
            
            {/* 1분기 */}
            <div className="mb-6">
              <p className="font-bold mb-2">1분기</p>
              <div className="flex flex-col gap-4">
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="h-24 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">안전 장비 착용 교육</span>
                  </div>
                </div>
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="h-24 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">작업장 안전 수칙</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2분기 */}
            <div className="mb-6">
              <p className="font-bold mb-2">2분기</p>
              <div className="flex flex-col gap-4">
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="h-24 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">화재 대피 훈련</span>
                  </div>
                </div>
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="h-24 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">소화기 사용법</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3분기 */}
            <div className="mb-6">
              <p className="font-bold mb-2">3분기</p>
              <div className="flex flex-col gap-4">
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="h-24 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">전기 안전 교육</span>
                  </div>
                </div>
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="h-24 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">감전 사고 예방</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4분기 */}
            <div>
              <p className="font-bold mb-2">4분기</p>
              <div className="flex flex-col gap-4">
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="h-24 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">응급 처치 교육</span>
                  </div>
                </div>
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="h-24 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">심폐소생술(CPR)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 중앙/우측 메인 콘텐츠 */}
          <section className="flex flex-col gap-4 flex-[3]">
            {/* 전체 교육 이수율 (원형 그래프 자리) */}
            <div className="border border-gray-300 p-4 rounded bg-white">
              <h3 className="text-lg font-semibold mb-2">전체 교육 이수율</h3>
              <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500">Chart</span>
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
                          className={`w-3 h-3 rounded-full ${getStatusColor(
                            emp.status
                          )} inline-block`}
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