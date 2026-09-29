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
    name: "Applications",
    path: "/applications",
    icon: "fa-solid fa-clipboard-list",
  },
  {
    name: "Tools",
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
    name: "RBAC",
    path: "/roles",
    icon: "fa-solid fa-shield-halved",
  },
];

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-68 flex-col
          bg-dark text-white
          transition-transform duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-dark-600 text-lg font-bold text-white">
              A
            </div>
            <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Adminly
            </h1>

            <p className="text-[11px] uppercase tracking-[0.18em] text-primary-300">
              Control center
            </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-6 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-dark-300">Workspace</div>
        <nav className="scrollbar-none flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {menuItems.map((item) => {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3
                  rounded-lg px-4 py-3
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary-600 font-semibold text-white shadow-[0_8px_24px_rgba(255,122,0,0.35)]"
                      : "text-dark-200 hover:bg-white/10 hover:text-white"
                  }
                  `
                }
              >
                <i className={`${item.icon} w-5 text-center text-[17px]`} aria-hidden="true" />

                <span className="font-medium">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto w-full border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-600 font-bold text-white">
              A
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Admin User
              </p>

              <p className="text-xs text-dark-300">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}