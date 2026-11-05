import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, FileText, ScrollText, ExternalLink } from "lucide-react";
import { documentsApi, auditApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

const AUDIT_LIMIT = 15;

const TABS = [
  { key: "documents", label: "Uploaded Documents", icon: FileText },
  { key: "audit", label: "System Audit Logs", icon: ScrollText },
];

export default function Audit() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("documents");
  const [page, setPage] = useState(1);

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: documentsApi.list,
    enabled: tab === "documents",
  });

  const auditQuery = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => auditApi.list({ page, limit: AUDIT_LIMIT }),
    enabled: tab === "audit",
  });

  const { items: documents } = extractList(documentsQuery.data);
  const { items: auditLogs, total: totalLogs } = extractList(auditQuery.data);
  const totalPages = Math.max(1, Math.ceil(totalLogs / AUDIT_LIMIT));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
  };

  const activeLoading = documentsQuery.isLoading || auditQuery.isLoading;
  const activeError = documentsQuery.isError || auditQuery.isError;
  const activeErrorMessage = documentsQuery.error || auditQuery.error;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Compliance & Transparency
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Documents & Audit Trail
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Inspect all platform media files, blueprints, and immutable admin audit events.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                tab === key
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {activeError ? (
        <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-red-600">{apiError(activeErrorMessage)}</p>
          <button
            onClick={invalidate}
            className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      ) : activeLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {tab === "documents" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Document Identifier</th>
                    <th className="px-5 py-3.5">Entity Type</th>
                    <th className="px-5 py-3.5">Storage Key</th>
                    <th className="px-5 py-3.5 text-center">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-14 text-center text-xs text-slate-400">
                        No documents stored on system.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
                              <FileText size={16} />
                            </div>
                            <span className="font-semibold text-slate-900">{doc.originalFilename || doc.id}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {doc.entityType || "general"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                          {doc.objectKey}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {doc.url ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-primary hover:border-primary transition-colors"
                            >
                              <span>Open</span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Log ID</th>
                    <th className="px-5 py-3.5">Action Executed</th>
                    <th className="px-5 py-3.5">Target Entity</th>
                    <th className="px-5 py-3.5">Actor</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-xs text-slate-400">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono text-slate-700 font-medium">{log.id.slice(0, 10)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${statusBadgeClass(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-700 font-medium">{log.entityType}</td>
                        <td className="px-5 py-4 font-mono text-slate-500">{log.actorId ? log.actorId.slice(0, 8) : "System"}</td>
                        <td className="px-5 py-4 text-slate-500">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Audit Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-600">
                  <span>
                    Showing {(page - 1) * AUDIT_LIMIT + 1}–{Math.min(page * AUDIT_LIMIT, totalLogs)} of {totalLogs} events
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
