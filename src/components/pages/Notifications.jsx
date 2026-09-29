import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Clock, Send, Loader2, ArrowUpRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, extractList, apiError } from "../../api";
import { notificationTarget } from "../../api/notificationTargets";

const EVENTS = [
  "admin_announcement",
  "new_job",
  "application_update",
  "project_assignment",
  "site_assignment",
  "attendance_event",
  "daily_report_submitted",
  "project_update",
];

export default function Notifications() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", body: "", event: "admin_announcement", userIds: "" });
  const [feedback, setFeedback] = useState(null);

  const listQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.mine({ page: 1, limit: 50 }),
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      notificationsApi.send({
        title: form.title.trim(),
        body: form.body.trim(),
        event: form.event,
        ...(form.userIds.trim()
          ? { userIds: form.userIds.split(",").map((s) => s.trim()).filter(Boolean) }
          : {}),
      }),
    onSuccess: (data) => {
      const count = data?.data?.count ?? data?.count ?? "?";
      setFeedback({ ok: true, text: `Sent to ${count} user(s)` });
      setForm({ title: "", body: "", event: "admin_announcement", userIds: "" });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e) => setFeedback({ ok: false, text: apiError(e) }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const { items } = extractList(listQuery.data?.data ?? listQuery.data);
  const unread = items.filter((n) => !n.isRead && n.read !== true).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-2 text-slate-600">
            {items.length} notifications · {unread} unread · backed by FCM + device tokens
          </p>
        </div>
        <button
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
        >
          Mark all as read
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Send size={18} /> Send notification (admin)
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          POST /notifications/send — empty user list + admin_announcement broadcasts to all
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.event}
            onChange={(e) => setForm({ ...form, event: e.target.value })}
          >
            {EVENTS.map((ev) => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>
          <textarea
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm md:col-span-2"
            rows={3}
            placeholder="Body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm md:col-span-2"
            placeholder="User IDs, comma-separated (blank = broadcast for admin_announcement)"
            value={form.userIds}
            onChange={(e) => setForm({ ...form, userIds: e.target.value })}
          />
        </div>
        {feedback && (
          <p className={`mt-3 text-sm font-medium ${feedback.ok ? "text-emerald-600" : "text-red-600"}`}>
            {feedback.text}
          </p>
        )}
        <button
          onClick={() => sendMutation.mutate()}
          disabled={sendMutation.isPending || !form.title.trim() || !form.body.trim()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {sendMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          Send
        </button>
      </div>

      <div className="space-y-3">
        {listQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ) : (
          items.map((notif) => (
            <NotificationCard key={notif.id} notif={notif} />
          ))
        )}
        {!listQuery.isLoading && items.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No notifications yet
          </p>
        )}
      </div>
    </div>
  );
}

function NotificationCard({ notif }) {
  const navigate = useNavigate();
  const target = notificationTarget(notif);

  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm transition-all ${
        notif.isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"
      } ${target ? "cursor-pointer hover:shadow-lg" : ""}`}
      onClick={() => {
        if (target) navigate(target);
      }}
      role={target ? "button" : undefined}
      title={target ? `Open related info` : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Bell size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">{notif.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{notif.body}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock size={14} />
                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : notif.event || ""}
              </span>
              {notif.event && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">{notif.event}</span>
              )}
              {target && (
                <span className="inline-flex items-center gap-1 font-semibold text-blue-600">
                  View info <ArrowUpRight size={14} />
                </span>
              )}
            </div>
          </div>
        </div>
        {!notif.isRead && (
          <span onClick={(e) => e.stopPropagation()}>
            <MutationReadButton id={notif.id} />
          </span>
        )}
      </div>
    </div>
  );
}

function MutationReadButton({ id }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="rounded-lg p-2 transition-colors hover:bg-blue-100"
    >
      <Check size={18} className="text-blue-600" />
    </button>
  );
}
