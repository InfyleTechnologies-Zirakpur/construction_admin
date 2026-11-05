import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Check,
  X,
  User,
} from "lucide-react";
import { usersApi, apiError } from "../../api";
import {
  MANAGED_ROLES,
  ROLE_INFO,
  PermissionMatrix,
  CAPABILITY_LABELS,
  can,
} from "../../api/matrix";
import { roleBadgeClass } from "../../theme/colors";

export default function UserRoleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [role, setRole] = useState("job_seeker");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  const { data: userData, isLoading, isError, error: fetchError } = useQuery({
    queryKey: ["rbac-user-detail", id],
    queryFn: () => usersApi.get(id),
  });

  const user = userData?.data ?? userData;

  useEffect(() => {
    if (user) {
      if (user.role) setRole(user.role);
      setIsActive(user.isActive !== false);
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (patch) => usersApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/roles");
    },
    onError: (err) => setError(apiError(err)),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    updateMutation.mutate({
      role,
      isActive,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-red-600">{apiError(fetchError) || "User not found"}</p>
        <button
          onClick={() => navigate("/roles")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
        >
          Back to Roles & RBAC
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div>
        <button
          onClick={() => navigate("/roles")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Roles & RBAC
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Modify User Role & Privileges
            </h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(user.role)}`}>
              Current: {user.role}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Assign security roles and authorization capabilities to <strong className="text-slate-800">{user.fullName || user.email || user.name}</strong>.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {MANAGED_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Account Status
              </label>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="active">Active (Access Allowed)</option>
                <option value="inactive">Inactive (Access Suspended)</option>
              </select>
            </div>
          </div>

          {/* Role Capabilities Preview */}
          {ROLE_INFO[role] && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {ROLE_INFO[role].label} Permissions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allows: {ROLE_INFO[role].does}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                {Object.keys(PermissionMatrix).map((cap) => {
                  const allowed = can(cap, role);
                  return (
                    <span
                      key={cap}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        allowed
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {allowed ? <Check size={11} /> : <X size={11} />}
                      {CAPABILITY_LABELS[cap]}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/roles")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Save Role Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

