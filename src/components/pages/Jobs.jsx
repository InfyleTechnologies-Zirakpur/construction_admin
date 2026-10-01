import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { jobsApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { useFocusHighlight, focusRing } from "../../hooks/useFocusHighlight";
import { statusBadgeClass } from "../../theme/colors";

const COLUMNS = [
  { key: "title", label: "Job" },
  { key: "location", label: "Location" },
  { key: "pay", label: "Pay" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", center: true },
];

export default function Jobs() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("all");
  const [moderateTarget, setModerateTarget] = useState(null);
  const [moderateStatus, setModerateStatus] = useState("published");
  const [remarks, setRemarks] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const focusId = useFocusHighlight();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobsApi.list({ page: 1, limit: 100 }),
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
  const categories = ["all", ...new Set(jobs.map((j) => j.projectType).filter(Boolean))];
  const filtered = category === "all" ? jobs : jobs.filter((j) => j.projectType === category);

  const onAction = (action, id) => {
    const job = jobs.find((j) => String(j.id) === String(id));
    if (!job) return;
    if (action === "moderate") {
      setModerateTarget(job);
      setModerateStatus("published");
      setRemarks("");
      setNotice({ type: "", text: "" });
    }
    if (action === "delete" && window.confirm(`Delete "${job.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(job.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Loading..." : `Categories, listings, moderation & applications — ${total} jobs`}
          </p>
        </div>
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
          ))}
        </select>
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
        ) : isLoading ? (
          <div className="p-10 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <DataTable
            id="jobs-table"
            columns={COLUMNS}
            data={filtered}
            onAction={onAction}
            emptyText="No jobs found"
            renderRow={(job) => (
              <tr key={job.id} id={`row-${job.id}`} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${focusRing(job.id, focusId)}`}>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="text-xs text-slate-500">Company: {job.company?.name || job.companyId || "—"}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{job.location || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {Number(job.dailyPay) > 0
                    ? `₹${job.dailyPay}/day`
                    : Number(job.compensation) > 0
                      ? `₹${job.compensation}`
                      : "—"}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{job.projectType || "—"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      data-action="moderate"
                      data-id={job.id}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                    >
                      <span className="pointer-events-none">Moderate</span>
                    </button>
                    <button
                      data-action="delete"
                      data-id={job.id}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <span className="pointer-events-none">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        )}
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
