import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, IndianRupee, Layers, ChevronRight } from "lucide-react";
import { projectsApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

const LIMIT = 12;

export default function Projects() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["projects", page],
    queryFn: () => projectsApi.list({ page, limit: LIMIT }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["projects"] });

  const { items: projects, total } = extractList(data);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const formatBudget = (budget) => {
    if (budget == null || budget === "") return "—";
    const num = Number(budget);
    if (Number.isNaN(num)) return budget;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Operations
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Construction Projects
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isLoading ? "Loading projects..." : `Manage, monitor, and track ${total} construction projects`}
          </p>
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-red-600">{apiError(error)}</p>
          <button
            onClick={invalidate}
            className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-xs text-slate-400">
          No projects found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 truncate hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 truncate">
                      <MapPin size={13} /> {project.location || "Location not set"}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold shrink-0 ${statusBadgeClass(project.status)}`}>
                    {project.status || "active"}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 flex items-center justify-between text-xs border border-slate-100 mt-4">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <IndianRupee size={13} className="text-slate-400" /> Estimated Budget
                  </span>
                  <span className="font-bold text-slate-900">{formatBudget(project.budget)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} /> View Details & Sites
                </span>
                <ChevronRight size={15} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs text-slate-600 shadow-xs">
          <span>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
