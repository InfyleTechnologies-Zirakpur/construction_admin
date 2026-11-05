import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Eye, ChevronRight } from "lucide-react";
import { applicationsApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { statusBadgeClass } from "../../theme/colors";

const APP_COLUMNS = [
  { key: "app", label: "Application ID" },
  { key: "job", label: "Job Title" },
  { key: "user", label: "Candidate" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Action", center: true },
];

export default function Applications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationsApi.list({ page: 1, limit: 100 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["applications"] });

  const { items: applications, total } = extractList(data);

  const onAction = (action, id) => {
    navigate(`/applications/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Hiring Pipeline
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Applications
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isLoading ? "Loading applications..." : `Review and track ${total} candidate job applications`}
          </p>
        </div>
      </div>

      {/* Applications Table Card */}
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
            id="applications-table"
            columns={APP_COLUMNS}
            data={applications}
            onAction={onAction}
            emptyText="No applications submitted yet."
            renderRow={(app) => (
              <tr
                key={app.id}
                onClick={() => navigate(`/applications/${app.id}`)}
                className="transition-colors hover:bg-slate-50/70 cursor-pointer"
              >
                <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">
                  #{String(app.id).slice(0, 8)}
                </td>
                <td className="px-5 py-4 text-xs font-medium text-slate-800">
                  {app.job?.title || "—"}
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900 hover:text-primary transition-colors">
                    {app.user?.fullName || app.user?.name || app.user?.email || "—"}
                  </p>
                  <p className="text-slate-400 mt-0.5">{app.user?.email || ""}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadgeClass(app.status)}`}>
                    {app.status || "pending"}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    data-action="detail"
                    data-id={app.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                    title="View application details"
                  >
                    <Eye size={14} className="pointer-events-none" />
                    <span className="pointer-events-none hidden sm:inline">Details</span>
                    <ChevronRight size={14} className="pointer-events-none" />
                  </button>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </div>
  );
}
