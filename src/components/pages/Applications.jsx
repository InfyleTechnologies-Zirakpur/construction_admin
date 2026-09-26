import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, Eye } from "lucide-react";
import { applicationsApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

const LIMIT = 10;

const STATUS_OPTIONS = ["pending", "shortlisted", "accepted", "rejected"];

export default function Applications() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("pending");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["applications", page],
    queryFn: () => applicationsApi.list({ page, limit: LIMIT }),
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["application", detail?.id],
    queryFn: () => applicationsApi.get(detail.id),
    enabled: !!detail,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["applications"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => applicationsApi.updateStatus(id, { status }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: `Application ${vars.status}` });
      setStatusTarget(null);
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: applications, total } = extractList(data);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const filtered = applications.filter((app) => {
    const term = search.trim().toLowerCase();
    return (
      !term ||
      app.id?.toLowerCase().includes(term) ||
      app.jobId?.toLowerCase().includes(term) ||
      app.userId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Loading..." : `Review and manage ${total} applications`}
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
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5 md:w-96">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by id, job, or user..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
        </div>

        {isError ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600">{apiError(error)}</p>
            <button
              onClick={invalidate}
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Application</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Job</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-500">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr key={app.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{app.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{app.jobId || "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{app.userId || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setDetail(app)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setStatusTarget(app);
                              setNewStatus(app.status || "pending");
                            }}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                          >
                            Update Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            Showing {total === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Update status</h3>
            <p className="mt-1 text-sm text-slate-500">Application {statusTarget.id}</p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    newStatus === status
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setStatusTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate({ id: statusTarget.id, status: newStatus })}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Application {detail.id}</h3>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Job</span>
                <span className="font-medium text-slate-800">{detail.jobId || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">User</span>
                <span className="font-medium text-slate-800">{detail.userId || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Status</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${statusColor(detail.status)}`}>
                  {detail.status}
                </span>
              </div>
              {detailLoading ? (
                <div className="py-4 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : (
                detailData?.data?.user && (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">User City</span>
                      <span className="font-medium text-slate-800">{detailData.data.user.city || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Skills</span>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {(detailData.data.user.skills || []).map((skill) => (
                          <span key={skill} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {skill}
                          </span>
                        ))}
                        {(detailData.data.user.skills || []).length === 0 && (
                          <span className="text-slate-800">—</span>
                        )}
                      </div>
                    </div>
                  </>
                )
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetail(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}