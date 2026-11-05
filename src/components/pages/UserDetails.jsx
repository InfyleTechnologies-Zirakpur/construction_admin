import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  UserCheck,
  UserX,
  Trash2,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Building2,
  Shield,
  Briefcase,
  Calendar,
} from "lucide-react";
import { usersApi, companiesApi, documentsApi, extractList, apiError } from "../../api";
import { Avatar } from "../common/SafeImage";
import { roleBadgeClass } from "../../theme/colors";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data: userData, isLoading: userLoading, isError, error } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: () => usersApi.get(id),
  });

  const { data: docsData } = useQuery({
    queryKey: ["user-docs", id],
    queryFn: () => documentsApi.list(),
  });

  const { data: companiesData } = useQuery({
    queryKey: ["user-company", id],
    queryFn: () => companiesApi.list({ page: 1, limit: 100 }),
  });

  const user = userData?.data ?? userData;
  const docs = extractList(docsData).items.filter((d) => d.ownerId === id);
  const company = extractList(companiesData).items.find((c) => c.userId === id);

  const { data: companyDetailData } = useQuery({
    queryKey: ["user-company-detail", company?.id],
    queryFn: () => companiesApi.get(company.id),
    enabled: !!company?.id,
  });
  const fullCompany = companyDetailData?.data ?? company;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["user-profile", id] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ active }) => usersApi.update(id, { isActive: active }),
    onSuccess: (_res, vars) => {
      setNotice({ type: "success", text: vars.active ? "User activated successfully" : "User blocked successfully" });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => usersApi.remove(id),
    onSuccess: () => {
      alert("User account deactivated");
      navigate("/users");
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  if (userLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-red-600">{apiError(error) || "User not found"}</p>
        <button
          onClick={() => navigate("/users")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
        >
          Back to Users List
        </button>
      </div>
    );
  }

  const isActive = user.isActive !== false;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate("/users")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Users
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => statusMutation.mutate({ active: !isActive })}
            disabled={statusMutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
              isActive
                ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            {isActive ? <UserX size={15} /> : <UserCheck size={15} />}
            {isActive ? "Block User" : "Activate User"}
          </button>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to deactivate this user account?")) {
                deactivateMutation.mutate();
              }
            }}
            disabled={deactivateMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={15} /> Deactivate
          </button>
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

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar user={user} size={68} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {user.fullName || user.email || "Unnamed User"}
              </h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(user.role)}`}>
                {user.role}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {isActive ? "Active Account" : "Inactive / Blocked"}
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              {user.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" /> {user.email}
                </span>
              )}
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" /> {user.phone}
                </span>
              )}
              {user.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" /> {user.city}
                </span>
              )}
              {user.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal / Account Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            <Shield size={16} className="text-primary" /> User Profile Information
          </h2>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">User ID</span>
              <span className="font-mono text-xs text-slate-800">{user.id}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Full Name</span>
              <span className="font-medium text-slate-800">{user.fullName || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Primary Email</span>
              <span className="font-medium text-slate-800">{user.email || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Phone Number</span>
              <span className="font-medium text-slate-800">{user.phone || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Location / City</span>
              <span className="font-medium text-slate-800">{user.city || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Expected Compensation</span>
              <span className="font-medium text-slate-800">{user.salaryExpectation ? `₹${user.salaryExpectation}` : "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Verification Status</span>
              <span className="font-semibold text-slate-800">{user.isVerified ? "Verified User" : "Unverified"}</span>
            </div>
            <div className="py-2.5">
              <span className="text-slate-500 text-xs block mb-1.5">Skills & Qualifications</span>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {user.skills.map((skill, i) => (
                    <span key={i} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400">No skills listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            <FileText size={16} className="text-primary" /> Uploaded Documents ({docs.length})
          </h2>

          {docs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No documents uploaded by this user yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {docs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-colors hover:border-primary/40 hover:bg-primary-50/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {doc.originalFilename || doc.id}
                      </p>
                      <p className="text-[11px] text-slate-400">{doc.entityType || "Document"}</p>
                    </div>
                  </div>
                  <ExternalLink size={15} className="shrink-0 text-slate-400 hover:text-primary" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Associated Company Information (if applicable) */}
      {fullCompany && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            <Building2 size={16} className="text-primary" /> Associated Company Details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-slate-400 block mb-1">Company Name</span>
              <span className="font-semibold text-slate-800 text-sm">{fullCompany.name}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-slate-400 block mb-1">Registration Number</span>
              <span className="font-semibold text-slate-800">{fullCompany.registrationNumber || "—"}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-slate-400 block mb-1">GST / PAN</span>
              <span className="font-semibold text-slate-800">
                GST: {fullCompany.gstNumber || "—"} | PAN: {fullCompany.panNumber || "—"}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-slate-400 block mb-1">Contact Email & Phone</span>
              <span className="font-semibold text-slate-800">
                {fullCompany.contactEmail || "—"} ({fullCompany.contactPhone || "—"})
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-slate-400 block mb-1">Website</span>
              <span className="font-semibold text-slate-800">{fullCompany.website || "—"}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-slate-400 block mb-1">Verification Status</span>
              <span className="font-semibold text-primary">{fullCompany.verificationStatus || "Pending"}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 sm:col-span-2 lg:col-span-3">
              <span className="text-slate-400 block mb-1">Business Description</span>
              <p className="text-slate-700 leading-relaxed">{fullCompany.description || "No description provided."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

