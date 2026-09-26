import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, IndianRupee, Layers } from "lucide-react";
import { projectsApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

const LIMIT = 12;

const STATUS_OPTIONS = [
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "on_hold", label: "On Hold" },
  { key: "archived", label: "Archived" },
];

export default function Projects() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState("active");
  const [sitesModal, setSitesModal] = useState(null);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["projects", page],
    queryFn: () => projectsApi.list({ page, limit: LIMIT }),
  });

  const { data: sitesData, isLoading: sitesLoading } = useQuery({
    queryKey: ["project-sites", sitesModal?.id],
    queryFn: () => projectsApi.sites(sitesModal.id),
    enabled: !!sitesModal,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["projects"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => projectsApi.update(id, { status }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: `Project marked as ${vars.status}` });
      setStatusModal(null);
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: projects, total } = extractList(data);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const formatBudget = (budget) => {
    if (budget == null || budget === "") return "—";
    const num = Number(budget);
    if (Number.isNaN(num)) return budget;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    return num.toLocaleString("en-IN");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Loading..." : `Manage and track ${total} projects`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-sm text-slate-500">
          No projects found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <MapPin size={14} />
                    {project.location || "—"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStatusModal(project);
                    setNewStatus(project.status || "active");
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition hover:opacity-80 ${statusBadgeClass(project.status)}`}
                  title="Change status"
                >
                  {project.status || "—"}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <IndianRupee size={15} className="text-slate-400" /> Budget
                  </span>
                  <span className="text-sm font-bold text-slate-900">₹{formatBudget(project.budget)}</span>
                </div>
                <button
                  onClick={() => setSitesModal(project)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Layers size={16} /> View Sites
                </button>
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

      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Update status</h3>
            <p className="mt-1 text-sm text-slate-500">{statusModal.name}</p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setNewStatus(option.key)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    newStatus === option.key
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setStatusModal(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate({ id: statusModal.id, status: newStatus })}
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

      {sitesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Sites — {sitesModal.name}</h3>

            <div className="mt-5 space-y-3">
              {sitesLoading ? (
                <div className="py-8 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : extractList(sitesData).items.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No sites found</p>
              ) : (
                extractList(sitesData).items.map((site) => (
                  <div key={site.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{site.name}</p>
                      <p className="text-xs text-slate-500">{site.location || ""}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(site.status)}`}>
                      {site.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSitesModal(null)}
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