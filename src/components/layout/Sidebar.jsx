import { X } from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "fa-solid fa-gauge-high",
  },
  {
    name: "Users",
    path: "/users",
    icon: "fa-solid fa-users",
  },
  {
    name: "Contractors",
    path: "/contractors",
    icon: "fa-solid fa-helmet-safety",
  },
  {
    name: "Companies",
    path: "/companies",
    icon: "fa-solid fa-building",
  },
  {
    name: "Projects",
    path: "/projects",
    icon: "fa-solid fa-diagram-project",
  },
  {
    name: "Jobs",
    path: "/jobs",
    icon: "fa-solid fa-briefcase",
  },
  {
    name: "Manage Posts",
    path: "/posts",
    icon: "fa-solid fa-signs-post",
  },
  {
    name: "Applications",
    path: "/applications",
    icon: "fa-solid fa-clipboard-list",
  },
  {
    name: "Tools & Calculators",
    path: "/tools",
    icon: "fa-solid fa-screwdriver-wrench",
  },
  {
    name: "Reports",
    path: "/reports",
    icon: "fa-solid fa-chart-line",
  },
  {
    name: "Audit Logs",
    path: "/audit",
    icon: "fa-solid fa-scroll",
  },
  {
    name: "Notifications",
    path: "/notifications",
    icon: "fa-solid fa-bell",
  },
  {
    name: "Roles & RBAC",
    path: "/roles",
    icon: "fa-solid fa-shield-halved",
  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-68 flex-col
          bg-white border-r border-slate-200
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-xs">
              <i className="fa-solid fa-trowel-bricks text-base" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Constructor
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Admin Panel
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="px-5 pt-5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Management
        </div>
        <nav className="scrollbar-none flex-1 space-y-1 overflow-y-auto px-3.5 pb-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `
                flex items-center gap-3
                rounded-xl px-3.5 py-2.5
                text-sm font-medium
                transition-colors duration-150
                ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-semibold border border-primary-200/60 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
                `
              }
            >
              {({ isActive }) => (
                <>
                  <i
                    className={`${item.icon} w-5 text-center text-[15px] ${
                      isActive ? "text-primary" : "text-slate-400"
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile Section */}
        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-xs">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                Admin User
              </p>
              <p className="truncate text-xs text-slate-500">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
