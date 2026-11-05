import {
  Users,
  Building2,
  HardHat,
  FolderKanban,
  Download,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usersApi, companiesApi, contractorsApi, projectsApi, extractList, apiError } from "../../api";

import StatsCard from "../dashboard/StatsCard";
import UserGrowthChart from "../dashboard/UserGrowthChart";
import ProjectStatusChart from "../dashboard/ProjectStatusChart";
import OperationalStats from "../dashboard/OperationalStats";
import RecentUsers from "../dashboard/RecentUsers";
import RecentProjects from "../dashboard/RecentProjects";

import {
  userGrowthData,
  projectStatusData,
  operationalStats,
} from "../../data/dashboardData";

const statIcons = [Users, Building2, HardHat, FolderKanban];
const countAll = (payload) => extractList(payload).total;

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () =>
      Promise.all([
        usersApi.list({ page: 1, limit: 6 }),
        companiesApi.list({ page: 1, limit: 6 }),
        contractorsApi.list({ page: 1, limit: 6 }),
        projectsApi.list({ page: 1, limit: 6 }),
      ]),
  });

  const [usersData, companiesData, contractorsData, projectsData] = data || [];

  const dashboardStats = [
    { title: "Total Users", value: countAll(usersData), change: "+12%", trend: "up" },
    { title: "Registered Companies", value: countAll(companiesData), change: "+8%", trend: "up" },
    { title: "Active Contractors", value: countAll(contractorsData), change: "+5%", trend: "up" },
    { title: "Construction Projects", value: countAll(projectsData), change: "+14%", trend: "up" },
  ];

  const recentUsers = extractList(usersData).items.map((user) => ({
    id: user.id,
    name: user.fullName || user.email,
    email: user.email,
    role: user.role,
    status: user.isBlocked ? "Blocked" : user.isActive === false ? "Inactive" : "Active",
    date: user.createdAt || "",
  }));

  const recentProjects = extractList(projectsData).items.map((project) => ({
    id: project.id,
    name: project.name,
    contractor: project.location || "",
    progress: Number(project.progress) || 45,
    status: project.status || "active",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Overview Dashboard
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome to Constructor Admin
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Real-time operations, verification requests, and platform analytics.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-primary/20 transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <Download size={15} />
          Print / Export Report
        </button>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          Failed to load live data: {apiError(error)}
        </div>
      )}

      {/* Top Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))
          : dashboardStats.map((stat, index) => (
              <StatsCard
                key={stat.title}
                {...stat}
                icon={statIcons[index]}
              />
            ))}
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UserGrowthChart data={userGrowthData} />
        </div>
        <div>
          <ProjectStatusChart data={projectStatusData} />
        </div>
      </div>

      {/* Operational Stats & Recent Projects */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <OperationalStats data={operationalStats} />
        </div>
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ) : (
            <RecentProjects projects={recentProjects} />
          )}
        </div>
      </div>

      {/* Recent Users List */}
      <div>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <RecentUsers users={recentUsers} />
        )}
      </div>
    </div>
  );
}
