import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Clock,
  Send,
  Loader2,
  ArrowUpRight,
  User,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, extractList, apiError } from "../../api";
import { notificationTarget } from "../../api/notificationTargets";

const EVENTS = [
  "admin_announcement",
];

export default function Notifications() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    body: "",
    event: "admin_announcement",
    userIds: "",
  });
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [search, setSearch] = useState("");

  const listQuery = useQuery({
    queryKey: ["admin-notifications", page, selectedEvent, search],
    queryFn: () =>
      notificationsApi.adminList({
        page,
        limit: 20,
        event: selectedEvent || undefined,
        search: search.trim() || undefined,
      }),
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      notificationsApi.send({
        title: form.title.trim(),
        body: form.body.trim(),
        event: form.event,
        ...(!isBroadcast && form.userIds.trim()
          ? {
              userIds: form.userIds
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : {}),
      }),
    onSuccess: (data) => {
      const count = data?.data?.count ?? data?.count ?? "?";
      setFeedback({ ok: true, text: `Dispatched to ${count} user(s)` });
      setForm({ title: "", body: "", event: "admin_announcement", userIds: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e) => setFeedback({ ok: false, text: apiError(e) }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const rawData = listQuery.data?.data ?? listQuery.data;
  const { items, total } = extractList(rawData);
  const unreadCount = rawData?.unreadCount ?? items.filter((n) => !n.isRead).length;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time platform notifications from database · {total} total · {unreadCount} unread
          </p>
        </div>
        <button
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          <Check size={16} />
          Mark all as read
        </button>
      </div>

      {/* Admin Announcement / Send Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Send size={18} className="text-primary" /> Send Announcement / Push Notification
          </h2>
          <span className="text-xs text-slate-500">POST /notifications/send</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Dispatch platform notifications backed by BullMQ queue, Redis retry logic, and Firebase Cloud Messaging (FCM).
        </p>

        <div className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              placeholder="Notification Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <select
              className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
            >
              {EVENTS.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            rows={3}
            placeholder="Notification Message / Body *"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />

          {/* Audience selection: Broadcast vs Specific Users */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  checked={isBroadcast}
                  onChange={() => setIsBroadcast(true)}
                  className="text-primary focus:ring-primary"
                />
                <Users size={16} className="text-slate-500" />
                Broadcast to all users
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  checked={!isBroadcast}
                  onChange={() => setIsBroadcast(false)}
                  className="text-primary focus:ring-primary"
                />
                <User size={16} className="text-slate-500" />
                Send to selected user IDs
              </label>
            </div>

            {!isBroadcast && (
              <div className="mt-3">
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Paste comma-separated user UUIDs (e.g. 550e8400-e29b-41d4-a716-446655440000)"
                  value={form.userIds}
                  onChange={(e) => setForm({ ...form, userIds: e.target.value })}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Multiple recipient IDs can be separated by commas.
                </p>
              </div>
            )}
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-4 rounded-xl p-3 text-sm font-medium ${
              feedback.ok
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <button
          onClick={() => sendMutation.mutate()}
          disabled={
            sendMutation.isPending ||
            !form.title.trim() ||
            !form.body.trim() ||
            (!isBroadcast && !form.userIds.trim())
          }
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {sendMutation.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
          {isBroadcast ? "Broadcast to All Users" : "Send to Selected Users"}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="Search notifications by title or message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none w-full sm:w-auto"
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            {EVENTS.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {listQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          items.map((notif) => (
            <NotificationCard key={notif.id} notif={notif} />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            <Bell size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No notifications found</p>
            <p className="text-slate-500 mt-1">
              {search || selectedEvent
                ? "Try clearing your filters to see more results."
                : "No notifications have been generated in the system yet."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm text-sm">
          <span className="text-slate-600">
            Page {page} of {totalPages} ({total} notifications)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-medium text-slate-700">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationCard({ notif }) {
  const navigate = useNavigate();
  const target = notificationTarget(notif);
  const recipient = notif.user;

  // Distinct badge styling per event type
  const eventColorMap = {
    admin_announcement: "bg-purple-100 text-purple-700 border-purple-200",
    application_update: "bg-blue-100 text-blue-700 border-blue-200",
    newMessage: "bg-indigo-100 text-indigo-700 border-indigo-200",
    new_job: "bg-emerald-100 text-emerald-700 border-emerald-200",
    project_assignment: "bg-amber-100 text-amber-700 border-amber-200",
    site_assignment: "bg-orange-100 text-orange-700 border-orange-200",
    attendance_event: "bg-teal-100 text-teal-700 border-teal-200",
    daily_report_submitted: "bg-cyan-100 text-cyan-700 border-cyan-200",
    project_update: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const badgeClass =
    eventColorMap[notif.event] ||
    "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all ${
        notif.isRead
          ? "border-slate-200 bg-white"
          : "border-blue-200 bg-blue-50/40"
      } ${target ? "hover:shadow-md cursor-pointer" : ""}`}
      onClick={() => {
        if (target) navigate(target);
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Bell size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">{notif.title}</h3>
              {notif.event && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${badgeClass}`}
                >
                  {notif.event}
                </span>
              )}
              {notif.isPushed && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  FCM Push
                </span>
              )}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  notif.isRead
                    ? "bg-slate-100 text-slate-600"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {notif.isRead ? "Read" : "Unread"}
              </span>
            </div>

            <p className="mt-1.5 text-sm text-slate-600 whitespace-pre-line leading-relaxed">
              {notif.body}
            </p>

            {/* Recipient User Information */}
            <div className="mt-3 flex flex-wrap items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2 text-xs border border-slate-100">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <User size={13} className="text-slate-400" />
                <span>
                  Recipient:{" "}
                  <strong className="text-slate-900">
                    {recipient?.fullName || recipient?.email || notif.userId || "Unknown"}
                  </strong>
                </span>
              </div>
              {recipient?.role && (
                <span className="rounded-md bg-blue-100/70 px-2 py-0.5 font-medium text-blue-800">
                  {recipient.role}
                </span>
              )}
              {recipient?.email && (
                <span className="text-slate-500 font-mono text-[11px]">
                  {recipient.email}
                </span>
              )}
              {recipient?.phone && (
                <span className="text-slate-500 font-mono text-[11px]">
                  {recipient.phone}
                </span>
              )}
              {notif.referenceId && (
                <span className="text-slate-400 text-[11px] ml-auto">
                  Ref: {notif.referenceId}
                </span>
              )}
            </div>

            {/* Timestamp and Target Link */}
            <div className="mt-2.5 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ""}
              </span>

              {target && (
                <span className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700">
                  View related info <ArrowUpRight size={13} />
                </span>
              )}
            </div>
          </div>
        </div>

        {!notif.isRead && (
          <span
            onClick={(e) => e.stopPropagation()}
            title="Mark as read"
          >
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="rounded-lg p-2 transition-colors hover:bg-blue-100 text-blue-600 disabled:opacity-50"
      title="Mark as read"
    >
      <Check size={18} />
    </button>
  );
}
