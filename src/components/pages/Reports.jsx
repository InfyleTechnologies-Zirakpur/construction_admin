import { useState } from "react";
import { FileText, Download, TrendingUp, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { projectsApi, reportsApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

const money = (v) =>
  v === null || v === undefined || v === "" ? "—" : `₹${Number(v).toLocaleString("en-IN")}`;

export default function Reports() {
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["reports-projects"],
    queryFn: () => projectsApi.list({ page: 1, limit: 100 }),
  });
  const projects = extractList(projectsQuery.data).items;
  const activeProjectId = projectId || projects[0]?.id || "";

  const reportsQuery = useQuery({
    queryKey: ["project-reports", activeProjectId, status],
    queryFn: () => reportsApi.projectReports(activeProjectId, status ? { status } : {}),
    enabled: !!activeProjectId,
  });

  const payload = reportsQuery.data?.data ?? reportsQuery.data;
  const items = payload?.items ?? [];
  const summary = payload?.summary ?? null;

  const downloadCsv = () => {
    if (!items.length) return;
    const headers = ["id", "date", "status", "labourCost", "materialCost", "expense", "dailyCost", "revenue", "profit"];
    const rows = items.map((r) =>
      [
        r.id,
        r.date || r.createdAt || "",
        r.status || "",
        r.totalLabourCost ?? "",
        r.totalMaterialCost ?? "",
        r.totalExpense ?? "",
        r.totalDailyCost ?? "",
        r.dailyRevenue ?? "",
        r.estimatedProfit ?? "",
      ].join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-${activeProjectId}-reports.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Financial & Site Analytics
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Project Reports
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Daily logs, labour/material cost analysis, and estimated profitability.
          </p>
        </div>

        <button
          onClick={downloadCsv}
          disabled={!items.length}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          <Download size={15} /> Export CSV Report
        </button>
      </div>

      {/* Filter Selectors */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-primary focus:outline-none shadow-xs"
          value={activeProjectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-primary focus:outline-none shadow-xs"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All report statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
        </select>
      </div>

      {reportsQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          Failed to load project reports: {apiError(reportsQuery.error)}
        </div>
      )}

      {/* Summary Financial Metric Cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Labour Cost", value: money(summary.totalLabourCost) },
            { label: "Total Material Cost", value: money(summary.totalMaterialCost) },
            { label: "Cumulative Daily Cost", value: money(summary.totalDailyCost) },
            { label: "Estimated Gross Profit", value: money(summary.estimatedProfit ?? summary.totalProfit) },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <TrendingUp size={14} className="text-primary" /> {s.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        {reportsQuery.isLoading ? (
          <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-xs text-slate-400">
            No daily reports logged for this project yet.
          </div>
        ) : (
          items.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-primary/40 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {report.date ? new Date(report.date).toLocaleDateString() : `Report #${report.id.slice(0, 8)}`}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Daily Cost: <strong className="text-slate-800">{money(report.totalDailyCost)}</strong></span>
                    <span>•</span>
                    <span>Profit: <strong className="text-emerald-700">{money(report.estimatedProfit)}</strong></span>
                  </div>
                </div>
              </div>

              <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(report.status)}`}>
                {report.status || "draft"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
