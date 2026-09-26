import {
  Menu,
  Search,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors lg:hidden"
          >
            <Menu size={24} className="text-slate-700" />
          </button>

          <div className="hidden items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 shadow-sm md:flex">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Search users, projects, reports..."
              className="w-64 bg-transparent text-sm text-dark outline-none placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-primary-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-600 text-sm font-bold text-white shadow-sm">
                AU
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-dark">Admin User</p>
                <p className="text-xs text-primary-700">Administrator</p>
              </div>
              <ChevronDown size={16} className="hidden text-primary-700 sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-line shadow-lg py-2">
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Settings size={16} /> Settings
                </button>
                <hr className="my-1 border-line" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}