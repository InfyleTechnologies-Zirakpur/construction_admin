import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Eye, Trash2, ChevronRight } from "lucide-react";
import { jobsApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { statusBadgeClass } from "../../theme/colors";

const COLUMNS = [
  { key: "title", label: "Job Title" },
  { key: "location", label: "Location" },
  { key: "pay", label: "Pay Rate" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Action", center: true },
];

export default function Jobs() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("all");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobsApi.list({ page: 1, limit: 100 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["jobs"] });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobsApi.remove(id),
    onSuccess: () => {
      setNotice({ type: "success", text: "Job listing deleted successfully" });
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
    if (action === "moderate" || action === "view") {
      navigate(`/jobs/${job.id}`);
    }
    if (action === "delete" && window.confirm(`Delete "${job.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(job.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Workforce & Recruitment
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Job Opportunities
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isLoading ? "Loading jobs..." : `Review and moderate ${total} job postings`}
          </p>
        </div>

        {/* Category Filter */}
        <select
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-primary focus:outline-none shadow-xs"
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
          className={`rounded-xl border px-4 py-3 text-xs font-medium ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Jobs Table Card */}
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
            id="jobs-table"
            columns={COLUMNS}
            data={filtered}
            onAction={onAction}
            emptyText="No jobs found matching category."
            renderRow={(job) => (
              <tr
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="transition-colors hover:bg-slate-50/70 cursor-pointer"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-sm text-slate-900 hover:text-primary transition-colors">
                    {job.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {job.company?.name || job.companyId || "Unknown Company"}
                  </p>
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  {job.location || "—"}
                </td>
                <td className="px-5 py-4 text-xs font-medium text-slate-800">
                  {Number(job.dailyPay) > 0
                    ? `₹${job.dailyPay}/day`
                    : Number(job.compensation) > 0
                    ? `₹${job.compensation}`
                    : "—"}
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  {job.projectType || "—"}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadgeClass(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="inline-flex items-center gap-2">
                    <button
                      data-action="moderate"
                      data-id={job.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                      title="View details and moderate"
                    >
                      <Eye size={14} className="pointer-events-none" />
                      <span className="pointer-events-none hidden sm:inline">Details</span>
                      <ChevronRight size={14} className="pointer-events-none" />
                    </button>
                    <button
                      data-action="delete"
                      data-id={job.id}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center rounded-lg border border-red-200 p-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete Job"
                    >
                      <Trash2 size={14} className="pointer-events-none" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </div>
  );
}
