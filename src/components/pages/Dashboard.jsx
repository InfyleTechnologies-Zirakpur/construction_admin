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
    { title: "Total Users", value: countAll(usersData), change: "Live", trend: "up" },
    { title: "Companies", value: countAll(companiesData), change: "Live", trend: "up" },
    { title: "Contractors", value: countAll(contractorsData), change: "Live", trend: "up" },
    { title: "Projects", value: countAll(projectsData), change: "Live", trend: "up" },
  ];

  const recentUsers = extractList(usersData).items.map((user) => ({
    id: user.id,
    name: user.fullName || user.email,
    email: user.email,
    role: user.role,
    status: user.isBlocked ? "Blocked" : user.isActive === false ? "Pending" : "Active",
    date: user.createdAt || "",
  }));

  const recentProjects = extractList(projectsData).items.map((project) => ({
    id: project.id,
    name: project.name,
    contractor: project.location || "",
    progress: Number(project.progress) || 0,
    status: project.status || "",
  }));

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Admin overview
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">
            Good morning, Admin
          </h1>

          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            Here is what is happening across your platform today.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,122,0,0.22)] transition hover:brightness-110">
          <Download size={17} />
          Export report
        </button>
      </div>

      {isError && (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-2.5 text-sm text-error-700">
          Failed to load dashboard data: {apiError(error)}
        </div>
      )}

      {/* Top Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl border border-line bg-white" />
          ))
        ) : (
          dashboardStats.map((stat, index) => (
            <StatsCard
              key={stat.title}
              {...stat}
              icon={statIcons[index]}
            />
          ))
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <UserGrowthChart data={userGrowthData} />
        </div>

        <ProjectStatusChart data={projectStatusData} />
      </div>

      {/* Operational Statistics + Projects */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <OperationalStats data={operationalStats} />
        </div>

        <div className="xl:col-span-2">
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ) : (
            <RecentProjects projects={recentProjects} />
          )}
        </div>
      </div>

      {/* Recent Users */}
      {isLoading ? (
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="mx-auto mt-28 h-6 w-6 animate-spin text-slate-300" />
        </div>
      ) : (
        <RecentUsers users={recentUsers} />
      )}
    </div>
  );
}