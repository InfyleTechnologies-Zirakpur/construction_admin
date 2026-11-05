import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  IndianRupee,
  Layers,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { projectsApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

const STATUS_OPTIONS = [
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "on_hold", label: "On Hold" },
  { key: "archived", label: "Archived" },
];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState("active");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data: projectsData, isLoading: projectLoading, isError, error } = useQuery({
    queryKey: ["projects-all-list"],
    queryFn: () => projectsApi.list({ page: 1, limit: 100 }),
  });

  const { data: sitesData, isLoading: sitesLoading } = useQuery({
    queryKey: ["project-sites", id],
    queryFn: () => projectsApi.sites(id),
  });

  const allProjects = extractList(projectsData).items;
  const project = allProjects.find((p) => String(p.id) === String(id));
  const sites = extractList(sitesData).items;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["projects-all-list"] });
    queryClient.invalidateQueries({ queryKey: ["project-sites", id] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const updateMutation = useMutation({
    mutationFn: ({ status }) => projectsApi.update(id, { status }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: `Project status updated to "${vars.status}"` });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const formatBudget = (budget) => {
    if (budget == null || budget === "") return "—";
    const num = Number(budget);
    if (Number.isNaN(num)) return budget;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  if (projectLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-red-600">{apiError(error) || "Project not found"}</p>
        <button
          onClick={() => navigate("/projects")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Projects
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

      {/* Main Project Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary">
            <Layers size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {project.name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(
                  project.status
                )}`}
              >
                {project.status || "active"}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" /> {project.location || "Location not set"}
              </span>
              <span className="flex items-center gap-1.5">
                <IndianRupee size={14} className="text-slate-400" /> {formatBudget(project.budget)}
              </span>
              {project.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" /> Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Panel (Moved from modal) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Project Lifecycle Status
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Current status is <strong className="text-primary capitalize">{project.status || "active"}</strong>. Select a new status to update project progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedStatus(opt.key)}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                (selectedStatus || project.status) === opt.key
                  ? "border-primary bg-primary-50 text-primary shadow-xs"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}

          <button
            onClick={() => updateMutation.mutate({ status: selectedStatus })}
            disabled={updateMutation.isPending || selectedStatus === project.status}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Save Status
          </button>
        </div>
      </div>

      {/* Sites Section (Moved from modal) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Construction Sites ({sites.length})
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Active physical locations and substations tied to this project.
          </p>
        </div>

        {sitesLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          </div>
        ) : sites.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No specific sites configured for this project yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <div
                key={site.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">{site.name || "Site Unit"}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(site.status)}`}>
                    {site.status || "active"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  {site.location || site.address || "No address specified"}
                </p>
                {site.description && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{site.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

