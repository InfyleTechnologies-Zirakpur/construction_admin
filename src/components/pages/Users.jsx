import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Loader2, UserCheck, UserX, Trash2, FileText, ExternalLink, X } from "lucide-react";
import { usersApi, companiesApi, documentsApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { Avatar, ImagePreview } from "../common/SafeImage";
import { roleBadgeClass } from "../../theme/colors";

const ROLE_FILTERS = [
  { key: "all", label: "All" },
  { key: "job_seeker", label: "Job Seekers" },
  { key: "company", label: "Companies" },
];

const COLUMNS = [
  { key: "user", label: "User" },
  { key: "contact", label: "Contact" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", center: true },
];

export default function Users() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("all");
  const [profileId, setProfileId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const openPreview = (src, name) => setPreview({ src, name });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", roleFilter],
    queryFn: () =>
      usersApi.list({
        page: 1,
        limit: 100,
        ...(roleFilter !== "all" ? { role: roleFilter } : {}),
      }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    if (profileId) queryClient.invalidateQueries({ queryKey: ["user-profile", profileId] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, active }) => usersApi.update(id, { isActive: active }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: vars.active ? "User activated" : "User blocked" });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => usersApi.remove(id),
    onSuccess: () => {
      setNotice({ type: "success", text: "User deactivated" });
      setProfileId(null);
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: users, total } = extractList(data);

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
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Loading..." : `Manage ${total} users — seekers & companies, status & verification`}
          </p>
        </div>
        <div className="flex gap-2">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setRoleFilter(filter.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                roleFilter === filter.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
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
            id="users-table"
            columns={COLUMNS}
            data={users}
            onAction={onAction}
            emptyText="No users found"
            renderRow={(user) => {
              const inactive = !user.isActive;
              return (
                <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} size={40} onPreview={openPreview} />
                      <div>
                        <p className="font-medium text-slate-900">{user.fullName || "—"}</p>
                        <p className="text-xs text-slate-500">{user.city || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p>{user.email || "—"}</p>
                    <p className="text-xs text-slate-400">{user.phone || ""}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${roleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        inactive ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {inactive ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      data-action="profile"
                      data-id={user.id}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View full profile"
                    >
                      <MoreHorizontal size={18} className="text-slate-500 pointer-events-none" />
                    </button>
                  </td>
                </tr>
              );
            }}
          />
        )}
      </div>

      {profileId && (
        <UserProfileModal
          userId={profileId}
          onClose={() => setProfileId(null)}
          onPreview={openPreview}
          onStatusChange={(active) => statusMutation.mutate({ id: profileId, active })}
          onDeactivate={() => {
            if (window.confirm("Deactivate this user?")) deactivateMutation.mutate(profileId);
          }}
          busy={statusMutation.isPending || deactivateMutation.isPending}
        />
      )}
      {preview && <ImagePreview src={preview.src} name={preview.name} onClose={() => setPreview(null)} />}
    </div>
  );
}

function UserProfileModal({ userId, onClose, onPreview, onStatusChange, onDeactivate, busy }) {
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => usersApi.get(userId),
  });
  const { data: docsData } = useQuery({
    queryKey: ["user-docs", userId],
    queryFn: () => documentsApi.list(),
  });
  const { data: companiesData } = useQuery({
    queryKey: ["user-company", userId],
    queryFn: () => companiesApi.list({ page: 1, limit: 100 }),
  });

  const user = userData?.data ?? userData;
  const docs = extractList(docsData).items.filter((d) => d.ownerId === userId);
  const company = extractList(companiesData).items.find((c) => c.userId === userId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading || !user ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar user={user} size={56} onPreview={onPreview} />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{user.fullName || "—"}</h3>
                  <p className="text-sm text-slate-500">{user.role} · {user.isActive === false ? "Inactive" : "Active"}</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <ProfileRow label="Email" value={user.email} />
              <ProfileRow label="Phone" value={user.phone} />
              <ProfileRow label="City" value={user.city} />
              <ProfileRow label="Skills" value={(user.skills || []).join(", ")} />
              <ProfileRow label="Salary" value={user.salaryExpectation} />
              <ProfileRow label="Verified" value={user.isVerified ? "Yes" : "No"} />
              {company && <ProfileRow label="Company" value={`${company.name} (${company.verificationStatus})`} />}
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-slate-700">Documents ({docs.length})</p>
              {docs.length === 0 ? (
                <p className="text-sm text-slate-400">No documents uploaded</p>
              ) : (
                <div className="space-y-2">
                  {docs.map((doc) => (
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

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => onStatusChange(!(user.isActive === false))}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {user.isActive === false ? <UserCheck size={15} className="text-emerald-600" /> : <UserX size={15} className="text-amber-600" />}
                {user.isActive === false ? "Activate" : "Block"}
              </button>
              <button
                onClick={onDeactivate}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={15} /> Deactivate
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
