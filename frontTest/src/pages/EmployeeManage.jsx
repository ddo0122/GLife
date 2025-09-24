import ExcelUploader from "../components/ExcelUploader.jsx";
import { Link } from "react-router-dom";
import SidebarBrand from "../components/SidebarBrand";

export default function EmployeeManage() {
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

      <div className="mx-auto w-full max-w-6xl space-y-6 mt-12 px-6">
        <h1 className="text-2xl font-bold text-white drop-shadow">사원관리</h1>
        <div className="bg-white rounded-xl shadow-lg border border-white/40 p-8 w-full">
          <h2 className="text-lg font-semibold mb-3">엑셀 업로드</h2>
          <p className="text-sm text-gray-600 mb-4">
            헤더 예시: <b>사번, 이름, 부서, 연락처, 이메일</b>
          </p>
          <ExcelUploader />
        </div>
      </div>
    </div>
  );
}
