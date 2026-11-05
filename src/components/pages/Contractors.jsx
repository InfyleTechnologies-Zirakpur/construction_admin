import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Eye, ChevronRight } from "lucide-react";
import { contractorsApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { statusBadgeClass } from "../../theme/colors";

const COLUMNS = [
  { key: "company", label: "Contractor Company" },
  { key: "contact", label: "Contact Email" },
  { key: "city", label: "Operational City" },
  { key: "status", label: "Verification Status" },
  { key: "actions", label: "Action", center: true },
];

export default function Contractors() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contractors"],
    queryFn: () => contractorsApi.list({ page: 1, limit: 100 }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["contractors"] });
  };

  const { items: contractors, total } = extractList(data);

  const onAction = (action, id) => {
    if (action === "profile" || action === "view") {
      navigate(`/contractors/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Contractor Network
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Contractors
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isLoading ? "Loading contractors..." : `Manage and verify ${total} registered contractors`}
          </p>
        </div>
      </div>

      {/* Contractors Table Card */}
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
            id="contractors-table"
            columns={COLUMNS}
            data={contractors}
            onAction={onAction}
            emptyText="No contractors found."
            renderRow={(contractor) => (
              <tr
                key={contractor.id}
                onClick={() => navigate(`/contractors/${contractor.id}`)}
                className="transition-colors hover:bg-slate-50/70 cursor-pointer"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary">
                      {(contractor.companyName || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 hover:text-primary transition-colors">
                        {contractor.companyName}
                      </p>
                      <p className="text-xs text-slate-400">ID: {contractor.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  {contractor.contactEmail || "—"}
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  {contractor.city || "—"}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadgeClass(contractor.verificationStatus)}`}>
                    {contractor.verificationStatus || "pending"}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    data-action="profile"
                    data-id={contractor.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                    title="View contractor details"
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
