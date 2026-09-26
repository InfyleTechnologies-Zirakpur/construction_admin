import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, IndianRupee, BriefcaseBusiness } from "lucide-react";
import { jobsApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

const LIMIT = 12;

export default function Jobs() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [moderateTarget, setModerateTarget] = useState(null);
  const [moderateStatus, setModerateStatus] = useState("published");
  const [remarks, setRemarks] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs", page],
    queryFn: () => jobsApi.list({ page, limit: LIMIT }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["jobs"] });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status, remarks: remark }) =>
      jobsApi.moderate(id, {
        status,
        ...(remark ? { moderationRemarks: remark } : {}),
      }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: `Job ${vars.status}` });
      setModerateTarget(null);
      setRemarks("");
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobsApi.remove(id),
    onSuccess: () => {
      setNotice({ type: "success", text: "Job deleted" });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: jobs, total } = extractList(data);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Loading..." : `Browse and moderate ${total} posted jobs`}
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

      {isError ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-red-600">{apiError(error)}</p>
          <button
            onClick={invalidate}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-sm text-slate-500">
          No jobs found
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <BriefcaseBusiness size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-500">Company ID: {job.companyId || "—"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={16} />
                      <span className="text-sm">{job.location || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <IndianRupee size={16} />
                      <span className="text-sm">{job.dailyPay != null ? `₹${job.dailyPay}/day` : "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(job.status)}`}>
                    {job.status}
                  </span>
                  {job.status === "published" ? (
                    <button
                      onClick={() => {
                        setModerateTarget(job);
                        setModerateStatus("published");
                        setRemarks("");
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                    >
                      Moderate
                    </button>
                  ) : job.status === "pending" ? (
                    <button
                      onClick={() => {
                        setModerateTarget(job);
                        setModerateStatus("published");
                        setRemarks("");
                      }}
                      className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-600 transition-colors"
                    >
                      Review
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setModerateTarget(job);
                        setModerateStatus("published");
                        setRemarks("");
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                    >
                      Re-publish
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${job.title}"? This cannot be undone.`)) {
                        deleteMutation.mutate(job.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {moderateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Moderate job</h3>
            <p className="mt-1 text-sm text-slate-500">{moderateTarget.title}</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Decision</label>
                <div className="flex gap-2">
                  {[
                    { key: "published", label: "Approve" },
                    { key: "rejected", label: "Reject" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setModerateStatus(option.key)}
                      className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                        moderateStatus === option.key
                          ? option.key === "published"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-red-500 bg-red-50 text-red-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {moderateStatus === "rejected" && (
                <div>
                  <label htmlFor="job-remarks" className="mb-2 block text-sm font-medium text-slate-700">
                    Remarks (required for rejection)
                  </label>
                  <input
                    id="job-remarks"
                    type="text"
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    placeholder="e.g. violates policy"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setModerateTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  moderateMutation.mutate({
                    id: moderateTarget.id,
                    status: moderateStatus,
                    remarks: moderateStatus === "rejected" ? remarks : "",
                  })
                }
                disabled={moderateMutation.isPending || (moderateStatus === "rejected" && !remarks.trim())}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {moderateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}