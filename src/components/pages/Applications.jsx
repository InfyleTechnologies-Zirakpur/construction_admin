import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Eye, FileText, ExternalLink } from "lucide-react";
import { applicationsApi, usersApi, documentsApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { useFocusHighlight, focusRing } from "../../hooks/useFocusHighlight";
import { statusBadgeClass } from "../../theme/colors";

const APP_COLUMNS = [
  { key: "app", label: "Application" },
  { key: "job", label: "Job" },
  { key: "user", label: "User" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", center: true },
];

const STATUS_OPTIONS = ["pending", "shortlisted", "accepted", "rejected"];

export default function Applications() {
  const queryClient = useQueryClient();
  const [detail, setDetail] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("pending");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const focusId = useFocusHighlight();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationsApi.list({ page: 1, limit: 100 }),
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["application", detail?.id],
    queryFn: () => applicationsApi.get(detail.id),
    enabled: !!detail,
  });

  const applicantId = detail?.userId || detailData?.data?.userId;
  const { data: applicantData } = useQuery({
    queryKey: ["applicant-profile", applicantId],
    queryFn: () => usersApi.get(applicantId),
    enabled: !!applicantId,
  });
  const { data: applicantDocsData } = useQuery({
    queryKey: ["applicant-docs", applicantId],
    queryFn: () => documentsApi.list(),
  });
  const applicant = applicantData?.data ?? applicantData;
  const applicantDocs = extractList(applicantDocsData).items.filter((d) => d.ownerId === applicantId);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["applications"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => applicationsApi.updateStatus(id, { status }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: `Application ${vars.status}` });
      setStatusTarget(null);
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: applications, total } = extractList(data);

  const onAction = (action, id) => {
    const app = applications.find((a) => String(a.id) === String(id));
    if (!app) return;
    if (action === "detail") setDetail(app);
    if (action === "status") {
      setStatusTarget(app);
      setNewStatus(app.status || "pending");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Loading..." : `Review and manage ${total} applications`}
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

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isError ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600">{apiError(error)}</p>
            <button
              onClick={invalidate}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-10 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <DataTable
            id="applications-table"
            columns={APP_COLUMNS}
            data={applications}
            onAction={onAction}
            emptyText="No applications found"
            renderRow={(app) => (
              <tr key={app.id} id={`row-${app.id}`} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${focusRing(app.id, focusId)}`}>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">#{String(app.id).slice(0, 8)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{app.job?.title || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{app.user?.fullName || app.user?.email || "—"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      data-action="detail"
                      data-id={app.id}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="View details"
                    >
                      <Eye size={18} className="pointer-events-none" />
                    </button>
                    <button
                      data-action="status"
                      data-id={app.id}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                    >
                      <span className="pointer-events-none">Update Status</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        )}
      </div>

      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Update status</h3>
            <p className="mt-1 text-sm text-slate-500">Application {statusTarget.id}</p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    newStatus === status
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setStatusTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate({ id: statusTarget.id, status: newStatus })}
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

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Application #{String(detail.id).slice(0, 8)}</h3>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Job</span>
                <span className="font-medium text-slate-800">{detail.job?.title || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Applicant</span>
                <span className="font-medium text-slate-800">{detail.user?.fullName || detail.user?.email || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Status</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${statusBadgeClass(detail.status)}`}>
                  {detail.status}
                </span>
              </div>
              {detailLoading ? (
                <div className="py-4 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : (
                detailData?.data?.user && (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">User City</span>
                      <span className="font-medium text-slate-800">{detailData.data.user.city || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Skills</span>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {(detailData.data.user.skills || []).map((skill) => (
                          <span key={skill} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {skill}
                          </span>
                        ))}
                        {(detailData.data.user.skills || []).length === 0 && (
                          <span className="text-slate-800">—</span>
                        )}
                      </div>
                    </div>
                  </>
                )
              )}
            </div>

            {applicant && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Applicant profile</p>
                <p className="mt-1 text-sm text-slate-800">
                  {applicant.fullName || "—"} · {applicant.email || ""} · {applicant.phone || ""}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {applicant.city || "—"} · {(applicant.skills || []).join(", ") || "no skills"} · {applicant.role}
                </p>
              </div>
            )}

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Applicant documents ({applicantDocs.length})
              </p>
              {applicantDocs.length === 0 ? (
                <p className="text-sm text-slate-400">No documents uploaded by this applicant</p>
              ) : (
                <div className="space-y-2">
                  {applicantDocs.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 hover:bg-blue-50"
                    >
                      <FileText size={16} className="shrink-0 text-blue-600" />
                      <span className="flex-1 truncate text-sm font-medium text-slate-800">
                        {doc.originalFilename || doc.id}
                      </span>
                      <span className="text-xs text-slate-400">{doc.entityType}</span>
                      <ExternalLink size={14} className="shrink-0 text-slate-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetail(null)}
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