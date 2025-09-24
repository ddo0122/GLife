import ExcelUploader from "../components/ExcelUploader.jsx";
import SidebarBrand from "../components/SidebarBrand";
import SidebarMenu from "../components/SidebarMenu";

export default function EmployeeManage() {
  return (
    <div className="flex h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <SidebarBrand />
        <SidebarMenu />
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
