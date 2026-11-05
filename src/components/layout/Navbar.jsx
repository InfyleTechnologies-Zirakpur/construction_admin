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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex h-12 items-center justify-between">
        {/* Left: Mobile Menu Toggle & Global Search */}
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu size={22} />
          </button>

          <div className="hidden max-w-md flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 transition-all focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 md:flex">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search users, projects, reports..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setProfileOpen(false);
              }}
              className="relative rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100"
              title="Notifications"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-xs">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {notificationOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">
                      Notifications
                    </p>
                    {unread > 0 && (
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
                        {unread} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                    {items.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">
                        No notifications
                      </p>
                    ) : (
                      items.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 transition-colors ${
                            n.isRead ? "bg-white hover:bg-slate-50" : "bg-primary-50/40 hover:bg-primary-50/70"
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {n.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                            {n.body}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setNotificationOpen(false);
                      navigate("/notifications");
                    }}
                    className="w-full border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-primary-50"
                  >
                    View all notifications
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-xs">
                AU
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-slate-900">
                  Admin User
                </p>
                <p className="text-[11px] font-medium text-slate-500">
                  Administrator
                </p>
              </div>
              <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/roles");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings size={15} className="text-slate-400" /> Settings & Roles
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
