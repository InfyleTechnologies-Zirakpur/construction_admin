import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, Mail, HardHat } from "lucide-react";
import { contractorsApi, extractList, apiError } from "../../api";
import { statusBadgeClass } from "../../theme/colors";

const LIMIT = 12;

export default function Contractors() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contractors", page],
    queryFn: () => contractorsApi.list({ page, limit: LIMIT }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["contractors"] });

  const verifyMutation = useMutation({
    mutationFn: (id) => contractorsApi.verify(id, { verificationStatus: "verified" }),
    onSuccess: () => {
      setNotice({ type: "success", text: "Contractor verified" });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: contractors, total } = extractList(data);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contractors</h1>
          <p className="mt-2 text-slate-600">
            {isLoading ? "Loading..." : `Manage ${total} contractors`}
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

      {isError ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-red-600">{apiError(error)}</p>
          <button
            onClick={invalidate}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : contractors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-sm text-slate-500">
          No contractors found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contractors.map((contractor) => (
            <div key={contractor.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                    {(contractor.companyName || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{contractor.companyName}</h3>
                    <p className="text-xs text-slate-500">{contractor.companyType || "Contractor"}</p>
                  </div>
                </div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(contractor.verificationStatus)}`}
                >
                  {contractor.verificationStatus}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <HardHat size={16} className="text-slate-400" />
                  <span className="text-sm">{contractor.specialty || contractor.companyType || "General"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm">{contractor.contactEmail || "—"}</span>
                </div>
              </div>

              {contractor.verificationStatus === "pending" ? (
                <button
                  onClick={() => verifyMutation.mutate(contractor.id)}
                  disabled={verifyMutation.isPending}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-60"
                >
                  {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck size={16} />}
                  Verify
                </button>
              ) : (
                <button className="mt-4 w-full rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                  View Profile
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}