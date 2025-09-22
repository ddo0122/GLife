import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Setting from "./pages/Setting";
import EducationSchedule from "./pages/EducationSchedule";
import ScheduleViewer from "./pages/ScheduleViewer";
import EmployeeManage from "./pages/EmployeeManage";

// ⬇️ 추가 그대로 유지
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 첫 접속 → 로그인으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 로그인 페이지 (공개) */}
          <Route path="/login" element={<Login />} />

          {/* (옵션) 홈 페이지를 쓰고 싶다면 /home 으로 접근 */}
          <Route path="/home" element={<Home />} />

          {/* 보호 페이지 묶음 */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/schedule" element={<EducationSchedule />} />
            <Route path="/viewer" element={<ScheduleViewer />} />
            <Route path="/employee" element={<EmployeeManage />} />
          </Route>

          {/* 존재하지 않는 경로 → 로그인 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
