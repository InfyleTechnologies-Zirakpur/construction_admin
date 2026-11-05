import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  FileText,
  ExternalLink,
  User,
  Briefcase,
  Calendar,
  Building,
  MapPin,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";
import { applicationsApi, usersApi, documentsApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

const STATUS_OPTIONS = [
  { key: "pending", label: "Pending Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data: detailData, isLoading, isError, error } = useQuery({
    queryKey: ["application", id],
    queryFn: () => applicationsApi.get(id),
  });

  const app = detailData?.data ?? detailData;
  const applicantId = app?.userId || app?.user?.id;

  const { data: applicantData } = useQuery({
    queryKey: ["applicant-profile", applicantId],
    queryFn: () => usersApi.get(applicantId),
    enabled: !!applicantId,
  });

  const { data: applicantDocsData } = useQuery({
    queryKey: ["applicant-docs", applicantId],
    queryFn: () => documentsApi.list(),
    enabled: !!applicantId,
  });

  const applicant = applicantData?.data ?? applicantData ?? app?.user;
  const applicantDocs = extractList(applicantDocsData).items.filter((d) => d.ownerId === applicantId);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["application", id] });
    queryClient.invalidateQueries({ queryKey: ["applications"] });
  };

  const updateMutation = useMutation({
    mutationFn: ({ status }) => applicationsApi.updateStatus(id, { status }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: `Application marked as "${vars.status}"` });
      invalidate();
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

  if (isError || !app) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-red-600">{apiError(error) || "Application not found"}</p>
        <button
          onClick={() => navigate("/applications")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Breadcrumb */}
      <div>
        <button
          onClick={() => navigate("/applications")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Applications
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Application #{String(app.id).slice(0, 8)}
              </h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(app.status)}`}>
                {app.status || "pending"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Applied on {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recent"}
            </p>
          </div>
        </div>
      </div>

      {/* Status Decision Panel (Moved from modal) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Application Status Management
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Update candidate progress for this job application.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedStatus(opt.key)}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                (selectedStatus || app.status) === opt.key
                  ? "border-primary bg-primary-50 text-primary shadow-xs"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}

          <button
            onClick={() => updateMutation.mutate({ status: selectedStatus })}
            disabled={updateMutation.isPending || selectedStatus === app.status}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Save Status
          </button>
        </div>
      </div>

      {/* Applicant & Job Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applicant Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            <User size={16} className="text-primary" /> Applicant Details
          </h2>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Name</span>
              <span className="font-semibold text-slate-800">{applicant?.fullName || applicant?.name || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Email</span>
              <span className="font-medium text-slate-800">{applicant?.email || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Phone</span>
              <span className="font-medium text-slate-800">{applicant?.phone || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">City</span>
              <span className="font-medium text-slate-800">{applicant?.city || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Expected Pay</span>
              <span className="font-medium text-slate-800">
                {applicant?.salaryExpectation ? `₹${applicant.salaryExpectation}` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Job Details Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            <Briefcase size={16} className="text-primary" /> Applied Job
          </h2>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Position</span>
              <span className="font-semibold text-slate-800">{app.job?.title || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Company</span>
              <span className="font-medium text-slate-800">{app.job?.company?.name || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Location</span>
              <span className="font-medium text-slate-800">{app.job?.location || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Trade / Category</span>
              <span className="font-medium text-slate-800">{app.job?.projectType || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Pay Rate</span>
              <span className="font-semibold text-slate-800">
                {app.job?.dailyPay ? `₹${app.job.dailyPay}/day` : app.job?.compensation ? `₹${app.job.compensation}` : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Applicant Documents */}
      {applicantDocs.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            Applicant Resume & Documents
          </h2>

          <div className="grid gap-2 sm:grid-cols-2">
            {applicantDocs.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-primary transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText size={16} className="text-primary shrink-0" />
                  <span className="truncate font-semibold text-slate-800">{doc.originalFilename || doc.id}</span>
                </div>
                <ExternalLink size={13} className="text-slate-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

