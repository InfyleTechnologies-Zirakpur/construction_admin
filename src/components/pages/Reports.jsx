import { useState } from "react";
import { FileText, Download, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { projectsApi, reportsApi, extractList, apiError } from "../../api";
import { useFocusHighlight, focusRing } from "../../hooks/useFocusHighlight";

const money = (v) =>
  v === null || v === undefined || v === "" ? "—" : `₹${Number(v).toLocaleString("en-IN")}`;

export default function Reports() {
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("");
  const focusId = useFocusHighlight();

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

  // Backend: { success, data: { items, summary } } — via TransformInterceptor
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="mt-2 text-slate-600">Daily reports + cost/profit per project (server-calculated)</p>
        </div>
        <button
          onClick={downloadCsv}
          disabled={!items.length}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          <Download size={20} /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
          value={activeProjectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
        </select>
      </div>

      {reportsQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          Failed to load reports: {apiError(reportsQuery.error)}
        </div>
      )}

      {summary && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Labour cost", value: money(summary.totalLabourCost) },
            { label: "Material cost", value: money(summary.totalMaterialCost) },
            { label: "Daily cost", value: money(summary.totalDailyCost) },
            { label: "Est. profit", value: money(summary.estimatedProfit ?? summary.totalProfit) },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                <TrendingUp size={14} /> {s.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {reportsQuery.isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ) : (
          items.map((report) => (
            <div key={report.id} id={`row-${report.id}`} className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg ${focusRing(report.id, focusId)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {report.date ? new Date(report.date).toLocaleDateString() : report.id.slice(0, 8)}
                    </h3>
                    <div className="mt-1 flex gap-4 text-sm text-slate-500">
                      <span>{report.status}</span>
                      <span>•</span>
                      <span>Cost {money(report.totalDailyCost)}</span>
                      <span>•</span>
                      <span>Profit {money(report.estimatedProfit)}</span>
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {report.status}
                </span>
              </div>
            </div>
          ))
        )}
        {!reportsQuery.isLoading && items.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No reports for this project yet
          </p>
        )}
      </div>
    </div>
  );
}
