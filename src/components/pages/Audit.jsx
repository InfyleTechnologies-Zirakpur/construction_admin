import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, FileText, ScrollText } from "lucide-react";
import { documentsApi, auditApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

const AUDIT_LIMIT = 10;

const TABS = [
  { key: "documents", label: "Documents", icon: FileText },
  { key: "audit", label: "Audit Logs", icon: ScrollText },
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

  const active = documentsQuery.isLoading || auditQuery.isLoading;
  const activeError = documentsQuery.isError || auditQuery.isError;
  const activeErrorMessage =
    documentsQuery.error || auditQuery.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Documents & Audit</h1>
        <p className="mt-2 text-slate-600">Browse uploaded documents and platform activity logs</p>
      </div>

      <div className="flex gap-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setPage(1);
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {activeError ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-red-600">{apiError(activeErrorMessage)}</p>
          <button
            onClick={invalidate}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      ) : active ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-20 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {tab === "documents" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Document</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Entity Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Object Key</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-sm text-slate-500">
                        No documents found
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                              <FileText size={16} />
                            </div>
                            <span className="text-sm font-medium text-slate-900">{doc.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                            {doc.entityType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono max-w-[16rem] truncate">
                          {doc.objectKey}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {doc.url ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              Open
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
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
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Log</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Action</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Entity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-500">
                        No audit logs found
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{log.id}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{log.entityType}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{log.actorId || "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{log.createdAt || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "audit" && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <p className="text-sm text-slate-500">
                Showing {(page - 1) * AUDIT_LIMIT + 1}–{Math.min(page * AUDIT_LIMIT, totalLogs)} of {totalLogs}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}