import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  ShieldCheck,
  ShieldX,
  Clock,
  Building,
  Mail,
  Phone,
  MapPin,
  FileCheck2,
  FolderKanban,
  HardHat,
  ChevronRight,
} from "lucide-react";
import { contractorsApi, projectsApi, siteEngineersApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

export default function ContractorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data: detailData, isLoading, isError, error } = useQuery({
    queryKey: ["contractor-profile", id],
    queryFn: () => contractorsApi.get(id),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["contractor-projects", id],
    queryFn: () => projectsApi.list({ page: 1, limit: 100 }),
  });

  const { data: engineersData } = useQuery({
    queryKey: ["site-engineers-all"],
    queryFn: () => siteEngineersApi.list(),
  });

  const contractor = detailData?.data ?? detailData;
  const projects = extractList(projectsData).items.filter((p) => p.contractorId === id);
  const engineers = extractList(engineersData).items;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["contractor-profile", id] });
    queryClient.invalidateQueries({ queryKey: ["contractors"] });
  };

  const verifyMutation = useMutation({
    mutationFn: ({ status }) => contractorsApi.verify(id, { verificationStatus: status }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: `Contractor status updated to "${vars.status}"` });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !contractor) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-red-600">{apiError(error) || "Contractor not found"}</p>
        <button
          onClick={() => navigate("/contractors")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
        >
          Back to Contractors List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate("/contractors")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Contractors
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {contractor.verificationStatus !== "verified" && (
            <button
              onClick={() => verifyMutation.mutate({ status: "verified" })}
              disabled={verifyMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <ShieldCheck size={15} /> Mark Verified
            </button>
          )}

          {contractor.verificationStatus !== "rejected" && (
            <button
              onClick={() => verifyMutation.mutate({ status: "rejected" })}
              disabled={verifyMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <ShieldX size={15} /> Reject
            </button>
          )}

          {contractor.verificationStatus !== "pending" && (
            <button
              onClick={() => verifyMutation.mutate({ status: "pending" })}
              disabled={verifyMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Clock size={15} /> Set Pending
            </button>
          )}
        </div>
      </div>

      {notice.text && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-medium ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-xl font-bold text-primary">
            {(contractor.companyName || "C").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {contractor.companyName}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(
                  contractor.verificationStatus
                )}`}
              >
                {contractor.verificationStatus || "pending"}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              {contractor.contactEmail && (
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" /> {contractor.contactEmail}
                </span>
              )}
              {contractor.contactPhone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" /> {contractor.contactPhone}
                </span>
              )}
              {contractor.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" /> {contractor.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Verification and Registration Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            <FileCheck2 size={16} className="text-primary" /> Contractor Credentials
          </h2>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Contractor ID</span>
              <span className="font-mono text-xs text-slate-800">{contractor.id}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Company Name</span>
              <span className="font-medium text-slate-800">{contractor.companyName}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">GST Number</span>
              <span className="font-medium text-slate-800">{contractor.gstNumber || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">City</span>
              <span className="font-medium text-slate-800">{contractor.city || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Verification Status</span>
              <span className="font-semibold text-slate-800">{contractor.verificationStatus}</span>
            </div>
          </div>
        </div>

        {/* Assigned Projects */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            <FolderKanban size={16} className="text-primary" /> Assigned Projects ({projects.length})
          </h2>

          {projects.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No construction projects currently assigned to this contractor.
            </div>
          ) : (
            <div className="space-y-2.5">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-colors hover:border-primary/40 hover:bg-primary-50/20 cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.location || "No location"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(p.status)}`}>
                      {p.status || "active"}
                    </span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

