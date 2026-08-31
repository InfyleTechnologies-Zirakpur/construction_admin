import {
  Users,
  Building2,
  HardHat,
  FolderKanban,
} from "lucide-react";

import StatsCard from "../dashboard/StatsCard";
import UserGrowthChart from "../dashboard/UserGrowthChart";
import ProjectStatusChart from "../dashboard/ProjectStatusChart";
import OperationalStats from "../dashboard/OperationalStats";
import RecentUsers from "../dashboard/RecentUsers";
import RecentProjects from "../dashboard/RecentProjects";

import {
  dashboardStats,
  userGrowthData,
  projectStatusData,
  operationalStats,
  recentUsers,
  recentProjects,
} from "../../data/dashboardData";

const statIcons = [
  Users,
  Building2,
  HardHat,
  FolderKanban,
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Monitor your platform performance and recent activities.
          </p>
        </div>

        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          Download Report
        </button>
      </div>

      {/* Top Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatsCard
            key={stat.title}
            {...stat}
            icon={statIcons[index]}
          />
        ))}
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
          <RecentProjects projects={recentProjects} />
        </div>
      </div>

      {/* Recent Users */}
      <RecentUsers users={recentUsers} />
    </div>
  );
}