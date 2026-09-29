import {
  Menu,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi, extractList } from "../../api";

export default function Navbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["navbar-notifications"],
    queryFn: () => notificationsApi.mine({ page: 1, limit: 10 }),
    refetchInterval: 60000,
  });
  const items = extractList(data?.data ?? data).items;
  const unread = items.filter((n) => !n.isRead).length;

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
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100 lg:hidden"
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
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setProfileOpen(false);
              }}
              className="relative rounded-lg p-2.5 transition-colors hover:bg-slate-100"
              title="Admin notifications"
            >
              <Bell size={20} className="text-slate-700" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {notificationOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">
                      Notifications {unread > 0 && <span className="text-red-500">({unread} new)</span>}
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {items.length === 0 && (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications</p>
                    )}
                    {items.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        className={`border-b border-slate-50 px-4 py-3 last:border-0 ${n.isRead ? "" : "bg-blue-50/50"}`}
                      >
                        <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.body}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setNotificationOpen(false);
                      navigate("/notifications");
                    }}
                    className="w-full bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-primary-700 transition-colors hover:bg-slate-100"
                  >
                    View all notifications
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationOpen(false);
              }}
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
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-line bg-white py-2 shadow-lg">
                <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                  <Settings size={16} /> Settings
                </button>
                <hr className="my-1 border-line" />
                <button
                  onClick={handleLogout}
                  className="text-error hover:bg-error-50 flex w-full items-center gap-2 px-4 py-2 text-left text-sm"
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
