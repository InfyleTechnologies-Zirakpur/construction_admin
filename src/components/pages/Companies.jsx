import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Eye, Building2, ChevronRight, ShieldCheck } from "lucide-react";
import { companiesApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { statusBadgeClass } from "../../theme/colors";

const COMPANY_COLUMNS = [
  { key: "company", label: "Company" },
  { key: "contact", label: "Contact Details" },
  { key: "city", label: "City" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Action", center: true },
];

const STATUS_FILTERS = [
  { key: "all", label: "All Companies" },
  { key: "pending", label: "Pending" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
];

export default function Companies() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["companies", statusFilter],
    queryFn: () =>
      companiesApi.list({
        page: 1,
        limit: 100,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["companies"] });

  const { items: companies, total } = extractList(data);

  const onAction = (action, id) => {
    navigate(`/companies/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Partner Network
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Companies
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isLoading ? "Loading companies..." : `Manage and verify ${total} registered companies`}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === filter.key
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Table Card */}
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
            id="companies-table"
            columns={COMPANY_COLUMNS}
            data={companies}
            onAction={onAction}
            emptyText="No companies found matching current filter."
            renderRow={(company) => (
              <tr
                key={company.id}
                onClick={() => navigate(`/companies/${company.id}`)}
                className="transition-colors hover:bg-slate-50/70 cursor-pointer"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 hover:text-primary transition-colors">
                        {company.name}
                      </p>
                      <p className="text-xs text-slate-400">ID: {company.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  <p className="font-medium text-slate-800">{company.contactEmail || "—"}</p>
                  <p className="text-slate-400 mt-0.5">{company.contactPhone || ""}</p>
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  {company.city || "—"}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadgeClass(company.verificationStatus)}`}>
                    {company.verificationStatus || "pending"}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="inline-flex items-center gap-2">
                    <button
                      data-action="detail"
                      data-id={company.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                      title="View company details"
                    >
                      <Eye size={14} className="pointer-events-none" />
                      <span className="pointer-events-none hidden sm:inline">Details</span>
                      <ChevronRight size={14} className="pointer-events-none" />
                    </button>
                    {company.verificationStatus !== "verified" && (
                      <button
                        data-action="verify"
                        data-id={company.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary-100 transition-colors"
                      >
                        <ShieldCheck size={14} className="pointer-events-none" />
                        <span className="pointer-events-none">Verify</span>
                      </button>
                    )}
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
