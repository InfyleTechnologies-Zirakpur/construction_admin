import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  Building2,
  ShieldCheck,
  ShieldX,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import { companiesApi, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [verifyStatus, setVerifyStatus] = useState("verified");
  const [remarks, setRemarks] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data: detailData, isLoading, isError, error } = useQuery({
    queryKey: ["company-detail", id],
    queryFn: () => companiesApi.get(id),
  });

  const company = detailData?.data ?? detailData;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["company-detail", id] });
    queryClient.invalidateQueries({ queryKey: ["companies"] });
  };

  const verifyMutation = useMutation({
    mutationFn: ({ status, remark }) =>
      companiesApi.verify(id, {
        verificationStatus: status,
        verificationRemarks: remark,
      }),
    onSuccess: (_res, vars) => {
      setNotice({
        type: "success",
        text: `Company has been marked as "${vars.status}"`,
      });
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

  if (isError || !company) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-red-600">{apiError(error) || "Company not found"}</p>
        <button
          onClick={() => navigate("/companies")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
        >
          Back to Companies List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate("/companies")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Companies
        </button>
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

      {/* Main Company Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary">
            <Building2 size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {company.name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(
                  company.verificationStatus
                )}`}
              >
                {company.verificationStatus || "pending"}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              {company.contactEmail && (
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" /> {company.contactEmail}
                </span>
              )}
              {company.contactPhone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" /> {company.contactPhone}
                </span>
              )}
              {company.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" /> {company.city}, {company.state}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Globe size={14} /> Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Decision Panel (Moved from modal) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Administrative Verification Decision
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Review submitted legal documents and determine verification status.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-700">
              Decision
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVerifyStatus("verified")}
                className={`flex-1 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                  verifyStatus === "verified"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck size={16} className="inline mr-1 text-emerald-600" /> Approve / Verified
              </button>
              <button
                type="button"
                onClick={() => setVerifyStatus("rejected")}
                className={`flex-1 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                  verifyStatus === "rejected"
                    ? "border-red-500 bg-red-50 text-red-800 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ShieldX size={16} className="inline mr-1 text-red-600" /> Reject Company
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="verify-remarks" className="mb-2 block text-xs font-semibold uppercase text-slate-700">
              Remarks / Notes
            </label>
            <input
              id="verify-remarks"
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. GST & PAN documentation verified OK"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => verifyMutation.mutate({ status: verifyStatus, remark: remarks })}
            disabled={verifyMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {verifyMutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Save Verification Decision
          </button>
        </div>
      </div>

      {/* Details Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Registration & Legal Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            Corporate & Legal Registration
          </h2>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Registration No.</span>
              <span className="font-mono text-xs font-medium text-slate-800">{company.registrationNumber || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">GST Number</span>
              <span className="font-mono text-xs font-medium text-slate-800">{company.gstNumber || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">PAN Number</span>
              <span className="font-mono text-xs font-medium text-slate-800">{company.panNumber || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Business Type</span>
              <span className="font-medium text-slate-800">{company.businessType || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Established Year</span>
              <span className="font-medium text-slate-800">{company.yearEstablished || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Team Size</span>
              <span className="font-medium text-slate-800">{company.teamSizeRange || "—"}</span>
            </div>
          </div>
        </div>

        {/* Location & Contact Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            Contact & Operational Location
          </h2>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Contact Email</span>
              <span className="font-medium text-slate-800">{company.contactEmail || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Contact Phone</span>
              <span className="font-medium text-slate-800">{company.contactPhone || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Alternate Phone</span>
              <span className="font-medium text-slate-800">{company.alternatePhone || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">Full Address</span>
              <span className="font-medium text-slate-800 text-right">{company.address || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 text-xs">City, State & Pin</span>
              <span className="font-medium text-slate-800">
                {[company.city, company.state, company.pincode].filter(Boolean).join(", ") || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Documents */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
          About & Verification Documents
        </h2>

        <div>
          <span className="text-slate-400 text-xs block mb-1">Company Description</span>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {company.description || "No company description provided."}
          </p>
        </div>

        <div>
          <span className="text-slate-400 text-xs block mb-2">Attached Verification Documents</span>
          {(company.documentUrls || []).length === 0 ? (
            <p className="text-xs text-slate-400">No documents attached.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {company.documentUrls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:border-primary hover:text-primary transition-colors"
                >
                  <FileText size={15} className="text-primary" />
                  <span>{url.split("/").pop() || `Document ${index + 1}`}</span>
                  <ExternalLink size={13} className="text-slate-400" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

