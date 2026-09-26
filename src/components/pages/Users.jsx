import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MoreHorizontal, Loader2, UserCheck, UserX, Trash2 } from "lucide-react";
import { usersApi, extractList, apiError } from "../../api";
import { roleBadgeClass } from "../../theme/colors";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "blocked", label: "Blocked" },
  { key: "inactive", label: "Inactive" },
];

const LIMIT = 10;

export default function Users() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", page],
    queryFn: () => usersApi.list({ page, limit: LIMIT }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const blockMutation = useMutation({
    mutationFn: ({ id, blocked }) =>
      usersApi.update(id, {
        isBlocked: blocked,
        blockedReason: blocked ? "blocked by admin" : "",
      }),
    onSuccess: (_res, vars) => {
      setNotice({
        type: "success",
        text: vars.blocked ? "User blocked" : "User unblocked",
      });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => usersApi.remove(id),
    onSuccess: () => {
      setNotice({ type: "success", text: "User deactivated" });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: users, total } = extractList(data);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const filtered = users.filter((user) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      user.fullName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phone?.toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "blocked" && user.isBlocked) ||
      (statusFilter === "inactive" && !user.isActive && !user.isBlocked) ||
      (statusFilter === "active" && user.isActive && !user.isBlocked);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Loading..." : `Manage and view all ${total} users`}
          </p>
        </div>
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

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5 md:w-96">
              <Search size={18} className="text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
            <div className="flex gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    statusFilter === filter.key
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isError ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600">{apiError(error)}</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const blocked = !!user.isBlocked;
                    const inactive = !blocked && !user.isActive;
                    return (
                      <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                              {(user.fullName || user.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.fullName}</p>
                              <p className="text-xs text-slate-500">{user.city || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.phone || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${roleBadgeClass(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              blocked
                                ? "bg-red-50 text-red-700"
                                : inactive
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {blocked ? "Blocked" : inactive ? "Inactive" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center relative">
                          {blockMutation.isPending || deactivateMutation.isPending ? (
                            <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                          ) : (
                            <button
                              onClick={() => {
                                setOpenMenu(openMenu === user.id ? null : user.id);
                                setNotice({ type: "", text: "" });
                              }}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreHorizontal size={18} className="text-slate-500" />
                            </button>
                          )}
                          {openMenu === user.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                              <div className="absolute right-4 top-14 z-20 w-44 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg">
                                <button
                                  onClick={() => {
                                    blockMutation.mutate({ id: user.id, blocked: !blocked });
                                    setOpenMenu(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  {blocked ? <UserCheck size={15} className="text-emerald-600" /> : <UserX size={15} className="text-amber-600" />}
                                  {blocked ? "Unblock" : "Block"}
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Deactivate ${user.fullName || user.email}?`)) {
                                      deactivateMutation.mutate(user.id);
                                    }
                                    setOpenMenu(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={15} /> Deactivate
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            {total === 0 ? 0 : (page - 1) * LIMIT + 1}
            –{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                setOpenMenu(null);
              }}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                setOpenMenu(null);
              }}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}