import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/schedule", label: "Schedule" },
  { to: "/viewer", label: "Viewer" },
  { to: "/employee", label: "Employee" },
  { to: "/notices", label: "Notices" },
];

export default function SidebarMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogout = async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      await logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      navigate("/login", { replace: true });
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-4 flex flex-1 flex-col">
      <nav className="flex-1 pb-4">
        <ul className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`block rounded p-2 transition ${
                  location.pathname.startsWith(item.to)
                    ? "bg-gray-900/70"
                    : "hover:bg-gray-700"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isProcessing}
        className="mt-auto w-full rounded bg-red-500 py-2 text-center font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isProcessing ? "로그아웃 중..." : "로그아웃"}
      </button>
    </div>
  );
}
