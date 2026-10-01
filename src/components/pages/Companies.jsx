import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, Eye, Building2 } from "lucide-react";
import { companiesApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { statusBadgeClass } from "../../theme/colors";

const COMPANY_COLUMNS = [
  { key: "company", label: "Company" },
  { key: "contact", label: "Contact" },
  { key: "city", label: "City" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", center: true },
];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
];

export default function Companies() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [detail, setDetail] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("verified");
  const [remarks, setRemarks] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

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

  const verifyMutation = useMutation({
    mutationFn: ({ id, status, remarks: remark }) =>
      companiesApi.verify(id, {
        verificationStatus: status,
        verificationRemarks: remark,
      }),
    onSuccess: (_res, vars) => {
      setNotice({
        type: "success",
        text: `Company marked as ${vars.status}`,
      });
      setVerifyTarget(null);
      setRemarks("");
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: companies, total } = extractList(data);

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["company-detail", detail?.id],
    queryFn: () => companiesApi.get(detail.id),
    enabled: !!detail?.id,
  });
  const fullDetail = detailData?.data ?? detail;

  const onAction = (action, id) => {
    const company = companies.find((c) => String(c.id) === String(id));
    if (!company) return;
    if (action === "detail") setDetail(company);
    if (action === "verify") {
      setVerifyTarget(company);
      setVerifyStatus("verified");
      setRemarks("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Loading..." : `Manage and verify ${total} companies`}
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
        <div className="flex gap-2 border-b border-slate-200 p-6">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === filter.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

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
            id="companies-table"
            columns={COMPANY_COLUMNS}
            data={companies}
            onAction={onAction}
            emptyText="No companies found"
            renderRow={(company) => (
              <tr key={company.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Building2 size={18} className="pointer-events-none" />
                    </div>
                    <p className="font-medium text-slate-900">{company.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{company.contactEmail || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{company.city || "—"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(company.verificationStatus)}`}>
                    {company.verificationStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      data-action="detail"
                      data-id={company.id}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="View details"
                    >
                      <Eye size={18} className="pointer-events-none" />
                    </button>
                    {company.verificationStatus !== "verified" && (
                      <button
                        data-action="verify"
                        data-id={company.id}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-600 transition-colors"
                      >
                        <ShieldCheck size={15} className="pointer-events-none" /> <span className="pointer-events-none">Verify</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          />
        )}
      </div>

      {verifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Verify company</h3>
            <p className="mt-1 text-sm text-slate-500">{verifyTarget.name}</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Decision</label>
                <div className="flex gap-2">
                  {["verified", "rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setVerifyStatus(status)}
                      className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                        verifyStatus === status
                          ? status === "verified"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-red-500 bg-red-50 text-red-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="remarks" className="mb-2 block text-sm font-medium text-slate-700">
                  Remarks
                </label>
                <input
                  id="remarks"
                  type="text"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="e.g. Docs verified OK"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setVerifyTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => verifyMutation.mutate({ id: verifyTarget.id, status: verifyStatus, remarks })}
                disabled={verifyMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {verifyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">{fullDetail?.name || detail.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{fullDetail?.contactEmail || detail.contactEmail}</p>

            {detailLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : (
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Registration no.</span>
                <span className="font-medium text-slate-800">{fullDetail?.registrationNumber || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">GST Number</span>
                <span className="font-medium text-slate-800">{fullDetail?.gstNumber || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">PAN Number</span>
                <span className="font-medium text-slate-800">{fullDetail?.panNumber || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Contact phone</span>
                <span className="font-medium text-slate-800">{fullDetail?.contactPhone || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Alternate phone</span>
                <span className="font-medium text-slate-800">{fullDetail?.alternatePhone || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Website</span>
                <span className="font-medium text-slate-800">{fullDetail?.website || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Address</span>
                <span className="font-medium text-slate-800">{fullDetail?.address || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">City</span>
                <span className="font-medium text-slate-800">{fullDetail?.city || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">State</span>
                <span className="font-medium text-slate-800">{fullDetail?.state || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Pincode</span>
                <span className="font-medium text-slate-800">{fullDetail?.pincode || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Business type</span>
                <span className="font-medium text-slate-800">{fullDetail?.businessType || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Established</span>
                <span className="font-medium text-slate-800">{fullDetail?.yearEstablished || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Team size</span>
                <span className="font-medium text-slate-800">{fullDetail?.teamSizeRange || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Specializations</span>
                <span className="font-medium text-slate-800">{(fullDetail?.specializations || []).join(", ") || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Operational areas</span>
                <span className="font-medium text-slate-800">{(fullDetail?.operationalAreas || []).join(", ") || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Description</span>
                <span className="font-medium text-slate-800">{fullDetail?.description || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Status</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${statusBadgeClass(fullDetail?.verificationStatus)}`}>
                  {fullDetail?.verificationStatus}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Verification remarks</span>
                <span className="font-medium text-slate-800">{fullDetail?.verificationRemarks || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Documents</span>
                <span className="font-medium text-slate-800">
                  {(fullDetail?.documentUrls || []).length} file{(fullDetail?.documentUrls || []).length === 1 ? "" : "s"}
                </span>
              </div>
              {(fullDetail?.documentUrls || []).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {fullDetail.documentUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      {url.split("/").pop()}
                    </a>
                  ))}
                </div>
              )}
            </div>
            )}

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