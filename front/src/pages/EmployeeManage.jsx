import ExcelUploader from "../components/ExcelUploader.jsx";
import { Link } from "react-router-dom";

export default function EmployeeManage() {
  return (
    <div className="flex h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <div className="mb-8">
          <div className="mb-8 flex items-center gap-2">
            {/* 로고 자리 */}
            <Link to="/" className="w-10 h-10 bg-white rounded flex items-center justify-center text-gray-800 font-bold">
              로고
            </Link>
            {/* 회사 이름 */}
            <Link to="/" className="text-xl font-bold">
              회사 이름
            </Link>
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

      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">사원관리</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
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
