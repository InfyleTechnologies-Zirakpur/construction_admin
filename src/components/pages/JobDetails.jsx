import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  Briefcase,
  MapPin,
  IndianRupee,
  Calendar,
  Building2,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { jobsApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [moderateStatus, setModerateStatus] = useState("published");
  const [remarks, setRemarks] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data: jobsData, isLoading, isError, error } = useQuery({
    queryKey: ["jobs-all"],
    queryFn: () => jobsApi.list({ page: 1, limit: 100 }),
  });

  const jobs = extractList(jobsData).items;
  const job = jobs.find((j) => String(j.id) === String(id));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["jobs-all"] });
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
  };

  const moderateMutation = useMutation({
    mutationFn: ({ status, remark }) =>
      jobsApi.moderate(id, {
        status,
        ...(remark ? { moderationRemarks: remark } : {}),
      }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: `Job status updated to "${vars.status}"` });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => jobsApi.remove(id),
    onSuccess: () => {
      alert("Job deleted successfully");
      navigate("/jobs");
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-red-600">{apiError(error) || "Job posting not found"}</p>
        <button
          onClick={() => navigate("/jobs")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
        >
          Back to Jobs List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate("/jobs")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Jobs
        </button>

        <button
          onClick={() => {
            if (window.confirm(`Delete "${job.title}"? This cannot be undone.`)) {
              deleteMutation.mutate();
            }
          }}
          disabled={deleteMutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          <Trash2 size={15} /> Delete Job
        </button>
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

      {/* Main Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary">
            <Briefcase size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {job.title}
              </h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(job.status)}`}>
                {job.status}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-slate-400" />
                {job.company?.name || job.companyName || "Unknown Company"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" /> {job.location || "Location not set"}
              </span>
              <span className="flex items-center gap-1.5">
                <IndianRupee size={14} className="text-slate-400" />
                {Number(job.dailyPay) > 0
                  ? `₹${job.dailyPay} / day`
                  : Number(job.compensation) > 0
                  ? `₹${job.compensation}`
                  : "Compensation not specified"}
              </span>
              {job.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Panel (Moved from modal) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Administrative Job Moderation
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Approve this listing for public candidate discovery or reject it if policy is violated.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">
              Moderation Decision
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModerateStatus("published")}
                className={`flex-1 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                  moderateStatus === "published"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 size={15} className="inline mr-1 text-emerald-600" /> Approve & Publish
              </button>
              <button
                type="button"
                onClick={() => setModerateStatus("rejected")}
                className={`flex-1 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                  moderateStatus === "rejected"
                    ? "border-red-500 bg-red-50 text-red-800 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <XCircle size={15} className="inline mr-1 text-red-600" /> Reject Listing
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="mod-remarks" className="mb-2 block text-xs font-semibold uppercase text-slate-700">
              Moderation Remarks {moderateStatus === "rejected" && <span className="text-red-500">*</span>}
            </label>
            <input
              id="mod-remarks"
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Approved for construction feed / Policy violation reason"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => moderateMutation.mutate({ status: moderateStatus, remark: remarks })}
            disabled={
              moderateMutation.isPending ||
              (moderateStatus === "rejected" && !remarks.trim())
            }
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {moderateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Submit Moderation
          </button>
        </div>
      </div>

      {/* Full Description & Job Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            Role Overview & Specifications
          </h2>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Category / Trade</span>
              <span className="font-medium text-slate-800">{job.projectType || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Daily Wage</span>
              <span className="font-semibold text-slate-800">
                {job.dailyPay ? `₹${job.dailyPay}` : "—"}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Total Compensation</span>
              <span className="font-semibold text-slate-800">
                {job.compensation ? `₹${job.compensation}` : "—"}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Location</span>
              <span className="font-medium text-slate-800">{job.location || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Open Vacancies</span>
              <span className="font-medium text-slate-800">{job.vacancies || "1"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            Description & Requirements
          </h2>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description || "No full job description entered."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

