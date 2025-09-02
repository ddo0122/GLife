import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard"
import Setting from "./pages/Setting";
import EducationSchedule from "./pages/EducationSchedule"
import ScheduleViewer from "./pages/ScheduleViewer";
import EmployeeManage from "./pages/EmployeeManage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/schedule" element={<EducationSchedule />} />
        <Route path="/viewer" element={<ScheduleViewer />} />
        <Route path="/employee" element={<EmployeeManage />} />
      </Routes>
    </Router>
  );
}

export default App;