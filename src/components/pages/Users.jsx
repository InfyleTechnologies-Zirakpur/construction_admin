import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronRight, Eye } from "lucide-react";
import { usersApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { Avatar } from "../common/SafeImage";
import { roleBadgeClass } from "../../theme/colors";

const ROLE_FILTERS = [
  { key: "all", label: "All Users" },
  { key: "job_seeker", label: "Job Seekers" },
  { key: "company", label: "Companies" },
];

const COLUMNS = [
  { key: "user", label: "User" },
  { key: "contact", label: "Contact Details" },
  { key: "role", label: "Role" },
  { key: "status", label: "Account Status" },
  { key: "actions", label: "Action", center: true },
];

export default function Users() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", roleFilter],
    queryFn: () =>
      usersApi.list({
        page: 1,
        limit: 100,
        ...(roleFilter !== "all" ? { role: roleFilter } : {}),
      }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const { items: users, total } = extractList(data);

  const onAction = (action, id) => {
    if (action === "profile" || action === "view") {
      navigate(`/users/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            User Management
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Platform Users
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isLoading ? "Loading users..." : `Browse, inspect, and manage ${total} registered users`}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setRoleFilter(filter.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                roleFilter === filter.key
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isError ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-red-600">{apiError(error)}</p>
            <button
              onClick={invalidate}
              className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            id="users-table"
            columns={COLUMNS}
            data={users}
            onAction={onAction}
            emptyText="No users found matching current filter."
            renderRow={(user) => {
              const inactive = user.isActive === false;
              return (
                <tr
                  key={user.id}
                  onClick={() => navigate(`/users/${user.id}`)}
                  className="transition-colors hover:bg-slate-50/70 cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} size={38} />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 hover:text-primary transition-colors">
                          {user.fullName || "—"}
                        </p>
                        <p className="text-xs text-slate-400">{user.city || "No city"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">
                    <p className="font-medium text-slate-800">{user.email || "—"}</p>
                    <p className="text-slate-400 mt-0.5">{user.phone || ""}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${roleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        inactive
                          ? "bg-slate-100 text-slate-600 border border-slate-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {inactive ? "Inactive / Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      data-action="profile"
                      data-id={user.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                      title="View user details"
                    >
                      <Eye size={14} className="pointer-events-none" />
                      <span className="pointer-events-none hidden sm:inline">Details</span>
                      <ChevronRight size={14} className="pointer-events-none" />
                    </button>
                  </td>
                </tr>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
