import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Check, X, Loader2, UserCog, ChevronRight } from "lucide-react";
import { usersApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import {
  ROLES,
  PermissionMatrix,
  CAPABILITY_LABELS,
  can,
  adminHasAll,
  ROLE_INFO,
} from "../../api/matrix";
import { Avatar } from "../common/SafeImage";
import { useQuery } from "@tanstack/react-query";
import { roleBadgeClass } from "../../theme/colors";

export default function Roles() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("job_seeker");

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["rbac-users"],
    queryFn: () => usersApi.list({ page: 1, limit: 100 }),
  });

  const users = extractList(usersData).items;
  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const columns = [
    { key: "user", label: "User" },
    { key: "contact", label: "Contact" },
    { key: "role", label: "Assigned Role" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Action", center: true },
  ];

  const renderRow = (user) => (
    <tr
      key={user.id}
      onClick={() => navigate(`/roles/user/${user.id}`)}
      className="transition-colors hover:bg-slate-50/70 cursor-pointer"
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar user={user} size={36} />
          <div>
            <p className="font-semibold text-sm text-slate-900 hover:text-primary transition-colors">
              {user.fullName || user.name || "User"}
            </p>
            <p className="text-[11px] text-slate-400">ID: {user.id.slice(0, 8)}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-xs text-slate-600">
        <p className="font-medium text-slate-800">{user.email || user.phone || "—"}</p>
        <p className="text-slate-400">{user.phone || ""}</p>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${roleBadgeClass(user.role)}`}>
          {user.role}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            user.isActive !== false
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {user.isActive !== false ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-4 text-center">
        <button
          data-action="change-role"
          data-id={user.id}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
        >
          <UserCog size={14} className="pointer-events-none" />
          <span className="pointer-events-none hidden sm:inline">Modify Role</span>
          <ChevronRight size={14} className="pointer-events-none" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Access Control
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Roles & Permissions (RBAC)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Define security roles, capabilities, and assign system access.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold ${
            adminHasAll
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <ShieldCheck size={16} />
          {adminHasAll ? "Admin Root Privileges Active" : "Permission Matrix Warning"}
        </span>
      </div>

      {/* Role Counts Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ROLES.map((role) => (
          <div
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`cursor-pointer rounded-2xl border p-4 transition-all shadow-xs ${
              selectedRole === role
                ? "border-primary bg-primary-50/40 ring-2 ring-primary/20"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 capitalize">
                {role.replace("_", " ")}
              </span>
              <span className={`h-2.5 w-2.5 rounded-full ${selectedRole === role ? "bg-primary" : "bg-slate-300"}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {roleCounts[role] || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Assigned accounts</p>
          </div>
        ))}
      </div>

      {/* Selected Role Capabilities Card */}
      {ROLE_INFO[selectedRole] && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {ROLE_INFO[selectedRole].label} Capabilities
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Authorized: {ROLE_INFO[selectedRole].does}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.keys(PermissionMatrix).map((cap) => {
              const allowed = can(cap, selectedRole);
              return (
                <span
                  key={cap}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    allowed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {allowed ? <Check size={12} /> : <X size={12} />}
                  {CAPABILITY_LABELS[cap]}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Users Role Management Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Assigned User Accounts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click on any user to change their security privileges on a dedicated configuration page.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            id="roles-users-table"
            columns={columns}
            data={users}
            renderRow={renderRow}
            onAction={(action, id) => {
              navigate(`/roles/user/${id}`);
            }}
          />
        )}
      </div>

      {/* Global Permission Matrix Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Global Permission Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete capability comparison across all system personas.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-slate-500">Capability</th>
                {ROLES.map((role) => (
                  <th key={role} className="px-4 py-3 text-center font-semibold uppercase tracking-wider text-slate-500 capitalize">
                    {role.replace("_", " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(PermissionMatrix).map((cap) => (
                <tr key={cap} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{CAPABILITY_LABELS[cap]}</td>
                  {ROLES.map((role) => (
                    <td key={role} className="px-4 py-3 text-center">
                      {can(cap, role) ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                          <X size={14} />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
