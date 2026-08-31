import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Sun,
  Settings,
} from "lucide-react";
import { useState } from "react";

export default function Navbar({ setSidebarOpen }) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
      <div className="flex h-16 items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors lg:hidden"
          >
            <Menu size={24} className="text-slate-700" />
          </button>

          <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 md:flex hover:bg-slate-200 transition-colors">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Search users, projects, reports..."
              className="w-64 bg-transparent text-sm outline-none placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
            <Sun size={20} className="text-slate-600" />
          </button>

          <button className="relative rounded-lg p-2 hover:bg-slate-100 transition-colors group">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          <div className="hidden h-6 w-px bg-slate-300 sm:block" />

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm">
                AU
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">Admin User</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <ChevronDown size={16} className="text-slate-500 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-slate-200 shadow-lg py-2">
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Settings size={16} /> Settings
                </button>
                <hr className="my-1" />
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}