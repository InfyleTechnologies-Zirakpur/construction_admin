import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, Eye, X, MapPin } from "lucide-react";
import { contractorsApi, projectsApi, siteEngineersApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { statusBadgeClass } from "../../theme/colors";

const COLUMNS = [
  { key: "company", label: "Company" },
  { key: "contact", label: "Contact" },
  { key: "city", label: "City" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", center: true },
];

export default function Contractors() {
  const queryClient = useQueryClient();
  const [profileId, setProfileId] = useState(null);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contractors"],
    queryFn: () => contractorsApi.list({ page: 1, limit: 100 }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["contractors"] });
    if (profileId) queryClient.invalidateQueries({ queryKey: ["contractor-profile", profileId] });
  };

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }) => contractorsApi.verify(id, { verificationStatus: status }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: `Contractor ${vars.status}` });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: contractors, total } = extractList(data);

  const onAction = (action, id) => {
    if (action === "profile") {
      setProfileId(id);
      setNotice({ type: "", text: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contractors</h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Loading..." : `Listing, profile, projects, status & engineers — ${total} contractors`}
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
            id="contractors-table"
            columns={COLUMNS}
            data={contractors}
            onAction={onAction}
            emptyText="No contractors found"
            renderRow={(contractor) => (
              <tr key={contractor.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                      {(contractor.companyName || "C").charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium text-slate-900">{contractor.companyName}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{contractor.contactEmail || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{contractor.city || "—"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(contractor.verificationStatus)}`}>
                    {contractor.verificationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    data-action="profile"
                    data-id={contractor.id}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="View full profile"
                  >
                    <Eye size={18} className="pointer-events-none" />
                  </button>
                </td>
              </tr>
            )}
          />
        )}
      </div>

      {profileId && (
        <ContractorProfileModal
          contractorId={profileId}
          onClose={() => setProfileId(null)}
          onVerify={(status) => verifyMutation.mutate({ id: profileId, status })}
          verifying={verifyMutation.isPending}
        />
      )}
    </div>
  );
}

function ContractorProfileModal({ contractorId, onClose, onVerify, verifying }) {
  const { data: detailData, isLoading } = useQuery({
    queryKey: ["contractor-profile", contractorId],
    queryFn: () => contractorsApi.get(contractorId),
  });
  const { data: projectsData } = useQuery({
    queryKey: ["contractor-projects", contractorId],
    queryFn: () => projectsApi.list({ page: 1, limit: 100 }),
  });
  const { data: engineersData } = useQuery({
    queryKey: ["site-engineers-all"],
    queryFn: () => siteEngineersApi.list(),
  });

  const contractor = detailData?.data ?? detailData;
  const projects = extractList(projectsData).items.filter((p) => p.contractorId === contractorId);
  const engineers = extractList(engineersData).items;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading || !contractor ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 font-bold text-white text-xl">
                  {(contractor.companyName || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{contractor.companyName}</h3>
                  <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${statusBadgeClass(contractor.verificationStatus)}`}>
                    {contractor.verificationStatus}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <ProfileRow label="Email" value={contractor.contactEmail} />
              <ProfileRow label="Phone" value={contractor.contactPhone} />
              <ProfileRow label="City" value={contractor.city} />
              <ProfileRow label="GST" value={contractor.gstNumber} />
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-slate-700">Projects ({projects.length})</p>
              {projects.length === 0 ? (
                <p className="text-sm text-slate-400">No projects yet</p>
              ) : (
                <div className="space-y-2">
                  {projects.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                      <span className="text-sm font-medium text-slate-800">{p.name}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} /> {p.status || ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-slate-700">Site engineers ({engineers.length})</p>
              {engineers.length === 0 ? (
                <p className="text-sm text-slate-400">No site engineers</p>
              ) : (
                <div className="space-y-2">
                  {engineers.slice(0, 10).map((eng) => (
                    <div key={eng.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                      <span className="text-sm font-medium text-slate-800">{eng.fullName || eng.email}</span>
                      <span className="text-xs text-slate-500">{eng.status || eng.isActive === false ? "Inactive" : "Active"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {contractor.verificationStatus !== "verified" && (
                <button
                  onClick={() => onVerify("verified")}
                  disabled={verifying}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck size={16} />}
                  Verify
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value || "—"}</span>
    </div>
  );
}
