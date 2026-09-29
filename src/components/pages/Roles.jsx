import { ShieldCheck, Check, X, Loader2 } from "lucide-react";
import { usersApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import {
  ROLES,
  PermissionMatrix,
  CAPABILITY_LABELS,
  can,
  adminHasAll,
  ROLE_INFO,
  MANAGED_ROLES,
} from "../../api/matrix";
import { Avatar } from "../common/SafeImage";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export default function Roles() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState("job_seeker");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [editingUser, setEditingUser] = useState(null);

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => usersApi.update(id, patch),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: vars.label || "User updated" });
      queryClient.invalidateQueries({ queryKey: ["rbac-users"] });
      setEditingUser(null);
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["rbac-users"],
    queryFn: () => usersApi.list({ page: 1, limit: 100 }),
  });

  const users = extractList(usersData).items;
  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const handleRoleChange = (id, newRole) => {
    setNotice({ type: "", text: "" });
    updateMutation.mutate({
      id,
      patch: { role: newRole },
      label: `Role updated to ${newRole}`,
    });
  };

  const columns = [
    { key: "user", label: "User" },
    { key: "contact", label: "Contact" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", center: true },
  ];

  const renderRow = (user) => (
    <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar src={user.profilePhotoUrl} name={user.name} size="sm" />
          <div>
            <p className="font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">ID: {user.id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-slate-900">{user.email || user.phone}</p>
        <p className="text-xs text-slate-500">{user.phone || user.email}</p>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            user.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {user.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <button
          data-action="change-role"
          data-id={user.id}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
        >
          Change Role
        </button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="mt-2 text-slate-600">
            Central role management · mirrors backend permission-matrix (§10.1) · admin enforces everything
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            adminHasAll ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          <ShieldCheck size={16} />
          {adminHasAll ? "Admin has all capabilities" : "Matrix drift — check backend"}
        </span>
      </div>

      {notice.text && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Role Management</h2>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{ROLE_INFO[selectedRole].label}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {ROLE_INFO[selectedRole].does} · ❌ {ROLE_INFO[selectedRole].doesNot}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {Object.keys(PermissionMatrix).map((cap) => (
              <span
                key={cap}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  can(cap, selectedRole)
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {can(cap, selectedRole) ? <Check size={12} /> : <X size={12} />}
                {CAPABILITY_LABELS[cap]}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">User Count by Role</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
              {ROLES.map((role) => (
                <div
                  key={role}
                  className={`rounded-lg p-4 text-center ${
                    role === "admin" ? "bg-slate-100" : "bg-white"
                  } border border-slate-200`}
                >
                  <p className="text-2xl font-bold text-slate-900">
                    {roleCounts[role] || 0}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{role.replace("_", " ")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">All Users</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : (
            <DataTable
              id="roles-users-table"
              columns={columns}
              data={users}
              renderRow={renderRow}
              onAction={(action, id) => {
                if (action === "change-role") {
                  const user = users.find((u) => String(u.id) === String(id));
                  if (user) setEditingUser(user);
                }
              }}
            />
          )}
        </div>

        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900">Change Role</h3>
              <p className="mt-1 text-sm text-slate-500">
                Update role for <span className="font-medium">{editingUser.name}</span>
              </p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Role</label>
                <p className="text-sm text-slate-500">{editingUser.role}</p>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">New Role</label>
                <select
                  defaultValue={editingUser.role}
                  id="role-select"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {MANAGED_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  defaultValue={editingUser.isActive ? "active" : "inactive"}
                  id="status-select"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const newRole = document.getElementById("role-select").value;
                    const newStatus = document.getElementById("status-select").value;
                    handleRoleChange(editingUser.id, newRole);
                    if (newStatus !== (editingUser.isActive ? "active" : "inactive")) {
                      updateMutation.mutate({
                        id: editingUser.id,
                        patch: { isActive: newStatus === "active" },
                        label: `Status updated to ${newStatus}`,
                      });
                    }
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm mt-8">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 font-semibold text-slate-700">Capability</th>
                {ROLES.map((role) => (
                  <th key={role} className="px-4 py-4 text-center font-semibold text-slate-700">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(PermissionMatrix).map((cap) => (
                <tr key={cap} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-3.5 font-medium text-slate-900">{CAPABILITY_LABELS[cap]}</td>
                  {ROLES.map((role) => (
                    <td key={role} className="px-4 py-3.5 text-center">
                      {can(cap, role) ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check size={16} />
                        </span>
                      ) : (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                          <X size={16} />
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
